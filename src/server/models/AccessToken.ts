import { Model, Collection, field, FieldTypes } from 'chen/sql';

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
}

export class AccessTokenCollection extends Collection<AccessToken> {

  protected modelClass = AccessToken;
}
