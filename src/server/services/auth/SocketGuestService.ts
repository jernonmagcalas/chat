import { injectable } from 'chen/core';
import { AuthService, Request } from 'chen/web';
import { GuestService } from 'app/services';
import { Guest } from 'app/models';

@injectable()
export class SocketGuestService extends AuthService {

  constructor(private guestService: GuestService) {
    super();
  }

  public getAuthId(request: Request): any {
    return request.input.get('id');
  }

  public async authenticate(request: Request, token: string): Promise<Guest> {
    let guest: Guest = await this.guestService.findOne({ id: request.input.get('id') });
    if (!guest) {
      return null;
    }

    return guest;
  }

}

