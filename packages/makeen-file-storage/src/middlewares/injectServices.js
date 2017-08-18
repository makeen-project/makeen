import inject from 'makeen/build/middlewares/inject';

export default inject('makeen.fileStorage')(['FileRepository', 'File']);
