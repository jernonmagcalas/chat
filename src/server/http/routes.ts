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

    // });
  });

  router.route('GET', '/', 'IndexController@index');



}
