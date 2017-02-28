import { field, FieldTypes, virtual, Model, Collection } from 'chen/sql';

export class Guest extends Model {

  protected table = 'guests';
  protected collectionClass = GuestCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public appId: FieldTypes.Number;

  @field()
  public sessionId: FieldTypes.String;

  @field()
  public email: FieldTypes.String;

  @field()
  public unreadCount: FieldTypes.Number;

  @virtual()
  public isOnline: FieldTypes.Boolean;

  public getIsOnlineAttribute() {
    return this.attributes['is_online'] ? true : false;
  }

  @virtual()
  public fullName: FieldTypes.String;

  public getFullNameAttribute() {
    return `Guest${this.attributes['id']}`;
  }

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
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;
}

export class GuestCollection extends Collection<Guest> {

  protected modelClass = Guest;
}
