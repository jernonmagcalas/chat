import { injectable, Service } from 'chen/core';
const nodemailer = require('nodemailer');

interface ToEmail {
  [key: number]: {
    email: string,
    name?: string,
    type?: string
  }
}

@injectable()
export class EmailService extends Service {

  /**
   * SMTP trasporter
   */
  private transporter: any;

  init() {
    if (!this.transporter) {
      let config = this.context.app.getConfig().get('extensions.smtp');
      this.transporter = nodemailer.createTransport(`smtps://${config['email']}:${config['password']}@smtp.gmail.com`);
    }
  }

  /**
   * Send email
   * @param  {string}       subject
   * @param  {string}       message
   * @param  {ToEmail}      toEmail
   * @param  {string}       fromEmail
   * @return {Promise<any>}
   */
  async send(subject: string, message: string, toEmail: ToEmail, fromEmail: string, fromName?: string): Promise<any> {

    if (!fromEmail) {
      fromEmail = this.context.app.getConfig().get('extensions.smtp.email');
    }

    let failed = 0;
    for (let i in toEmail) {
      await new Promise((resolve, reject) => {

        this.transporter.sendMail({
          from: `${fromName || ''} <${fromEmail}>`.trim(),
          to: toEmail[i].email,
          subject: subject,
          text: message,
          html: message
        }, (error, info) => {

          if (error) {
            return reject(error);
          }

          resolve(info);
        });

      }).catch(err => failed++);
    }

    if (failed) {
      return false;
    }

    return true;
  }

}
