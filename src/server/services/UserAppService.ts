import { injectable } from 'chen/core';
import { Service } from 'chen/sql';
import { UserApp } from 'app/models';

/**
 * User App Service
 */
@injectable()
export class UserAppService extends Service<UserApp> {

  protected modelClass = UserApp;

  public constructor() {
    super();
  }
}
