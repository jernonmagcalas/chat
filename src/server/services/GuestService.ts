import { injectable, KeyValuePair } from 'chen/core';
import { Service } from 'chen/sql';
import { Guest } from 'app/models';
import { UtilService } from 'app/services';
import { SocketIO } from 'chen/web';

/**
 * Guest Service
 */
@injectable()
export class GuestService extends Service<Guest> {

  protected modelClass = Guest;

  public constructor(private utilService: UtilService, private socket: SocketIO) {
    super();
  }

  public async create(data: KeyValuePair<any>): Promise<Guest> {
    this.validate(data, {
      app_id: ['required']
    });

    while(true) {
      data['session_id'] = await this.utilService.generateSessionId();
      if (await this.findOne({ app_id: data['app_id'], session_id: data['session_id'] })) {
        continue;
      }

      break;
    }

    return await super.create(data);
  }

  /**
   * Set the unread count of a guest to 0
   * @param id
   * @return {Promise<boolean>}
   */
  public async markRead(id: string | number): Promise<boolean> {
    let success = this.update(id, { unread_count: 0 })
    if (success) {
      this.socket.to(`guests@${id}`).emit('guest-update', { unreadCount: 0 })
    }
    return success;
  }
}
