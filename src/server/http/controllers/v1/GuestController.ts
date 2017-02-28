import { Controller, Request, Response, SocketIO } from 'chen/web';
import { injectable } from 'chen/core';
import { GuestService, ChatRoomUserService, UserService } from 'app/services';
import { ChatRoomUserCollection } from 'app/models';

@injectable()
export class GuestController extends Controller {

  constructor(private guestService: GuestService, private chatRoomUserService: ChatRoomUserService,
              private userService: UserService, private socket: SocketIO) {
    super();
  }

  /**
   * List guests by app
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async index(request: Request, response: Response) {
    let token = response.locals.token;
    await token.load('app');

    return response.json({ data: await this.guestService.find({ app_id: token.app.getId() })});
  }

  /**
   * Create a guest for an app
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async store(request: Request, response: Response) {
    let data = request.input.all();
    let token = response.locals.token;
    await token.load('app');
    data['app_id'] = token.app.getId();
    return response.json({ data: await this.guestService.create(data)});
  }

  public async update(request: Request, response: Response) {
    let email = request.input.get('email');
    let data = { email };

    return response.json({ data: await this.guestService.update(request.param('id'), data) })
  }

  /**
   * Get Guest detail
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async show(request: Request, response: Response) {
    let id = request.param('id');

    return response.json({ data: await this.guestService.findOne({ id }) })
  }

  /**
   * Get guest list by tag
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async getByTag(request: Request, response: Response) {
    let { token, tag } = response.locals;
    await token.load('app');

    let user = await this.userService.findOne({ id: request.param('user_id') });

    let guests: ChatRoomUserCollection = await this.chatRoomUserService.getGuestsByTag(tag.getId());
    guests = await this.chatRoomUserService.loadOriginData(guests);

    let ids = [];
    guests.forEach(guest => {
      ids.push(guest.get('chat_room_id'));
    });

    let chatRoomUsers = new ChatRoomUserCollection();
    if (ids) {
      chatRoomUsers = await this.chatRoomUserService.query(query => {
        query.whereIn('chat_room_id', ids);
        query.where({ origin_id: user.getId(), origin: 'users' })
      }).get() as ChatRoomUserCollection;
    }

    chatRoomUsers.forEach(item => {
      guests.forEach(guest => {
        if (guest.get('chat_room_id') == item.get('chat_room_id')) {
          guest.unreadCount = item.unreadCount;
          return false;
        }
      });
    });

    // set online status
    guests.forEach(guest => {
      let userSocket = this.socket.getConnectedClients(`guests@${guest.originData.getId()}`);
      if (userSocket.length) {
        guest.originData.set('is_online', true);
      }

      this.socket.getConnectedClients(`users@${user.getId()}`).forEach(socket => {
        socket.join(`guests-online-status@${guest.originData['id']}`);
      });
    });

    return response.json({ data: guests });
  }

  public async markRead(request: Request, response: Response) {
    let id = request.param('guest_id');

    return response.json({ data: await this.guestService.markRead(id)})
  }
}
