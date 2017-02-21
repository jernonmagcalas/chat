import { Model, Collection, field, FieldTypes, Relations } from 'chen/sql';
import { User, Tag, App } from 'app/models';

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
  public unreadCount: FieldTypes.Number;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

  @Relations.belongsTo('user_id')
  public user: User;

  @Relations.belongsTo('tag_id')
  public tag: Tag;

  @Relations.belongsTo('app_id')
  public app: App;

}

export class UserTagCollection extends Collection<UserTag> {

  protected modelClass = UserTag;
}
