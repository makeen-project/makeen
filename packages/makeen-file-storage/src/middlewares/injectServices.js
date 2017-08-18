import injectServices from 'makeen/build/middlewares/injectServices';

export default injectServices({
  FileRepository: 'makeen.fileStorage.FileRepository',
  File: 'makeen.fileStorage.File',
});
