import { Router } from 'chen/web';
import { Config } from 'chen/core';

export default function (router: Router, config: Config) {

  // oauth
  router.controller('oauth', 'OauthController');

  // API Version 1
  router.group({domain: config.get('api.host'), prefix: 'v1', namespace: 'v1'}, (router) => {
    router.resource('apps', 'AppController');

    // access token required
    // router.group({ middleware: ['ValidateToken'] }, (router) => {
    //   router.route('GET', 'user', 'UserController@currentUser');
    //
    //   router.group({ middleware: ['CheckUserIdParam'] }, (router) => {
    //     router.route('GET', 'user/:user_id/friends', 'UserController@friends');
    //     router.route('POST', 'user/:user_id/apprequest', 'AppController@appRequest');
    //     router.route('GET', 'user/:user_id/apprequest/:request_id', 'AppController@getUserRequest');
    //   });
    // });
  });

  router.route('GET', '/', 'IndexController@index');



}
