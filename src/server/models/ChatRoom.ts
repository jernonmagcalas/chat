import { Model, Collection, field, FieldTypes, Relations, virtual } from 'chen/sql';
import { MessageCollection, ChatRoomUser, User, ChatRoomUserCollection, Tag } from 'app/models';

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

  @virtual()
  public chatRoomUser: ChatRoomUser;

  public getChatRoomUserAttribute() {
    return this.attributes['chat_room_user'];
  }

  @virtual()
  public members: User;

  public getMembersAttribute() {
    return this.attributes['members'];
  }

  @Relations.hasMany('chat_room_id')
  public messages: MessageCollection;

  @Relations.hasMany('chat_room_id')
  public chatRoomUsers: ChatRoomUserCollection;

  @Relations.belongsTo('tag_id')
  public tag: Tag;

}

export class ChatRoomCollection extends Collection<ChatRoom> {

  protected modelClass = ChatRoom;

  public getChatRoomUsers(): ChatRoomUserCollection {
    let collection = new ChatRoomUserCollection();
    this.forEach(item => {
      if (item.chatRoomUsers && item.chatRoomUsers.size) {
        item.chatRoomUsers.forEach(item => {
          collection.push(item);
        });
      }
    });

    return collection;
  }
}
