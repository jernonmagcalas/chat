import { injectable } from 'chen/core';
import { Service } from 'chen/sql';
import { AccessToken } from 'app/models';

/**
 * User Service
 */
@injectable()
export class AccessTokenService extends Service<AccessToken> {

  protected modelClass = AccessToken;

  public constructor() {
    super();
  }
}
