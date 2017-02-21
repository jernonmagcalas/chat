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
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;
}

export class GuestCollection extends Collection<Guest> {

  protected modelClass = Guest;
}
