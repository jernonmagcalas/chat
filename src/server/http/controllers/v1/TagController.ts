import { Controller, Request, Response, HttpException } from 'chen/web';
import { injectable, ValidatorException } from 'chen/core';
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

    return response.json({ data: await this.tagService.find({ is_active: true, app_id: token.app.getId() })});
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

    let tag = await this.tagService.findOne({ app_id: token.app.getId(), name: data['name'] });
    if (tag) {
      throw new ValidatorException({ name: ['Already exists'] });
    }

    return response.json({ data: await this.tagService.create(data)});
  }

  /**
   * Tag Detail
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async show(request: Request, response: Response) {
    let token = response.locals.token;
    await token.load('app');

    return response.json({
      data: await this.tagService.findOne({ app_id: token.app.getId(), id: request.param('id') })
    });
  }

  /**
   * Create a update for an app
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async update(request: Request, response: Response) {
    let data = request.input.all();
    let token = response.locals.token;
    await token.load('app');

    let tag = await this.tagService.findOne({ app_id: token.app.getId(), id: request.param('id') });
    if (!tag) {
      throw new HttpException(404, 'Tag not found');
    }

    return response.json({ data: await this.tagService.update(request.param('id'), data)});
  }
}
