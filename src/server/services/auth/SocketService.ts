import { injectable } from 'chen/core';
import { AuthService, Request } from 'chen/web';
import { UserService } from 'app/services';
import { User } from 'app/models';

@injectable()
export class SocketService extends AuthService {

  constructor(private userService: UserService) {
    super();
  }

  public getAuthId(request: Request): any {
    return request.input.get('id');
  }

  public async authenticate(request: Request, token: string): Promise<User> {
    let user: User = await this.userService.findOne({ id: request.input.get('id') });
    if (!user) {
      return null;
    }

    return user;
  }

}

