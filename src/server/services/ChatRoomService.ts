import { injectable, KeyValuePair } from 'chen/core';
import { Service } from 'chen/sql';
import { ChatRoom } from 'app/models';
import { ChatRoomUserService, TagService } from 'app/services';

/**
 * ChatRoom Service
 */
@injectable()
export class ChatRoomService extends Service<ChatRoom> {

  protected modelClass = ChatRoom;

  public constructor(private chatRoomUserService: ChatRoomUserService, private tagService: TagService) {
    super();
  }

  /**
   * Create a chat room for the guest
   * @param data
   * @return {Promise<any>}
   */
  public async createGuestChatRoom(data: KeyValuePair<any>): Promise<ChatRoom> {
    this.validate(data, {
      guest_id: ['required'],
      tag_id: ['required']
    });

    let tag = await this.tagService.findOne({ id: data['tag_id'] });

    // find if exist
    let chatRoom = await this.query(query => {
      query.select('chat_rooms.*');
      query.innerJoin('chat_room_users as cru', 'cru.chat_room_id', 'chat_rooms.id');

      query.where('chat_rooms.tag_id', data['tag_id']);
      query.where('cru.origin_id', data['guest_id']);
      query.where('cru.origin', 'guests');
    }).getOne();

    if (chatRoom) {
      return chatRoom;
    }

    // create new one
    return this.transaction<ChatRoom>(async function (this) {
      // create a chat room
      let chatRoom = await this.create({
        tag_id: data['tag_id']
      });

      // join the guest
      await this.chatRoomUserService.create({
        chat_room_id: chatRoom.getId(),
        origin_id: data['guest_id'],
        origin: 'guests'
      });

      // join the users assign in the tag
      await tag.load('users');
      if (tag.users) {
        await tag.users.forEachAsync(async user => {
          await this.chatRoomUserService.create({
            chat_room_id: chatRoom.getId(),
            origin_id: user.getId(),
            origin: 'users'
          });
        });
      }

      return chatRoom;
    });
  }

  public async loadUsers() {

  }
}
