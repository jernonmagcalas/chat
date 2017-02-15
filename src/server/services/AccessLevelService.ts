import { injectable } from 'chen/core';
import { Service } from 'chen/sql';
import { AccessLevel, AccessLevelCollection } from 'app/models';

/**
 * User Service
 */
@injectable()
export class AccessLevelService extends Service<AccessLevel> {

  protected modelClass = AccessLevel;

  public constructor() {
    super();
  }

  public async createAppDefault(appId: string | number): Promise<AccessLevelCollection> {
    let accessLevels = new AccessLevelCollection();

    accessLevels.push(await this.create({
      app_id: appId,
      name: 'Owner',
      type: AccessLevel.OWNER
    }));

    accessLevels.push(await this.create({
      app_id: appId,
      name: 'Staff',
      type: AccessLevel.STAFF
    }));

    return accessLevels;
  }
}
