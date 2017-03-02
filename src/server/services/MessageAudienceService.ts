import { injectable } from 'chen/core';
import { Service, QueryBuilder } from 'chen/sql';
import { MessageAudience, MessageCollection, UserCollection, GuestCollection } from 'app/models';
import { UserService, GuestService } from 'app/services';

/**
 * User Tag Service
 */
@injectable()
export class MessageAudienceService extends Service<MessageAudience> {

  protected modelClass = MessageAudience;

  public constructor(private userService: UserService, private guestService: GuestService) {
    super();
  }

  public async loadAudience(collection: MessageCollection): Promise<MessageCollection> {
    // collect the guest ids
    let guestIds = [];
    let userIds = [];
    let guests = new GuestCollection();
    let users = new UserCollection();
    collection.forEach(item => {
      if (!item.messageAudience || !item.messageAudience.size) {
        return;
      }

      item.messageAudience.forEach(item => {
        switch (item.get('origin')) {
          case 'users':
            userIds.push(item.get('origin_id'));
            break;
          case 'guests':
            guestIds.push(item.get('origin_id'));
            break;
        }
      });
    });

    if (guestIds.length) {
      guests = (await this.guestService.query((query: QueryBuilder) => {
        query.whereIn('id', guestIds);
      }).get()) as GuestCollection;
    }

    if (userIds.length) {
      users = (await this.userService.query((query: QueryBuilder) => {
        query.whereIn('id', userIds);
      }).get()) as UserCollection;
    }

    // set origin data
    collection.forEach((n) => {
      if (!n.messageAudience || !n.messageAudience.size) {
        return;
      }

      let audience = [];
      n.messageAudience.forEach(item => {
        switch (item.get('origin')) {
          case 'users':
            item.set('originData', users.get(item.get('origin_id')));
            break;
          case 'guests':
            item.set('originData', guests.get(item.get('origin_id')));
            break;
        }

        audience.push(item.get('originData'));
      });

      n.set('audience', audience);
    });

    return collection;
  }
}
