import { injectable, KeyValuePair } from 'chen/core';
import { Service } from 'chen/sql';
import { AccessToken } from 'app/models';
import { UtilService } from 'app/services';

/**
 * User Service
 */
@injectable()
export class AccessTokenService extends Service<AccessToken> {

  protected modelClass = AccessToken;

  public constructor(private utilService: UtilService) {
    super();
  }

  public async create(data: KeyValuePair<any>): Promise<AccessToken> {
    data['token'] = await this.utilService.generateToken();
    data['expiration'] = new Date();
    // token will expire for 30 days
    data['expiration'].setHours(data['expiration'].getHours() + 720);

    return super.create(data);
  }
}
