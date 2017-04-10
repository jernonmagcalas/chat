import { injectable, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import { Tag, TagCollection, User, Guest } from 'app/models';
import { UserTagService, AppService, ChatRoomUserService } from 'app/services';

/**
 * Tag Service
 */
@injectable()
export class TagService extends Service<Tag> {

  protected modelClass = Tag;

  public constructor(private appService: AppService, private userTagService: UserTagService,
                     private chatRoomUserService: ChatRoomUserService) {
    super();
  }

  public async create(data: KeyValuePair<any>): Promise<Tag> {
    this.validate(data, {
      app_id: ['required'],
      name: ['required'],
    });

    if (!this.isValidName(data['name'])) {
      throw new ValidatorException(
        {name: ['Tag Name should only contain letters, numbers, dash or underscore.']}
      );
    }

    let tag = await super.create(data);

    // assign the admin in the tag
    let admin = await this.appService.getAdmin(data['app_id']);
    await this.userTagService.create({
      app_id: data['app_id'],
      tag_id: tag.getId(),
      email: admin.get('email')
    });

    return tag;
  }

  public async update(id: string | number, data: KeyValuePair<any>): Promise<boolean> {
    this.validate(data, {
      name: ['required']
    });

    if (data['name'] && !this.isValidName(data['name'])) {
      throw new ValidatorException(
        {name: ['Tag Name should only contain letters, numbers, dash or underscore.']}
      );
    }

    return super.update(id, data);
  }

  public async loadChatRooms(tags: TagCollection, user: User | Guest): Promise<TagCollection> {
    // TODO: optimise
    await tags.forEachAsync(async tag => {
      let chatRoomUser = await this.chatRoomUserService.query(query => {
        query.select('chat_room_users.*');
        query.innerJoin('chat_rooms', 'chat_rooms.id', 'chat_room_users.chat_room_id');

        query.where({
          'chat_rooms.tag_id': tag.getId(),
          'chat_room_users.origin_id': user.getId(),
          'chat_room_users.origin': user instanceof User ? 'users' : 'guests',
        });

      }).with('chatRoom').with('lastMessage').getOne();

      if (chatRoomUser) {
        tag.set('chat_room_user', chatRoomUser);
      }
    });

    return tags;
  }

  private isValidName(string): boolean {
    var pattern = new RegExp(/^[a-zA-Z0-9\-\_]*$/g);
    if (!pattern.test(string)) {
      return false;
    }

    return true;
  }
}
