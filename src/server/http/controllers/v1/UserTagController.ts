import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';
import { UserTagService } from 'app/services';

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
    let { userApp } = response.locals;
    let userTags = await this.userTagService.query(query => {
      query.select('user_tags.*');
      query.innerJoin('tags', 'tags.id', 'user_tags.tag_id');
      query.where({
        user_id: userApp.get('user_id'),
        'user_tags.app_id': userApp.get('app_id'),
        is_active: true,
      })
    }).get();

    if (userTags.size) {
      await userTags.load('tag', query => {
        query.where({ is_active: true });
      });
    }


    return response.json({ data: userTags });
  }

  /**
   * Assign a user in a tag
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async store(request: Request, response: Response) {
    let data = request.input.all();
    let token = response.locals.token;
    if (!token.app) {
      await token.load('app');
    }
    data['app_id'] = token.app.getId();
    data['tag_id'] = response.locals.tag.getId();
    return response.json({ data: await this.userTagService.create(data)});
  }
}
