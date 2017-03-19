import { Controller, Request, Response, SocketIO } from 'chen/web';
import { injectable } from 'chen/core';
import { UserService, GuestService, ChatRoomUserService, ChatRoomService } from 'app/services';

@injectable()
export class ChatRoomUserController extends Controller {

  constructor(private userService: UserService, private guestService: GuestService,
              private chatRoomUserService: ChatRoomUserService, private chatRoomService: ChatRoomService,
              private socket: SocketIO) {
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

  public async recentChatRooms(request: Request, response: Response) {
    let userId = request.param('user_id');
    let user = await this.userService.findOne({ id: userId });
    let chatRoomUsers = await this.chatRoomUserService.getRecentChatRoom(user);
    await chatRoomUsers.load('chatRoom');
    await this.chatRoomService.loadMembers(chatRoomUsers.getChatRooms(), 'guests');

    await chatRoomUsers.forEachAsync(async item => {
      let userTo = item.chatRoom.members[0];
      let userSocket = this.socket.getConnectedClients(`guests@${userTo.getId()}`);
      if (userSocket.length) {
        userTo.set('is_online', true);
      }

      this.socket.getConnectedClients(`users@${userId}`).forEach(socket => {
        socket.join(`online-status@${userTo.getId()}`);
      });
    });

    chatRoomUsers.forEach(item => {
      item.chatRoom.chatRoomUsers = null;
    });

    return response.json({ data: chatRoomUsers });
  }
}
