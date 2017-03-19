import { Controller, Request, Response, SocketIO } from 'chen/web';
import { injectable } from 'chen/core';
import { UserService, GuestService, ChatRoomUserService, ChatRoomService } from 'app/services';
import { ChatRoom, ChatRoomCollection } from 'app/models';

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
    let options = {
      since: request.input.get('since', null),
      limit: request.input.get('limit', 10),
    };

    if (options['since']) {
      options['since'] = new Date(options['since']);
    }

    let chatRoomUsers = await this.chatRoomUserService.getRecentChatRoom(user, options);
    if (!chatRoomUsers.size) {
      return response.json({ data: [] });
    }

    await chatRoomUsers.load('chatRoom.tag');
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

  public async getDetailByChatRoomId(request: Request, response: Response) {
    let chatRoom: ChatRoom = response.locals.chatRoom;
    let userId = request.param('user_id');
    let user = await this.userService.findOne({ id: userId });

    let chatRoomUser = await this.chatRoomUserService.findOne({
      origin: 'users',
      origin_id: user.getId(),
      chat_room_id: chatRoom.getId()
    });

    await chatRoomUser.load('lastMessage');
    await chatRoom.load('tag');

    let collection = await this.chatRoomService.loadMembers(new ChatRoomCollection([chatRoom]), 'guests');

    chatRoomUser.chatRoom = collection.first();
    chatRoomUser.chatRoom.chatRoomUsers = null;

    let userTo = chatRoomUser.chatRoom.members[0];
    let userSocket = this.socket.getConnectedClients(`guests@${userTo.getId()}`);
    if (userSocket.length) {
      userTo.set('is_online', true);
    }

    this.socket.getConnectedClients(`users@${userId}`).forEach(socket => {
      socket.join(`online-status@${userTo.getId()}`);
    });

    return response.json({ data: chatRoomUser });
  }
}
