import { injectable, KeyValuePair } from 'chen/core';
import { Service } from 'chen/sql';
import { ChatRoomUser } from 'app/models';

/**
 * ChatRoomUser Service
 */
@injectable()
export class ChatRoomUserService extends Service<ChatRoomUser> {

  protected modelClass = ChatRoomUser;

  public constructor() {
    super();
  }

  public async create(data: KeyValuePair<any>): Promise<ChatRoomUser> {
    this.validate(data, {
      chat_room_id: ['required'],
      origin_id: ['required'],
      origin: ['required', 'in:users,guests']
    });

    return super.create(data);
  }
}
