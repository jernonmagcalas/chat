import { Controller, Request, Response } from 'chen/web';
import { injectable, ValidatorException } from 'chen/core';
import { MessageService, GuestService } from 'app/services';
import { ChatRoom, MessageCollection } from 'app/models';

@injectable()
export class MessageController extends Controller {

  constructor(private messageService: MessageService, private guestService: GuestService) {
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
    let token = response.locals.token;
    await token.load('app');

    this.messageService.validate(data, {
      session_id: ['required']
    });

    data['origin'] = 'guests';

    let guest = await this.guestService.findOne({ session_id: data['session_id'] });

    if (!guest) {
      throw new ValidatorException({ session_id: ['Invalid session_id'] });
    }

    data['origin_id'] = guest.getId();
    data['chat_room_id'] = response.locals.chatRoom.getId();
    console.log(data);
    return response.json({ data: await this.messageService.create(data)});
  }

  public async reply(request: Request, response: Response) {

  }
}