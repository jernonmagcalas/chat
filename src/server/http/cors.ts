import { Application } from 'chen/web';
import { Provider } from 'chen/core';
import * as express from 'express';

/**
 * AppProvider class
 */
export class CorsProvider extends Provider {

  /**
   * Register dependencies
   * @param {Application} app
   */
  public async register(app: Application) {
    app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
      next();
    });
  }
}
