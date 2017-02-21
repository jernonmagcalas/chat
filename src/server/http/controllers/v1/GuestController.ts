import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';
import { GuestService, ChatRoomUserService } from 'app/services';

@injectable()
export class GuestController extends Controller {

  constructor(private guestService: GuestService, private chatRoomUserService: ChatRoomUserService) {
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

  /**
   * Get guest list by tag
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async getByTag(request: Request, response: Response) {
    let { token, tag } = response.locals;
    await token.load('app');

    let guests = await this.chatRoomUserService.getGuestsByTag(tag.getId());

    guests = await this.chatRoomUserService.loadOriginData(guests);



    return response.json({ data: guests});
  }
}
