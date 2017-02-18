import { Model, Collection, field, FieldTypes } from 'chen/sql';

export class Guest extends Model {

  protected table = 'guests';
  protected collectionClass = GuestCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public appId: FieldTypes.Number;

  @field()
  public sessionId: FieldTypes.String;

  @field()
  public email: FieldTypes.String;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;
}

export class GuestCollection extends Collection<Guest> {

  protected modelClass = Guest;
}
