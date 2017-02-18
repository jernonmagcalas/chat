import { injectable, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import { Tag } from 'app/models';

/**
 * Tag Service
 */
@injectable()
export class TagService extends Service<Tag> {

  protected modelClass = Tag;

  public constructor() {
    super();
  }

  public async create(data: KeyValuePair<any>): Promise<Tag> {
    this.validate(data, {
      app_id: ['required'],
      name: ['required'],
    });

    if (!this.isValidName(data['name'])) {
      throw new ValidatorException(
        {name: ['Tag Name should only contain letters, numbers, dash or underscore.']}
      );
    }

    return super.create(data);
  }

  private isValidName(string): boolean {
    var pattern = new RegExp(/^[a-zA-Z0-9\-\_]*$/g);
    if (!pattern.test(string)) {
      return false;
    }

    return true;
  }
}
