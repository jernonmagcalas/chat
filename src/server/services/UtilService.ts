import { injectable, Service } from 'chen/core';
import * as crypto from 'crypto';

/**
 * User Service
 */
@injectable()
export class UtilService extends Service {

  public generateCode(length: number = 30): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length / 2, (err, buff) => {
        if (err) return reject(err);
        return resolve(buff.toString('hex').toUpperCase());
      });
    });
  }

  public generateToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(256, function (ex, buffer) {
        if (ex) return reject(ex);

        var token = crypto
          .createHash('sha1')
          .update(buffer)
          .digest('hex');

        resolve(token);
      });
    });
  }
}
