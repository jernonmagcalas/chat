import { Controller, Request, Response, HttpException } from 'chen/web';
import { injectable } from 'chen/core';
import { ChatRoomService, GuestService } from 'app/services';
import { AccessToken } from 'app/models';

@injectable()
export class ChatRoomController extends Controller {

  constructor(private chatRoomService: ChatRoomService, private guestService: GuestService) {
    super();
  }

  public async getGuestChatRoom(request: Request, response: Response) {
    let tag = response.locals.tag;
    let token: AccessToken = response.locals.token;
    let guest = await this.guestService.findOne({ session_id: request.param('session_id'), app_id: token.get('app_id') });

    if (!guest) {
      throw new HttpException(404, 'Guest not found');
    }

    let chatRoom = await this.chatRoomService.createGuestChatRoom({
      tag_id: tag.getId(),
      guest_id: guest.getId()
    });

    return response.json({ data: chatRoom});
  }
}
