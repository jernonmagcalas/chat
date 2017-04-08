import { injectable, KeyValuePair } from 'chen/core';
import { Service, QueryBuilder } from 'chen/sql';
import { ChatRoomUser, ChatRoomUserCollection, User, Guest } from 'app/models';
import { UserService, GuestService, UserTagService } from 'app/services';
import { SocketIO } from 'chen/web';

/**
 * ChatRoomUser Service
 */
@injectable()
export class ChatRoomUserService extends Service<ChatRoomUser> {

  protected modelClass = ChatRoomUser;

  public constructor(private userService: UserService, private guestService: GuestService,
                     private socket: SocketIO, private userTagService: UserTagService) {
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
      query.orderBy('last_message_date', 'DESC');
    }).get() as Promise<ChatRoomUserCollection>;
  }

  /**
   * Update users inside chat room for new message
   * @param message
   * @param sender
   * @return {Promise<number>}
   */
  public async newMessageUpdate(message, sender: Guest | User, appId: string | number): Promise<void> {
    // update the last message date in the chat room
    await this.query(query => {
      query.where({
        chat_room_id: message.get('chat_room_id')
      });
    }).update({
      last_message_date: new Date(),
      last_message_id: message.getId()
    });

    // increment notification
    await this.query(query => {
      query.where({
        chat_room_id: message.get('chat_room_id')
      });

      query.whereNot({
        origin_id: sender.getId(),
        origin: sender instanceof Guest ? 'guests' : 'users',
      });

    }).increment('unread_count', 1);

    // increment users unread count
    await this.query(query => {
      query.joinRaw('INNER JOIN `users` on users.id = chat_room_users.origin_id AND chat_room_users.origin = "users"');
      query.where({
        'chat_room_users.chat_room_id': message.get('chat_room_id')
      });

      query.whereNot({
        'chat_room_users.origin_id': sender.getId(),
        'chat_room_users.origin': sender instanceof Guest ? 'guests' : 'users',
      });

    }).increment('users.unread_count', 1);

    // increment guests unread count
    await this.query(query => {
      query.joinRaw('INNER JOIN `guests` on guests.id = chat_room_users.origin_id AND chat_room_users.origin = "guests"');
      query.where({
        'chat_room_users.chat_room_id': message.get('chat_room_id')
      });

      query.whereNot({
        'chat_room_users.origin_id': sender.getId(),
        'chat_room_users.origin': sender instanceof Guest ? 'guests' : 'users',
      });

    }).increment('guests.unread_count', 1);


    // increment tag unread count
    await this.userTagService.query(query => {
      if (sender instanceof User) {
        query.whereNot({ user_id: sender.getId() });
      }

      query.where({ app_id: appId, tag_id: message.chatRoom.get('tag_id') });
    }).increment('unread_count', 1);

    return;
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


  public async getGuestByChatRoom(chatRoomId?: string | number): Promise<ChatRoomUser> {
    return this.query(query => {
      query.where({
        'origin': 'guests',
        'chat_room_id': chatRoomId
      });
    }).with('lastMessage').getOne();
  }

  /**
   * Get recent chatrooms for a user
   * @param userId
   * @param options
   * @return {Promise<Collection<ChatRoomUser>>}
   */
  public async getRecentChatRoom(
    user: User | Guest,
    options: { limit?: number, since?: Date } = { limit: 10 }
  ): Promise<ChatRoomUserCollection> {
    let list = await this.query((query: QueryBuilder) => {
      query.select('chat_room_users.*');
      query.innerJoin('chat_rooms', 'chat_rooms.id', 'chat_room_id');
      query.leftJoin('messages', 'chat_room_users.last_message_id', 'messages.id');
      query.where({
        'chat_room_users.origin': user instanceof User ? 'users' : 'guests',
        'chat_room_users.origin_id': user.getId()
      });

      query.where(function () {
        this.whereNotNull('chat_room_users.last_message_id');
      });

      query.orderBy('messages.created_at', 'DESC');
      if (options['since']) {
        query.where('messages.created_at', '<', options['since'])
      }

      query.limit(options['limit']);
    }).with('lastMessage')
      .get() as ChatRoomUserCollection;
    return list;
  }
}
