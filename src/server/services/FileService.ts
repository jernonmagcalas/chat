import { injectable } from 'chen/core';
import { Service } from 'chen/sql';
import { File } from 'app/models';

@injectable()
export class FileService extends Service<File> {

  protected modelClass = File;
}
