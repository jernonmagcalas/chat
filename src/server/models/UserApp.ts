import { Model, Collection, field, FieldTypes, Relations } from 'chen/sql';
import { User, App, AccessLevel } from 'app/models';

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

  @Relations.belongsTo('user_id')
  public user: User;

  @Relations.belongsTo('app_id')
  public app: App;

  @Relations.belongsTo('access_level_id')
  public accessLevel: AccessLevel;
}

export class UserAppCollection extends Collection<UserApp> {

  protected modelClass = UserApp;
}
