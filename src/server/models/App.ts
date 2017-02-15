import { Model, Collection, field, FieldTypes } from 'chen/sql';

export class App extends Model {

  protected table = 'apps';
  protected collectionClass = AppCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public name: FieldTypes.String;

  @field()
  public slug: FieldTypes.String;

  @field()
  public domain: FieldTypes.String;

  @field()
  public key: FieldTypes.String;

  @field()
  public secret: FieldTypes.String;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;
}

export class AppCollection extends Collection<App> {

  protected modelClass = App;
}
