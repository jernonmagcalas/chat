import { Model, Collection, field, FieldTypes } from 'chen/sql';

export class AccessLevel extends Model {

  protected table = 'access_levels';
  protected collectionClass = AccessLevelCollection;

  public static OWNER: string = 'owner';
  public static STAFF: string = 'staff';

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public appId: FieldTypes.Number;

  @field()
  public name: FieldTypes.String;

  @field()
  public type: FieldTypes.String;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;
}

export class AccessLevelCollection extends Collection<AccessLevel> {

  protected modelClass = AccessLevel;

  public getOwnerLevel() {
    let owner;
    this.forEach(item => {
      if (item.type.valueOf() == AccessLevel.OWNER) {
        owner = item;
        return false;
      }
    });

    return owner;
  }
}
