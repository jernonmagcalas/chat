import { Router } from 'chen/web';
import { Config } from 'chen/core';

export default function (router: Router, config: Config) {

  // oauth
  router.controller('oauth', 'OauthController');

  // API Version 1
  router.group({domain: config.get('api.host'), prefix: 'v1', namespace: 'v1'}, (router) => {
    router.route('POST', 'apps/check', 'AppController@check');
    router.resource('apps', 'AppController');

    // access token required
    router.group({ middleware: ['ValidateApiToken'] }, (router) => {
      router.route('POST', 'upload', 'FileController@upload');
      router.resource('users', 'UserController');
      router.group({ middleware: ['ValidateAppUser'], prefix: 'users/:user_id' }, router => {
        router.route('POST', 'mark-read', 'UserController@markRead');
        router.route('GET', 'tags', 'UserTagController@index');
      });

      router.resource('tags', 'TagController');
      router.group({ middleware: ['ValidateTag'], prefix: 'tags/:tag_id' }, router => {
        router.route('POST', 'assign', 'UserTagController@store');
        router.route('GET', 'chat-room/:session_id', 'ChatRoomController@getGuestChatRoom');
        router.route('GET', 'guests/:user_id', 'GuestController@getByTag');
        router.route('POST', 'mark-read/:user_id', 'UserTagController@markRead');
      });

      router.route('GET','chat-rooms/recent/:user_id', 'ChatRoomUserController@recentChatRooms');
      router.resource('chat-rooms', 'ChatRoomController');
      router.group({ middleware: ['ValidateChatRoom'], prefix: 'chat-rooms/:chat_room_id' }, router => {
        router.route('GET','user/:user_id', 'ChatRoomController@user');
        router.route('POST','reply', 'MessageController@reply');
        router.route('POST','mark-read', 'ChatRoomUserController@markRead');
        router.route('POST', 'messages/seen', 'MessageController@seen');
        router.resource('messages', 'MessageController');
        router.route('get', 'recent-detail/:user_id', 'ChatRoomUserController@getDetailByChatRoomId');
      });

      router.resource('guests', 'GuestController');
      router.group({ middleware: ['ValidateGuest'], prefix: 'guests/:guest_id' }, router => {
        router.route('POST', 'mark-read', 'GuestController@markRead');
        router.route('GET', 'tags', 'TagController@getByGuests');
      });
    });
  });

  router.route('GET', '/', 'IndexController@index');
}
