import { Model, Collection, field, FieldTypes } from 'chen/sql';

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
}

export class TagCollection extends Collection<Tag> {

  protected modelClass = Tag;
}
