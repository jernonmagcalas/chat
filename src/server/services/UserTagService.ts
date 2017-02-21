import { injectable, KeyValuePair } from 'chen/core';
import { Service } from 'chen/sql';
import { UserTag, AccessLevel } from 'app/models';
import { UserAppService, UserService, AccessLevelService, AppService } from 'app/services';

/**
 * User Tag Service
 */
@injectable()
export class UserTagService extends Service<UserTag> {

  protected modelClass = UserTag;

  public constructor(private userAppService: UserAppService, private userService: UserService,
                     private accessLevelService: AccessLevelService, private appService: AppService) {
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
      tag_id: ['required'],
      email: ['required', 'email']
    });

    let user = await this.userService.findOne({ email: data['email'] });

    if (!user) {
      let accessLevel = await this.accessLevelService.findOne({ app_id: data['app_id'], type: AccessLevel.STAFF });
      data['access_level_id'] = accessLevel.getId();
      user = await this.userService.createByApp(data);
    }

    let userTag = await this.findOne({
      app_id: data['app_id'],
      user_id: user.getId(),
      tag_id: data['tag_id']
    });

    if (!userTag) {
      //verify that user exists in app users
      let userApp = await this.userAppService.findOne({ app_id: data['app_id'], user_id: user.getId() });

      if (!userApp) {
        // assign the user in the app
        let accessLevel = await this.accessLevelService.findOne({ app_id: data['app_id'], type: AccessLevel.STAFF });
        await this.userAppService.create({
          app_id: data['app_id'],
          user_id: user.getId(),
          access_level_id: accessLevel.getId()
        });
      }

      // as of now we will only limit the user in a tag to admin and one staff
      let admin = await this.appService.getAdmin(data['app_id']);
      let usertags = await this.query(query => {
        query.whereNot({ user_id: admin.getId() });
      }).get();

      // remove other users except the admin
      await usertags.forEachAsync(async (user) => {
        await this.remove({
          app_id: data['app_id'],
          user_id: user.get('user_id'),
          tag_id: data['tag_id']
        });
      });

      // assign the user in the tag
      userTag = await super.create({
        app_id: data['app_id'],
        user_id: user.getId(),
        tag_id: data['tag_id']
      });

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
