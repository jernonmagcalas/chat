import { Model, Collection, field, FieldTypes, Relations } from 'chen/sql';
import { UserCollection } from 'app/models';

export class Tag extends Model {

  protected table = 'tags';
  protected collectionClass = TagCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public appId: FieldTypes.Number;

  @field()
  public name: FieldTypes.String;

  @field()
  public isActive: FieldTypes.Boolean;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

  @Relations.belongsToMany('user_tags', 'tag_id', 'user_id')
  public users: UserCollection;
}

export class TagCollection extends Collection<Tag> {

  protected modelClass = Tag;
}
