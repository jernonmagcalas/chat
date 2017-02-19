import { Model, Collection, field, FieldTypes } from 'chen/sql';

export class Link extends Model {

  protected table = 'links';
  protected collectionClass = LinkCollection;

  @field()
  public id: FieldTypes.Number;

  @field()
  public url: FieldTypes.String;

  @field()
  public title: FieldTypes.String;

  @field()
  public content: FieldTypes.String;

  @field()
  public image: FieldTypes.String;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

}

export class LinkCollection extends Collection<Link> {

  protected modelClass = Link;
}
