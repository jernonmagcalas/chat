import { Controller, Request, Response } from 'chen/web';
import { injectable } from 'chen/core';
import { UserService, AccessLevelService, UserAppService } from 'app/services';
import { AccessLevel } from 'app/models';

@injectable()
export class UserController extends Controller {

  constructor(private userService: UserService, private accessLevelService: AccessLevelService,
              private userAppService: UserAppService) {
    super();
  }

  /**
   * Create a user for an app
   * @param request
   * @param response
   * @return {Promise<JSONResponse>}
   */
  public async store(request: Request, response: Response) {
    let data = request.input.all();
    let token = response.locals.token;
    await token.load('app');

    let user = await this.userService.findOne({ email: data['email']});

    // TODO: we only support staff type
    // get the access level
    let accessLevel = await this.accessLevelService.findOne({ app_id: token.app.getId(), type: AccessLevel.STAFF });
    if (!user) {
      // create the user and assign to app
      data['app_id'] = token.app.getId();
      data['access_level_id'] = accessLevel.getId();
      await this.userService.createByApp(data);
    } else {
      let userApp = await this.userAppService.findOne({ app_id: token.app.getId(), user_id: user.getId() });
      if (!userApp) {
        // assign the user in the app
        await this.userAppService.create({
          app_id: token.app.getId(),
          user_id: user.getId(),
          access_level_id: accessLevel.getId()
        });
      }
    }

    return response.json(token.app);
  }
}
