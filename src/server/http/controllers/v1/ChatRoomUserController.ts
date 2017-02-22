import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';
import { UserService, GuestService, ChatRoomUserService } from 'app/services';

@injectable()
export class ChatRoomUserController extends Controller {

  constructor(private userService: UserService, private guestService: GuestService, private chatRoomUserService: ChatRoomUserService) {
    super();
  }

  public async markRead(request: Request, response: Response) {
    let { chatRoom } = response.locals;
    let user;
    if (request.input.get('user_id')) {
      user = await this.userService.findOne({ id: request.input.get('user_id') });
    }
    if (request.input.get('guest_id')) {
      user = await this.guestService.findOne({ id: request.input.get('guest_id') });
    }
    return response.json({ data: await this.chatRoomUserService.markRead(chatRoom.getId(), user) });
  }
}
