import { Controller, Request, Response } from 'chen/web';
import { injectable, ValidatorException } from 'chen/core';
import { LinkService } from 'app/services';

@injectable()
export class LinkController extends Controller {

  constructor(private linkService: LinkService) {
    super();
  }

  /**
   * Get url information
   * @param request
   * @param response
   * @return {JSONResponse}
   */
  public async urlInfo(request: Request, response: Response) {
    let data = request.input.all();
    this.linkService.validate(data, {
      url: ['required', 'url']
    });

    let urlData;
    try {
      urlData = await this.linkService.getUrlData(data['url']);
      if (!urlData) {
        throw new ValidatorException({ url: ['URL did not load properly'] });
      }
    } catch (e) {
      console.log(e);
      throw new ValidatorException({ url: ['URL did not load properly'] });
    }

    return response.json({ data: urlData });
  }
}
