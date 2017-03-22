import { injectable, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import { App, User, AccessLevel } from 'app/models';
import { UserService, UserAppService, UtilService, TagService } from 'app/services';
import { AccessLevelService } from 'app/services/AccessLevelService';

/**
 * App Service
 */
@injectable()
export class AppService extends Service<App> {

  protected modelClass = App;

  public constructor(private userService: UserService, private userAppService: UserAppService,
                     private accessLevelService: AccessLevelService, private utilService: UtilService,
                     private tagService: TagService) {
    super();
  }

  public async create(data: KeyValuePair<any>): Promise<App> {
    let create = super.create;
    return this.transaction<App>(async function(this) {
      this.validate(data, {
        name: ['required'],
        slug: ['required'],
      });

      if (!this.isValidSlug(data['slug'])) {
        throw new ValidatorException(
          {slug: ['Application slug should only contain small letters, numbers, dash or underscore.']}
        );
      }

      let app = await this.findOne({ slug: data['slug'] });
      if (app) {
        throw new ValidatorException({ slug: [`${data['slug']} already exists`]});
      }

      let user;
      if (!data['user_id'] && data['user']) {
        // get the user by email
        user = await this.userService.findOne({ email: data['user']['email']});
        if (!user) {
          user = await this.userService.create(data['user']);
        }

        data['user_id'] = user.getId();
      }

      // create the app
      data['key'] = await this.utilService.generateCode();
      data['secret'] = await this.utilService.generateCode();
      app = await create.call(this, data);

      // create the default access levels
      let accessLevels = await this.accessLevelService.createAppDefault(app.getId());

      // assign the app to the user
      await this.userAppService.create({
        user_id: data['user_id'],
        app_id: app.getId(),
        access_level_id: accessLevels.getOwnerLevel().getId()
      });

      // create a default channel for the app
      await this.tagService.create({
        app_id: app.getId(),
        name: 'General'
      });

      return app;
    });
  }

  public async getAdmin(appId: string | number): Promise<User> {
    let accessLevel = await this.accessLevelService.findOne({ app_id: appId, type: AccessLevel.OWNER });
    return this.userService.query(query => {
      query.select('users.*');
      query.innerJoin('user_apps', 'user_apps.user_id', 'users.id');

      query.where({ access_level_id: accessLevel.getId() });
    }).getOne();
  }

  private isValidSlug(string): boolean {
    var pattern = new RegExp(/^[a-z0-9\-\_]*$/g);
    if (!pattern.test(string)) {
      return false;
    }

    return true;
  }

  public async check(data: KeyValuePair<any>): Promise<KeyValuePair<any>> {
    this.validate(data, {
      slug: ['required']
    });

    if (!this.isValidSlug(data['slug'])) {
      throw new ValidatorException(
        {slug: ['Application slug should only contain small letters, numbers, dash or underscore.']}
      );
    }

    return await this.findOne({ slug: data['slug'] });
  }
}
