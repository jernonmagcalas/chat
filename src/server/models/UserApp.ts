import { Model, Collection, field, FieldTypes } from 'chen/sql';

export class UserApp extends Model {

  protected table = 'user_apps';
  protected collectionClass = UserAppCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public appId: FieldTypes.Number;

  @field()
  public userId: FieldTypes.Number;

  @field()
  public accessLevelId: FieldTypes.Number;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;
}

export class UserAppCollection extends Collection<UserApp> {

  protected modelClass = UserApp;
}
