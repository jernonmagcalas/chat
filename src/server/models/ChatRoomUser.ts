import { Model, Collection, field, FieldTypes, Relations, virtual } from 'chen/sql';
import { User, ChatRoom, Guest, Message, ChatRoomCollection } from 'app/models';

export class ChatRoomUser extends Model {

  protected table = 'chat_room_users';
  protected collectionClass = ChatRoomUserCollection;

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
  public unreadCount: FieldTypes.Number;

  @field()
  public lastMessageId: FieldTypes.Number;

  @field()
  public lastMessageDate: FieldTypes.Date;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

  @Relations.belongsTo('chat_room_id')
  public chatRoom: ChatRoom;

  @Relations.belongsTo('last_message_id')
  public lastMessage: Message;

}

export class ChatRoomUserCollection extends Collection<ChatRoomUser> {

  protected modelClass = ChatRoomUser;

  public getChatRooms(): ChatRoomCollection {
    let collection = new ChatRoomCollection();
    this.forEach(item => {
      if (item.chatRoom) {
        collection.push(item.chatRoom);
      }
    });

    return collection;
  }
}
