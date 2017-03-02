import { Model, Collection, field, FieldTypes, Relations, virtual } from 'chen/sql';
import { User, File, ChatRoom, Link, Guest, MessageAudienceCollection } from 'app/models';
import { KeyValuePair } from 'chen/core';

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

  @virtual()
  public audience: KeyValuePair<any>[];

  public getAudienceAttribute() {
    return this.attributes['audience'];
  }

  @Relations.belongsTo('chat_room_id')
  public chatRoom: ChatRoom;

  @Relations.belongsTo('file_id')
  public file: File;

  @Relations.belongsTo('link_id')
  public link: Link;

  @Relations.hasMany('message_id')
  public messageAudience: MessageAudienceCollection;
}

export class MessageCollection extends Collection<Message> {

  protected modelClass = Message;
}
