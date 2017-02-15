import { injectable } from 'chen/core';
import { HttpMiddleware, Request, Response, HttpException } from 'chen/web';
import { AccessToken } from 'app/models';

@injectable()
export class ValidateApiToken extends HttpMiddleware {

  constructor() {
    super();
  }

  public async handle(request: Request, response: Response, next: Function) {
    let token = await request.auth('api').user() as AccessToken;
    if (!token || !token.get('active') || token.get('expiration') < new Date()) {
      throw new HttpException(403);
    }

    response.locals.token = token;

    next();
  }
}
