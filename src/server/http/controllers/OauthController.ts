import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';
import { UtilService, AccessTokenService } from 'app/services';

@injectable()
export class OauthController extends Controller {

  constructor(private utilService: UtilService, private accessTokenService: AccessTokenService) {
    super();
  }

  public async postToken(request: Request, response: Response) {
    let input = request.input.all();
    let body;
    this.accessTokenService.validate(input, {
      'grant_type': ['required', 'in:authorization_code,password,client_credentials']
    });
    switch (input['grant_type']) {
      case 'authorization_code':
        //TODO
        break;
      case 'password':
        //TODO
        break;
      case 'client_credentials':
        this.accessTokenService.validate(input, {
          client_id: ['required'],
          client_secret: ['required'],
        });
        this.utilService.generateToken();
        break;
    }

    return response.json({ body });
  }
}
