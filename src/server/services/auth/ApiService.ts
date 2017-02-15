import { injectable } from 'chen/core';
import { AuthService, Request } from 'chen/web';
import { AccessTokenService } from 'app/services';
import { AccessToken } from 'app/models';

@injectable()
export class ApiService extends AuthService {

  constructor(private accessTokenService: AccessTokenService) {
    super();
  }

  public getAuthId(request: Request): string {
    return request.get('Authorization');
  }

  public async authenticate(request: Request, id: string): Promise<AccessToken> {
    let token = id.split(' ')[1] || null;
    let tokenModel = await this.accessTokenService.findOne({ token });
    if (!tokenModel) {
      return null;
    }

    return tokenModel;
  }

}

