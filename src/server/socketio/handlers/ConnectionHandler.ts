import { SocketIOHandler, Socket } from 'chen/web';
import { injectable } from 'chen/core';
import { Guest, User } from 'app/models';
import { ChatRoomUserService } from 'app/services';

@injectable()
export class ConnectionHandler extends SocketIOHandler {

  constructor(private chatRoomUserService: ChatRoomUserService) {
    super();
  }

  public async connection(socket: Socket) {
    let type = socket.request.input.get('type');
    let user: User | Guest;
    switch (type) {
      case 'users':
        user = (await socket.request.auth('ws').user()) as User;
        break;
      case 'guests':
        user = (await socket.request.auth('wsGuest').user()) as Guest;
        break;
    }

    if (user) {
      socket.data.set('id', user.getId());
      socket.data.set('origin', user instanceof User ? 'users' : 'guests');

      socket.join(`${user instanceof User ? 'users' : 'guests'}@${user.getId()}`);

      let chatRooms = await this.chatRoomUserService.find({
        origin: user instanceof User ? 'users' : 'guests',
        origin_id: user.getId()
      });

      if (chatRooms.size) {
        chatRooms.forEach(room => {
          console.log(room.get('chat_room_id'));
          socket.join(`chat-rooms@${room.get('chat_room_id')}`);
        });
      }

      user.set('is_online', true);
      socket.to(`online-status@${user.getId()}`).emit('online-status', user);
    }
  }
}
