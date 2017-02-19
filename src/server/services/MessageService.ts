import { injectable, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import { Message, MessageCollection } from 'app/models';
import { UserService, GuestService } from 'app/services';

@injectable()
export class MessageService extends Service<Message> {

  protected modelClass = Message;

  constructor(private userService: UserService, private guestService: GuestService) {
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
        origin: ['required', 'in:users,guests'],
        origin_id: ['required']
      });

      if (!data['file'] && !data['content']) {
        throw new ValidatorException({ content: ['Content cannot be empty .'] })
      }

      let message = await create.call(this, {
        chat_room_id: data['chat_room_id'],
        origin_id: data['origin_id'],
        origin: data['origin'],
        content: data['content'],
        link_id: data['link_id']
      });

      return message;
    });
  }

  public async loadOriginData(collection: MessageCollection): Promise<MessageCollection> {
    // set origin data
    await collection.forEachAsync(async (n) => {
      let id = n.get('origin_id')
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
