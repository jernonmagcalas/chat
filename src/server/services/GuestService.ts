import { injectable, KeyValuePair } from 'chen/core';
import { Service } from 'chen/sql';
import { Guest } from 'app/models';
import { UtilService } from 'app/services';

/**
 * Guest Service
 */
@injectable()
export class GuestService extends Service<Guest> {

  protected modelClass = Guest;

  public constructor(private utilService: UtilService) {
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

}
