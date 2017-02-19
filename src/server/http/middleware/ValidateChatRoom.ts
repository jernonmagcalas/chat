import { injectable } from 'chen/core';
import { HttpMiddleware, Request, Response, HttpException } from 'chen/web';
import { ChatRoomService } from 'app/services';

@injectable()
export class ValidateChatRoom extends HttpMiddleware {

  public constructor (private chatRoomService: ChatRoomService) {
    super();
  }

  /**
   * Guest Message in chat room
   * @param request
   * @param response
   * @param next
   * @return {Promise<void>}
   */
  public async handle(request: Request, response: Response, next: Function) {
    let token = response.locals.token;
    await token.load('app');
    let chatRoom = await this.chatRoomService.findOne({ id: request.param('chat_room_id') });
    if (!chatRoom) {
      throw new HttpException(404);
    }

    response.locals.chatRoom = chatRoom;
    next();
  }
}
