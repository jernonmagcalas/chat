import { Model, Collection, field, FieldTypes, Relations } from 'chen/sql';
import { MessageCollection } from 'app/models';

export class ChatRoom extends Model {

  protected table = 'chat_rooms';
  protected collectionClass = ChatRoomCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public tagId: FieldTypes.Number;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

  @Relations.hasMany('chat_room_id')
  public messages: MessageCollection;
}

export class ChatRoomCollection extends Collection<ChatRoom> {

  protected modelClass = ChatRoom;
}
