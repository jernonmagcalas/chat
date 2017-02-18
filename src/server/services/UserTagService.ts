import { injectable, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import { UserTag } from 'app/models';
import { UserAppService } from 'app/services';

/**
 * User Tag Service
 */
@injectable()
export class UserTagService extends Service<UserTag> {

  protected modelClass = UserTag;

  public constructor(private userAppService: UserAppService) {
    super();
  }

  /**
   * Assign a user in a tag
   * @param data
   * @return {Promise<UserTag>}
   */
  public async create(data: KeyValuePair<any>): Promise<UserTag> {
    this.validate(data, {
      app_id: ['required'],
      user_id: ['required'],
      tag_id: ['required'],
    });

    let userTag = await this.findOne({
      app_id: data['app_id'],
      user_id: data['user_id'],
      tag_id: data['tag_id']
    });

    if (!userTag) {
      //verify that user exists in app users
      let userApp = await this.userAppService.findOne({ app_id: data['app_id'], user_id: data['user_id'] });

      if (!userApp) {
        throw new ValidatorException({
          user_id: ['User not found']
        });
      }

      userTag = await super.create(data);
    }

    return userTag;
  }

  /**
   * Remove a user in the tag
   * @param data
   * @return {Promise<boolean>}
   */
  public async remove(data: KeyValuePair<any>): Promise<Boolean> {
    this.validate(data, {
      app_id: ['required'],
      user_id: ['required'],
      tag_id: ['required'],
    });

    return !!this.query((query) => {
      query.where(data);
    }).delete();
  }
}
