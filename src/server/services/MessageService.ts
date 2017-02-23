import { injectable, File, KeyValuePair, ValidatorException } from 'chen/core';
import { Service } from 'chen/sql';
import { File as FileModel, Message, MessageCollection, Guest, User } from 'app/models';
import { UserService, GuestService, ChatRoomUserService, FileService } from 'app/services';
import { SocketIO } from 'chen/web';
import * as mkdirp from 'mkdirp';
import * as fs from 'fs';

@injectable()
export class MessageService extends Service<Message> {

  protected modelClass = Message;

  constructor(private userService: UserService, private guestService: GuestService,
              private chatRoomUserService: ChatRoomUserService, private socket: SocketIO, private fileService: FileService) {
    super();
  }

  /**
   * Create a message
   * @param data
   * @returns {Message}
   */
  public async create(data: KeyValuePair<any>): Promise<Message> {
    let create = super.create;
    return this.transaction<Message>(async function(this) {
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
      await this.chatRoomUserService.newMessageUpdate(message, sender);
      this.socket.to(`chat-rooms@${message.chatRoomId.valueOf()}`).emit('new-message', message);

      return message;
    });
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

}
