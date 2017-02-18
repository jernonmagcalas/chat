import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';
import { TagService } from 'app/services';

@injectable()
export class TagController extends Controller {

  constructor(private tagService: TagService) {
    super();
  }

  /**
   * List tags by app
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async index(request: Request, response: Response) {
    let token = response.locals.token;
    await token.load('app');

    return response.json({ data: await this.tagService.find({ app_id: token.app.getId() })});
  }

  /**
   * Create a tag for an app
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async store(request: Request, response: Response) {
    let data = request.input.all();
    let token = response.locals.token;
    await token.load('app');
    data['app_id'] = token.app.getId();
    return response.json({ data: await this.tagService.create(data)});
  }
}
