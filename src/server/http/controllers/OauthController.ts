import { Controller, Request, Response, HttpException } from 'chen/web';
import { injectable, ValidatorException } from 'chen/core';
import { UtilService, AccessTokenService, AppService } from 'app/services';

@injectable()
export class OauthController extends Controller {

  constructor(private utilService: UtilService, private accessTokenService: AccessTokenService,
              private appService: AppService) {
    super();
  }

  public async postToken(request: Request, response: Response) {
    let data = request.input.all();
    let body;
    this.accessTokenService.validate(data, {
      'grant_type': ['required', 'in:authorization_code,password,client_credentials']
    });
    switch (data['grant_type']) {
      case 'authorization_code':
        //TODO
        break;
      case 'password':
        //TODO
        break;
      case 'client_credentials':
        this.accessTokenService.validate(data, {
          client_id: ['required'],
          client_secret: ['required'],
        });

        // get the app
        let app = await this.appService.findOne({ key: data['client_id'] });

        if (!app) {
          throw new ValidatorException({ client_id: ['Invalid'] });
        }

        if (app && app.secret.valueOf() !== data['client_secret']) {
          throw new ValidatorException({ client_secret: ['Invalid'] });
        }

        let token = await this.accessTokenService.create({
          app_id: app.getId()
        });

        body = {
          access_token: token.token,
          token_type: 'bearer',
          scope: token.scope,
          expires_in: token.expiration
        };

        break;
    }

    return response.json({ body });
  }
}
