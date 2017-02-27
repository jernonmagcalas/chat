import { injectable, File, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import {
  File as FileModel, Message, MessageCollection, Guest, User, ChatRoomUserCollection,
  ChatRoomUser
} from 'app/models';
import { UserService, GuestService, ChatRoomUserService, FileService, AppService } from 'app/services';
import { SocketIO, View } from 'chen/web';
import * as mkdirp from 'mkdirp';
import * as fs from 'fs';
import { EmailService } from 'app/services/EmailService';

@injectable()
export class MessageService extends Service<Message> {

  protected modelClass = Message;

  constructor(private userService: UserService, private guestService: GuestService,
              private chatRoomUserService: ChatRoomUserService, private socket: SocketIO,
              private fileService: FileService, private emailService: EmailService,
              private appService: AppService) {
    super();
  }

  /**
   * Create a message
   * @param data
   * @returns {Message}
   */
  public async create(data: KeyValuePair<any>): Promise<Message> {
    let create = super.create;
    let message = await this.transaction<Message>(async function(this) {
      this.validate(data, {
        chat_room_id: ['required'],
        sender: ['required'],
        app_id: ['required']
      });

      if (!data['file'] && !data['content']) {
        throw new ValidatorException({slug: ['Content cannot be empty .']})
      }

      let sender = data['sender'];
      delete ['sender'];

      data['origin_id'] = sender.getId();
      data['origin'] = sender instanceof Guest ? 'guests' : 'users';

      if (!data['file'] && !data['content']) {
        throw new ValidatorException({ content: ['Content cannot be empty .'] })
      }

      // check if the user is part of chat room
      if (data['origin'] instanceof User) {
        if (!await this.chatRoomUserService.isMember(data['chat_room_id'], sender)) {
          throw new ValidatorException({ content: ['You are not member of the chat room'] })
        }
      }

      let message = await create.call(this, {
        chat_room_id: data['chat_room_id'],
        origin_id: data['origin_id'],
        origin: data['origin'],
        content: data['content'],
        link_id: data['link_id']
      });

      if (!message) {
        return message;
      }

      if (data['file']) {
        message.setRelatedModel('file', await this.addFileFromTemp(data['file'], message, data['app_id']));
        message.set('file_id', message.file.getId());
        await this.save(message);
      }

      message.set('originData', sender);
      await message.load('chatRoom');

      await this.chatRoomUserService.newMessageUpdate(message, sender, data['app_id']);
      this.socket.to(`chat-rooms@${message.chatRoomId.valueOf()}`).emit('new-message', message);

      return message;
    });

    // if sent by user to guest
    if(message.get('origin') == 'users') {
      let guest = await this.chatRoomUserService.getGuestByChatRoom(message.get('chat_room_id'));
      guest = (await this.chatRoomUserService.loadOriginData(new ChatRoomUserCollection([guest]))).first();

      if (guest.originData.get('email') && !this.socket.getConnectedClients(`guests@${guest.originData.getId()}`).length) {
        this.sendOfflineGuestMessage(guest, message, data['app_id']).catch(console.log);
      }
    }

    return message;
  }

  /**
   * Add message files from temp
   * @param  {Post}          post
   * @param  {any[]}         files
   * @return {Promise<void>}
   */
  public async addFileFromTemp(file: KeyValuePair<any>, message: Message, appId: string | number): Promise<FileModel> {
    this.fileService.validate(file, {
      name: ['required', 'string'],
      type: ['required', 'string'],
      file_name: ['required', 'string']
    });

    let dir = `/uploads/app-${appId}/messages`;
    let rootPath = this.context.app.basePath();
    // make sure dir exists
    await new Promise(resolve => mkdirp(`${rootPath}${dir}`, resolve));

    // move file from temp folder
    let newFileName = `${rootPath}${dir}/${file['file_name']}`;
    await new Promise(resolve => fs.rename(`${rootPath}/uploads/temp/${file['file_name']}`, newFileName, resolve));
    if (await File.exists(newFileName)) {
      if (file['type'].indexOf('image') > -1) {
        let ext = `.${file['name'].split('.')[1]}`;

        await new Promise(resolve =>
          fs.rename(
            `${rootPath}/uploads/temp/${file['file_name'].replace(ext,`_sq${ext}`)}`,
            newFileName.replace(ext,`_sq${ext}`),
            resolve
          )
        );

        await new Promise(resolve =>
          fs.rename(
            `${rootPath}/uploads/temp/${file['file_name'].replace(ext,`_50x50${ext}`)}`,
            newFileName.replace(ext,`_50x50${ext}`),
            resolve
          )
        );

        await new Promise(resolve =>
          fs.rename(
            `${rootPath}/uploads/temp/${file['file_name'].replace(ext,`_250x250${ext}`)}`,
            newFileName.replace(ext,`_250x250${ext}`),
            resolve
          )
        );

        await new Promise(resolve =>
          fs.rename(
            `${rootPath}/uploads/temp/${file['file_name'].replace(ext,`_500x500${ext}`)}`,
            newFileName.replace(ext,`_500x500${ext}`),
            resolve
          )
        );
      }

      // save file to database
      let config = this.context.config.get('app');
      return await this.fileService.create({
        file_name: `${config['protocol']}://${config['host']}${dir}/${file['file_name']}`,
        name: file['name'],
        type: file['type']
      });
    }
  }

  public async loadOriginData(collection: MessageCollection): Promise<MessageCollection> {
    // set origin data
    await collection.forEachAsync(async (n) => {
      let id = n.get('origin_id');
      switch (n.get('origin')) {
        case 'users':
          n.set('originData', await this.userService.findOne({ id }));
          break;
        case 'guests':
          n.set('originData', await this.guestService.findOne({ id }));
          break;
      }
    });
    return collection;
  }

  public async sendOfflineGuestMessage(guestUser: ChatRoomUser, message: Message, appId: string | number) {
    let app = await this.appService.findOne({ id: appId });
    let subject = `${app.name} sent you a direct message`;
    let template = await File.read('./resources/views/emails/message.html');

    let data = {
      domain: app.get('domain'),
      app,
      photo: message.file ? message.file.fileName : null,
      logo: null,
      name: guestUser['originData']['email'],
      content: message['content']
    };

    //TODO: always null on first call;
    let msg = await View.compile(template, data).render(this.context);

    if (!msg) {
      return;
    }

    let receiver = guestUser.originData['email'] as string;
    await this.emailService.send(subject, msg, [{ email: receiver }], null, `${app.name}`)
      .catch(console.log);
  }
}
