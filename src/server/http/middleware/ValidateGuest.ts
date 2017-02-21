import { injectable } from 'chen/core';
import { HttpMiddleware, Request, Response, HttpException } from 'chen/web';
import { GuestService } from 'app/services';

@injectable()
export class ValidateGuest extends HttpMiddleware {

  public constructor (private guestService: GuestService) {
    super();
  }

  public async handle(request: Request, response: Response, next: Function) {
    let token = response.locals.token;
    if (!token.app) {
      await token.load('app');
    }
    let guest = await this.guestService.findOne({ id: request.param('guest_id'), app_id: token.app.getId() });
    if (!guest) {
      throw new HttpException(404);
    }

    response.locals.guest = guest;
    next();
  }
}
