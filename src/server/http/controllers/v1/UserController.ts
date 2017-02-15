import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';

@injectable()
export class UserController extends Controller {

  constructor() {
    super();
  }

  public async store(request: Request, response: Response) {
    return response.json({});
  }
}
