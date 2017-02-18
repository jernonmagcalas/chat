import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';
import { UserTagService } from 'app/services';
import { UserApp } from 'app/models';

@injectable()
export class UserTagController extends Controller {

  constructor(private userTagService: UserTagService) {
    super();
  }

  /**
   * List Tags by user
   * @param request
   * @param response
   * @return {Promise<void>}
   */
  public async index(request: Request, response: Response) {
    let userApp: UserApp = response.locals.userApp;
    await userApp.load('user');
    await userApp.user.load('tags');
    return response.json({ data: userApp.user.tags });
  }

  /**
   * Assign a user in a tag
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async store(request: Request, response: Response) {
    let token = response.locals.token;
    if (!token.app) {
      await token.load('app');
    }

    let args = {
      app_id: token.app.getId(),
      user_id: request.param('user_id'),
      tag_id: response.locals.tag.getId()
    };

    return response.json({ data: await this.userTagService.create(args)});
  }
}
