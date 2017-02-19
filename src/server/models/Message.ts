import { Model, Collection, field, FieldTypes, Relations, virtual } from 'chen/sql';
import { User, File, ChatRoom, Link, Guest } from 'app/models';

export class Message extends Model {

  protected table = 'messages';
  protected collectionClass = MessageCollection;

  @field()
  public id: FieldTypes.Number;

  @field()
  public chatRoomId: FieldTypes.Number;

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
  public content: FieldTypes.Text;

  @field()
  public fileId: FieldTypes.Number;

  @field()
  public linkId: FieldTypes.Number;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

  @Relations.belongsTo('chat_room_id')
  public chatRoom: ChatRoom;

  @Relations.belongsTo('file_id')
  public file: File;

  @Relations.belongsTo('link_id')
  public link: Link;
}

export class MessageCollection extends Collection<Message> {

  protected modelClass = Message;
}
