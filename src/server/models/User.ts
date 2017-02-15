import { Model, Collection, field, FieldTypes } from 'chen/sql';

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

  @field({ hidden: true })
  public password: FieldTypes.String;

  @field()
  public profilePic: FieldTypes.String;

  @field()
  public isActive: FieldTypes.Boolean;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;
}

export class UserCollection extends Collection<User> {

  protected modelClass = User;
}
