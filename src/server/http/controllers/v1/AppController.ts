import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';
import { AppService } from 'app/services';

@injectable()
export class AppController extends Controller {

  constructor(private appService: AppService) {
    super();
  }

  public async store(request: Request, response: Response) {
    let input = request.input.all();

    return response.json({ data: await this.appService.create(input)});
  }
}
