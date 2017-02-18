import { Model, Collection, field, FieldTypes, Relations } from 'chen/sql';
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

  @Relations.belongsToMany('user_tags', 'user_id', 'tag_id')
  public tags: TagCollection;
}

export class UserCollection extends Collection<User> {

  protected modelClass = User;
}
