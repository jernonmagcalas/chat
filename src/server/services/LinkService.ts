import { injectable, KeyValuePair } from 'chen/core';
import { Service } from 'chen/sql';
import { Link } from 'app/models';
import { HttpClient } from 'chen/web';
import * as urllib from 'url';

const cheerio = require('cheerio');

@injectable()
export class LinkService extends Service<Link> {

  protected modelClass = Link;

  /**
   * Validate link data
   * @param  {KeyValuePair<any>} data
   * @param  {boolean = false}   throwError
   * @return {boolean}
   */
  public validateLink(data: KeyValuePair<any>, throwError: boolean = false): boolean {
    try {
      this.validate(data, {
        url: ['required', 'string'],
        title: ['required', 'string'],
        content: ['string'],
        image: ['string']
      });
      return true;
    } catch (e) {
      if (throwError) throw e;
      else console.log(e);
      return false;
    }
  }

  /**
   * Get Data on specified url
   * @param  {string}  url
   * @return {Promise}
   */
  public async getUrlData(url: string): Promise<KeyValuePair<any>> {
    let http = new HttpClient()
    let res = await http.get(url);
    if (res && res.body && res.info.statusCode == 200) {
      let $ = cheerio.load(res.body);
      let data = {
        url: $('meta[property="og:video:url"]').attr('content') || url,
        title: $('meta[property="og:title"]').attr('content') || $('title').text(),
        image: $('meta[property="og:image"]').attr('content') || $('body img').attr('src'),
        content: $('meta[property="og:description"]').attr('content')
          || $('meta[name="description"]').attr('content')
          || $('body p').first().text(),
        type: $('meta[property="og:type"]').attr('content')
      };

      let urlData = urllib.parse(url);
      let domain = `${urlData.protocol}//${urlData.hostname}`;

      if (data.image) {
        if (!data.image.startsWith('//') && !(/^https?:\/\/\S+/).test(data.image)) {
          data.image = `${domain}${data.image.startsWith('/') ? '' : '/'}${data.image}`;
        }
      } else {
        data.image = `${domain}/favicon.ico`;
      }

      return data;
    }

    return null;
  }
}
