import { injectable } from 'chen/core';
import { HttpMiddleware, Request, Response, HttpException } from 'chen/web';
import { TagService } from 'app/services';

@injectable()
export class ValidateTag extends HttpMiddleware {

  public constructor (private tagService: TagService) {
    super();
  }

  public async handle(request: Request, response: Response, next: Function) {
    let token = response.locals.token;
    await token.load('app');
    let tag = await this.tagService.findOne({ id: request.param('tag_id'), app_id: token.app.getId() });
    if (!tag) {
      throw new HttpException(404);
    }

    response.locals.tag = tag;
    next();
  }
}
