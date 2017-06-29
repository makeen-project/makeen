import Joi from 'joi';
import { Module } from 'makeen';
import FileService from './services/File';
import FileRepositoryService from './services/FileRepository';
import router from './router';
import uploadMiddleware from './middlewares/upload';

class FileStorage extends Module {
  static configSchema = {
    uploadDir: Joi.string().required(),
  };

  initialize({ uploadDir }) {
    this.uploadMiddleware = uploadMiddleware({
      dest: uploadDir,
    });

    this.router = router({
      uploadMiddleware: this.uploadMiddleware,
    });
  }

  async setup() {
    const [{ registerServices }] = await this.dependencies([
      'octobus',
      'storage',
    ]);
    this.export(
      registerServices(this, {
        File: new FileService({
          uploadDir: this.getConfig('uploadDir'),
        }),
        FileRepository: new FileRepositoryService(),
      }),
    );
  }
}

export default FileStorage;
