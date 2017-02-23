import { Controller, Request, Response, HttpException, SocketIO } from 'chen/web';
import { injectable } from 'chen/core';
import { ChatRoomService, GuestService, ChatRoomUserService } from 'app/services';
import { AccessToken, ChatRoomUser, ChatRoomUserCollection } from 'app/models';

@injectable()
export class ChatRoomController extends Controller {

  constructor(private chatRoomService: ChatRoomService, private guestService: GuestService,
              private chatRoomUserService: ChatRoomUserService, private socket: SocketIO) {
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

    // get the guest chat room user
    chatRoom.set('chat_room_user', await this.chatRoomUserService.getGuestByChatRoom(chatRoom.getId()));

    await chatRoom.chatRoomUser.load('chatRoom');

    return response.json({ data: chatRoom});
  }

  public async show(request: Request, response: Response) {
    let id = request.param('id');
    let chatRoom = await this.chatRoomService.findOne({ id });

    await chatRoom.load('chatRoomUsers');

    return response.json({ data: chatRoom });
  }

  public async user(request: Request, response: Response) {
    let id = request.param('chat_room_id');
    let userId = request.param('user_id');
    let chatRoom = await this.chatRoomService.findOne({ id });

    // get the guest chat room user
    let chatRoomGuest: ChatRoomUser = await this.chatRoomUserService.getGuestByChatRoom(chatRoom.getId());

    // load the guest
    let collection = await this.chatRoomUserService.loadOriginData(new ChatRoomUserCollection([chatRoomGuest]));
    chatRoomGuest = collection.first();

    let chatRoomUser: ChatRoomUser = await this.chatRoomUserService.findOne({
      chat_room_id: chatRoom.getId(),
      origin_id: userId,
      origin: 'users'
    });

    chatRoomGuest.unreadCount = chatRoomUser.unreadCount;

    let userSocket = this.socket.getConnectedClients(`guests@${chatRoomGuest.originData.getId()}`);
    if (userSocket.length) {
      chatRoomGuest.originData.set('is_online', true);
    }

    this.socket.getConnectedClients(`users@${chatRoomUser.get('origin_id')}`).forEach(socket => {
      socket.join(`guests-online-status@${chatRoomGuest.originData['id']}`);
    });

    return response.json({ data: chatRoomGuest });
  }
}
