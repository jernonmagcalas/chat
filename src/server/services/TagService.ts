import { injectable, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import { Tag } from 'app/models';
import { UserTagService, AppService } from 'app/services';

/**
 * Tag Service
 */
@injectable()
export class TagService extends Service<Tag> {

  protected modelClass = Tag;

  public constructor(private appService: AppService, private userTagService: UserTagService) {
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

    let tag = await super.create(data);

    // assign the admin in the tag
    let admin = await this.appService.getAdmin(data['app_id']);
    this.userTagService.create({
      app_id: data['app_id'],
      tag_id: tag.getId(),
      email: admin.get('email')
    });

    return tag;
  }

  public async update(id: string | number, data: KeyValuePair<any>): Promise<boolean> {
    this.validate(data, {
      name: ['required']
    });

    if (data['name'] && !this.isValidName(data['name'])) {
      throw new ValidatorException(
        {name: ['Tag Name should only contain letters, numbers, dash or underscore.']}
      );
    }

    return super.update(id, data);
  }

  private isValidName(string): boolean {
    var pattern = new RegExp(/^[a-zA-Z0-9\-\_]*$/g);
    if (!pattern.test(string)) {
      return false;
    }

    return true;
  }
}
