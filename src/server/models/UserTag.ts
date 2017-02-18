import { Model, Collection, field, FieldTypes } from 'chen/sql';

export class UserTag extends Model {

  protected table = 'user_tags';
  protected collectionClass = UserTagCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public appId: FieldTypes.Number;

  @field()
  public userId: FieldTypes.Number;

  @field()
  public tagId: FieldTypes.Number;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;
}

export class UserTagCollection extends Collection<UserTag> {

  protected modelClass = UserTag;
}
