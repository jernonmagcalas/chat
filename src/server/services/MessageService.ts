import { injectable, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import { Message, MessageCollection, Guest, User } from 'app/models';
import { UserService, GuestService, ChatRoomUserService } from 'app/services';
import { SocketIO } from 'chen/web';

@injectable()
export class MessageService extends Service<Message> {

  protected modelClass = Message;

  constructor(private userService: UserService, private guestService: GuestService,
              private chatRoomUserService: ChatRoomUserService, private socket: SocketIO) {
    super();
  }

  /**
   * Create a message
   * @param data
   * @returns {Message}
   */
  public async create(data: KeyValuePair<any>): Promise<Message> {
    let create = super.create;
    return this.transaction<Message>(async function(this) {
      this.validate(data, {
        chat_room_id: ['required'],
        sender: ['required']
      });

      let sender = data['sender'];
      delete ['sender'];

      data['origin_id'] = sender.getId();
      data['origin'] = sender instanceof Guest ? 'guests' : 'users';

      if (!data['file'] && !data['content']) {
        throw new ValidatorException({ content: ['Content cannot be empty .'] })
      }

      // check if the user is part of chat room
      if (data['origin'] instanceof User) {
        if (!await this.chatRoomUserService.isMember(data['chat_room_id'], sender)) {
          throw new ValidatorException({ content: ['You are not member of the chat room'] })
        }
      }

      let message = await create.call(this, {
        chat_room_id: data['chat_room_id'],
        origin_id: data['origin_id'],
        origin: data['origin'],
        content: data['content'],
        link_id: data['link_id']
      });

      message.set('originData', sender);

      await this.chatRoomUserService.newMessageUpdate(message, sender);
      this.socket.to(`chat-rooms@${message.chatRoomId.valueOf()}`).emit('new-message', message);

      return message;
    });
  }

  public async loadOriginData(collection: MessageCollection): Promise<MessageCollection> {
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

}
