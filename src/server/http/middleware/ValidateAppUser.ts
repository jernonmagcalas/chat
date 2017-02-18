import { injectable } from 'chen/core';
import { HttpMiddleware, Request, Response, HttpException } from 'chen/web';
import { UserAppService } from 'app/services';

@injectable()
export class ValidateAppUser extends HttpMiddleware {

  public constructor (private userAppService: UserAppService) {
    super();
  }

  public async handle(request: Request, response: Response, next: Function) {
    let token = response.locals.token;
    await token.load('app');
    let userApp = await this.userAppService.findOne({
      user_id: request.param('user_id'), app_id: token.app.getId()
    });

    if (!userApp) {
      throw new HttpException(404);
    }

    response.locals.userApp = userApp;
    next();
  }
}
