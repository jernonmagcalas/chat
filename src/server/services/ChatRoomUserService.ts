import { injectable, KeyValuePair } from 'chen/core';
import { Service } from 'chen/sql';
import { ChatRoomUser, ChatRoomUserCollection, User, Guest } from 'app/models';
import { UserService, GuestService } from 'app/services';
import { SocketIO } from 'chen/web';

/**
 * ChatRoomUser Service
 */
@injectable()
export class ChatRoomUserService extends Service<ChatRoomUser> {

  protected modelClass = ChatRoomUser;

  public constructor(private userService: UserService, private guestService: GuestService,
                     private socket: SocketIO) {
    super();
  }

  public async create(data: KeyValuePair<any>): Promise<ChatRoomUser> {
    this.validate(data, {
      chat_room_id: ['required'],
      origin_id: ['required'],
      origin: ['required', 'in:users,guests']
    });

    // join in the socket
    this.socket.getConnectedClients(`${data['origin']}@${data['origin_id']}`).forEach(socket => {
      socket.join(`chat-rooms@${data['chat_room_id']}`);
    });

    return super.create(data);
  }

  public async getGuestsByTag(tagId: string | number): Promise<ChatRoomUserCollection> {
    return this.query(query => {
      query.select('chat_room_users.*');
      query.innerJoin('chat_rooms', 'chat_rooms.id', 'chat_room_users.chat_room_id');

      query.where({
        'chat_rooms.tag_id': tagId,
        'chat_room_users.origin': 'guests'
      });

      query.whereNotNull('last_message_date');
      query.orderBy('last_message_date');
    }).get() as Promise<ChatRoomUserCollection>;
  }

  /**
   * Update users inside chat room for new message
   * @param message
   * @param sender
   * @return {Promise<number>}
   */
  public async newMessageUpdate(message, sender: Guest | User): Promise<number> {
    // update the last message date in the chat room
    await this.query(query => {
      query.where({
        chat_room_id: message.get('chat_room_id'),
        origin_id: sender.getId(),
        origin: sender instanceof Guest ? 'guests' : 'users',
      });
    }).update({
      last_message_date: new Date()
    });

    // increment notification
    return this.query(query => {
      query.where({
        chat_room_id: message.get('chat_room_id')
      });

      query.whereNot({
        origin_id: sender.getId(),
        origin: sender instanceof Guest ? 'guests' : 'users',
      });

    }).increment('unread_count', 1);
  }

  public async isMember(chatRoomId: string | number, user: Guest | User): Promise<boolean> {
    return !! (await this.findOne({
      chat_room_id: chatRoomId,
      origin_id: user.getId(),
      origin: user instanceof Guest ? 'guests' : 'users'
    }));
  }

  public async loadOriginData(collection: ChatRoomUserCollection): Promise<ChatRoomUserCollection> {
    // set origin data
    await collection.forEachAsync(async (n) => {
      let id = n.get('origin_id');
      switch (n.get('origin')) {
        case 'users':
          n.set('originData', await this.userService.findOne({ id }));
          break;
        case 'guests':
          n.set('originData', await this.guestService.findOne({ id }));
          break;
      }
    });
    return collection;
  }

  public async markRead(chatRoomId: string | number, user: Guest | User): Promise<number> {
    let type = user instanceof User ? 'users' : 'guests';

    let model = await this.findOne({
      chat_room_id: chatRoomId,
      origin_id: user.getId(),
      origin: type
    });

    if (!model) {
      return 0;
    }

    model.unreadCount = 0;
    await model.save();
    this.socket.to(`${type}@${user.getId()}`).emit('chat-room-user-update', model);
  }
}
