import { injectable, KeyValuePair, Hash, File } from 'chen/core';
import { Service } from 'chen/sql';
import { User } from 'app/models';
import { UtilService, UserAppService } from 'app/services';
import * as mkdirp from 'mkdirp';

/**
 * User Service
 */
@injectable()
export class UserService extends Service<User> {

  protected modelClass = User;

  public constructor(private utilService: UtilService, private userAppService: UserAppService) {
    super();
  }

  public async create(data: KeyValuePair<any>): Promise<User> {
    this.validate(data, {
      email: ['required', 'email'],
    });

    if (data['profile_pic']) {
      let dir = `${this.context.app.basePath()}/uploads/profile_pic`;
      await new Promise(resolve => mkdirp(dir, resolve));
      let fileName = await this.utilService.generateCode();
      let type;
      try {
        type = data['profile_pic'].split(';').split(':')[0];
      } catch (e) {
        type = 'image/jpeg';
      }

      let file = await File.createFromBase64String(data['profile_pic'].split('base64,')[1], type, dir, fileName);
      data['profile_pic'] = `/uploads/profile_pic/${file.name}`;
    }

    if (data['password']) {
      data['password'] = await Hash.make(data['password']);
    }

    return await super.create(data);
  }

  public async createByApp(data: KeyValuePair<any>) {
    this.validate(data, {
      app_id: ['required'],
      access_level_id: ['required']
    });

    return this.transaction<User>(async function (this) {
      let user = await this.create(data);

      await this.userAppService.create({
        app_id: data['app_id'],
        user_id: user.getId(),
        access_level_id: data['access_level_id']
      });

      return user;
    });
  }
}
