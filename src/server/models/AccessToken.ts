import { Model, Collection, field, FieldTypes, Relations } from 'chen/sql';
import { User, App } from 'app/models';

export class AccessToken extends Model {

  protected table = 'access_tokens';
  protected collectionClass = AccessTokenCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public token: FieldTypes.String;

  @field()
  public userId: FieldTypes.Number;

  @field()
  public appId: FieldTypes.Number;

  @field()
  public scope: FieldTypes.String;

  @field()
  public expiration: FieldTypes.Date;

  @field()
  public isActive: FieldTypes.Boolean;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

  public isAppToken() {
    return this.userId ? false : true;
  }

  @Relations.belongsTo('user_id')
  public user: User;

  @Relations.belongsTo('app_id')
  public app: App;
}

export class AccessTokenCollection extends Collection<AccessToken> {

  protected modelClass = AccessToken;
}
