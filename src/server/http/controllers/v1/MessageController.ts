import { Controller, Request, Response } from 'chen/web';
import { injectable, ValidatorException } from 'chen/core';
import { MessageService, GuestService, UserService } from 'app/services';
import { ChatRoom, MessageCollection, User, Guest } from 'app/models';
import { MessageAudienceService } from 'app/services/MessageAudienceService';

@injectable()
export class MessageController extends Controller {

  constructor(private messageService: MessageService, private guestService: GuestService,
              private userService: UserService, private messageAudienceService: MessageAudienceService) {
    super();
  }

  /**
   * Get chat room messages
   * @param request
   * @param response
   * @returns {JSONResponse}
   */
  public async index(request: Request, response: Response) {
    let chatRoom: ChatRoom = response.locals.chatRoom;

    let keyword = request.input.get('keyword');
    let limit = request.input.get('limit') || 10;
    let sinceId = request.input.get('sinceId');

    let messages = await this.messageService.query(query => {
      query.where('chat_room_id', chatRoom.getId());

      if (keyword) {
        query.where('content', 'LIKE', `%${keyword}%`);
      }

      if (sinceId) {
        query.where('id', '<', sinceId)
      }

      query.orderBy('id', 'DESC');
      query.limit(limit);
    }).with('link').with('file').get() as MessageCollection;

    messages = await this.messageService.loadOriginData(messages);

    if (messages.size) {
      await messages.load('messageAudience');
      messages = await this.messageAudienceService.loadAudience(messages);
    }

    return response.json({ data: messages });
  }

  /**
   * Create a message
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async store(request: Request, response: Response) {
    let data = request.input.all();
    let { token, chatRoom } = response.locals;
    await token.load('app');

    this.messageService.validate(data, {
      session_id: ['required']
    });

    let guest = await this.guestService.findOne({ session_id: data['session_id'] });
    if (!guest) {
      throw new ValidatorException({ session_id: ['Invalid session_id'] });
    }

    data['chat_room_id'] = chatRoom.getId();
    data['app_id'] = token.app.getId();
    data['sender'] = guest;

    return response.json({ data: await this.messageService.create(data) });
  }

  public async reply(request: Request, response: Response) {
    let data = request.input.all();
    let { token, chatRoom } = response.locals;
    await token.load('app');

    this.messageService.validate(data, {
      user_id: ['required']
    });

    let user = await this.userService.findOne({ id: data['user_id'] });
    if (!user) {
      throw new ValidatorException({ user_id: ['Invalid user id'] });
    }

    data['chat_room_id'] = chatRoom.getId();
    data['app_id'] = token.app.getId();
    data['sender'] = user;

    return response.json({ data: await this.messageService.create(data) });
  }

  public async seen(request: Request, response: Response) {
    let chatRoom: ChatRoom = response.locals.chatRoom;
    let data = request.input.all();
    let user: User | Guest;

    if (data['user_id']) {
      user = await this.userService.findOne({ id: data['user_id'] });
    }
    if (data['guest_id']) {
      user = await this.guestService.findOne({ id: data['guest_id'] });
    }

    if (!user) {
      throw new ValidatorException({ 'user_id': ['Invalid user.']});
    }

    if (!data['message_ids'] || !data['message_ids'].length) {
      return response.json({ data: null});
    }

    return response.json({ data: await this.messageService.seen(data['message_ids'], user, chatRoom) });
  }
}
