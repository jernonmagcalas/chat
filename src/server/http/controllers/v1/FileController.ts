import { Controller, Request, Response, HttpException } from 'chen/web';
import { injectable, File } from 'chen/core';
import { FileService, UtilService } from 'app/services';

import * as mkdirp from 'mkdirp';
import * as fs from 'fs';
import * as pathlib from 'path';

const sharp = require('sharp');

@injectable()
export class FileController extends Controller {

  constructor(private fileService: FileService, private utilService: UtilService) {
    super();
  }

  public async index(request: Request, response: Response) {
    let userId = request.auth().getId();
    let siteId = response.locals.site.getId();
    return response.json({ data: await this.fileService.find({ user_id: userId, site_id: siteId }) });
  }

  /**
   * Update a file in temporary location
   * @param request
   * @param response
   * @return {JSONResponse}
   */
  public async upload(request: Request, response: Response) {
    let data = request.input.all();

    this.fileService.validate(data, {
      file: ['required', 'string'],
      name: ['required', 'string'],
    });

    let file: File;
    if (data['file']) {
      let fileArr = data['file'].split(';base64,');
      data['file'] = fileArr[1];
      data['type'] = fileArr[0].split(':')[1];
      let dir = `${this.context.app.basePath()}/uploads/temp`;
      await new Promise(resolve => mkdirp(dir, resolve));

      let fileName = await this.utilService.generateCode();
      if (data['noSizes'] && data['resize']) {
        let buffer = await sharp(Buffer.from(data['file'], 'base64')).resize(data['resize']).toBuffer();
        file = await File.create(pathlib.join(dir, fileName), buffer, data['type']);
      } else {
        file = await File.createFromBase64String(data['file'], data['type'], dir, fileName);
      }

      try {
        let maxSize = this.context.app.getConfig().get('files.maxSize');
        this.fileService.validate({ file }, { file: [`max:${maxSize || '5242880'}`] });
      } catch (e) {
        fs.unlink(file.path);
        throw e;
      }

      if (file && data['type'].indexOf('image') > -1 && !data['noSizes']) {
        let ext = `.${file.name.split('.')[1]}`;

        // resize image
        let image = sharp(file.path);
        let imageData = await image.metadata();

        let filePath = file.path;
        if (imageData.width != imageData.height) {

          let cropSize = imageData.width;
          if (imageData.width > imageData.height) {
            cropSize = imageData.height;
          }

          await image.resize(cropSize, cropSize).crop().toFile(file.path.replace(ext, `_sq${ext}`));
          filePath = file.path.replace(ext, `_sq${ext}`);
        }

        sharp(filePath).resize(50).toFile(file.path.replace(ext, `_50x50${ext}`), console.log);
        sharp(filePath).resize(250).toFile(file.path.replace(ext, `_250x250${ext}`), console.log);
        sharp(filePath).resize(500).toFile(file.path.replace(ext, `_500x500${ext}`), console.log);
      }
    }

    if (file) {
      return response.json({ data: { file_name: file.name, type: file.type, name: data['name'], noSizes: data['noSizes'] } });
    }

    throw new HttpException(400);
  }
}
