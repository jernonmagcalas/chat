import { Model, Collection, field, FieldTypes, virtual } from 'chen/sql';
import { User, Guest } from 'app/models';
export class MessageAudience extends Model {

  protected table = 'message_audience';
  protected collectionClass = MessageAudienceCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public messageId: FieldTypes.Number;

  @field()
  public originId: FieldTypes.Number;

  @field()
  public origin: FieldTypes.String;

  @virtual()
  public originData: User | Guest;

  public getOriginDataAttribute() {
    return this.attributes['originData'];
  }

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

}

export class MessageAudienceCollection extends Collection<MessageAudience> {

  protected modelClass = MessageAudience;
}
