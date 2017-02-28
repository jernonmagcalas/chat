import { field, FieldTypes, Relations, virtual, Model, Collection } from 'chen/sql';
import { TagCollection } from 'app/models';

export class User extends Model {

  protected table = 'users';
  protected collectionClass = UserCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public firstName: FieldTypes.String;

  @field()
  public lastName: FieldTypes.String;

  @field()
  public email: FieldTypes.String;

  @field()
  public username: FieldTypes.String;

  @field({ hidden: true })
  public password: FieldTypes.String;

  @field()
  public profilePic: FieldTypes.String;

  @virtual()
  public profilePics: FieldTypes.JSONObject;

  public getProfilePicsAttribute() {
    let pic = this.get('profile_pic');
    let pics: any = {};
    if (pic) {
      if (pic.indexOf('facebook') != -1) {

        pics.small = `${pic}?type=square`;
        pics.medium = `${pic}?type=normal`;
        pics.large = `${pic}?type=large`;

      } else if (pic.indexOf('licdn') != -1) {

        if (pic.indexOf('shrinknp') != -1) {
          pics.small = pic.replace(/\/shrinknp_\d+_\d+\//, '/shrinknp_45_45/');
          pics.medium = pic.replace(/\/shrinknp_\d+_\d+\//, '/shrinknp_200_200/');
          pics.large = pic.replace(/\/shrinknp_\d+_\d+\//, '/shrinknp_400_400/');
        } else {
          pics.small = pic.replace(/\/shrink_\d+_\d+\//, '/shrinknp_45_45/');
          pics.medium = pic.replace(/\/shrink_\d+_\d+\//, '/shrinknp_200_200/');
          pics.large = pic.replace(/\/shrink_\d+_\d+\//, '/shrinknp_400_400/');
        }

      } else {

        let parts = pic.split('.');
        let ext = `.${parts[parts.length-1]}`;

        pics.small = pic.replace(ext,`_50x50${ext}`);
        pics.medium = pic.replace(ext,`_250x250${ext}`);
        pics.large = pic.replace(ext,`_500x500${ext}`);
      }
    }

    return pics;
  }

  @field()
  public isActive: FieldTypes.Boolean;

  @field()
  public unreadCount: FieldTypes.Number;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

  @virtual()
  public isOnline: FieldTypes.Boolean;

  @virtual()
  public fullName: FieldTypes.String;

  /**
   * Get the full name if available else the username
   * @return {string}
   */
  public getFullNameAttribute(): string {
    if (this.get('first_name') && this.get('first_name').length) {
      return `${this.get('first_name')} ${this.get('last_name') || ''}`.trim();
    }

    return this.get('username');
  }

  public getIsOnlineAttribute() {
    return this.attributes['is_online'] ? true : false;
  }

  @Relations.belongsToMany('user_tags', 'user_id', 'tag_id')
  public tags: TagCollection;
}

export class UserCollection extends Collection<User> {

  protected modelClass = User;
}
