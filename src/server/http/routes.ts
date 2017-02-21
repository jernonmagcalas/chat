import { Router } from 'chen/web';
import { Config } from 'chen/core';

export default function (router: Router, config: Config) {

  // oauth
  router.controller('oauth', 'OauthController');

  // API Version 1
  router.group({domain: config.get('api.host'), prefix: 'v1', namespace: 'v1'}, (router) => {
    router.resource('apps', 'AppController');

    // access token required
    router.group({ middleware: ['ValidateApiToken'] }, (router) => {
      router.resource('users', 'UserController');
      router.group({ middleware: ['ValidateAppUser'], prefix: 'users/:user_id' }, router => {
        router.route('GET', 'tags', 'UserTagController@index');
      });

      router.resource('tags', 'TagController');
      router.group({ middleware: ['ValidateTag'], prefix: 'tags/:tag_id' }, router => {
        router.route('POST', 'assign', 'UserTagController@store');
        router.route('GET', 'chat-room/:session_id', 'ChatRoomController@getGuestChatRoom');
      });

      router.group({ middleware: ['ValidateChatRoom'], prefix: 'chat-rooms/:chat_room_id' }, router => {
        router.resource('messages', 'MessageController');
      });

      router.resource('guests', 'GuestController');
    });
  });

  router.route('GET', '/', 'IndexController@index');
}
