import OctobusModule from 'makeen-octobus';
import StdoutStore from 'makeen-octobus/build/libs/EventStore/Stdout';
import LoggerModule from 'makeen-logger';
import RouterModule from 'makeen-router';
import StorageModule from 'makeen-storage';
import UserModule from 'makeen-user';
import GQLModule from 'makeen-graphql';
import MailerModule from 'makeen-mailer';
import FileStorageModule from 'makeen-file-storage';
import SecurityModule from 'makeen-security';
import HealthModule from 'makeen-health';
import Config from '../config';
import PlayModule from './play';
import AdminModule from './admin';

export default [
  new OctobusModule({
    ...Config.get('modules.octobus'),
    messageStore: new StdoutStore(),
  }),
  new LoggerModule(Config.get('modules.logger')),
  new StorageModule(Config.get('modules.storage')),
  new UserModule(Config.get('modules.user')),
  new MailerModule(Config.get('modules.mailer')),
  new FileStorageModule(Config.get('modules.fileStorage')),
  new HealthModule(Config.get('modules.health')),
  new GQLModule(Config.get('modules.gql')),
  new PlayModule(Config.get('modules.play')),
  new AdminModule(Config.get('modules.admin')),
  new RouterModule(Config.get('modules.router')),
  new SecurityModule(Config.get('modules.security')),
];
