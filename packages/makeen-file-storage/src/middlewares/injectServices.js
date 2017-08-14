import inject from 'makeen/build/middlewares/inject';

export default inject({
  FileRepository: 'makeen:fileStorage.FileRepository',
  File: 'makeen:fileStorage.File',
});
