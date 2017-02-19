import { Model, Collection, field, virtual, FieldTypes } from 'chen/sql';

export class File extends Model {

  protected table = 'files';
  protected collectionClass = FileCollection;

  @field({ guarded: true })
  public id: FieldTypes.Number;

  @field()
  public filename: FieldTypes.String;

  @field()
  public name: FieldTypes.String;

  @field()
  public type: FieldTypes.String;

  @field()
  public createdAt: FieldTypes.Date;

  @field()
  public updatedAt: FieldTypes.Date;

  @virtual()
  public sizes: FieldTypes.JSONObject;

  public getSizesAttribute(value) {
    let file = this.get('filename');
    let files: any = {};
    if (file && this.get('type').indexOf('image') > -1) {
      let parts = file.split('.');
      let ext = `.${parts[parts.length-1]}`;
      files.square = file.replace(ext, `_sq${ext}`);
      files.small = file.replace(ext,`_50x50${ext}`);
      files.medium = file.replace(ext,`_250x250${ext}`);
      files.large = file.replace(ext,`_500x500${ext}`);
    }

    return files;
  }

}

export class FileCollection extends Collection<File> {

  protected modelClass = File;

  /**
   * Filter only images
   * @return {FileCollection}
   */
  public getImages(): FileCollection {
    let images = new FileCollection();
    this.forEach((item) => {
      if (item.get('type').indexOf('image') === -1) {
        return;
      }
      images.push(item);
    });

    return images;
  }
}
