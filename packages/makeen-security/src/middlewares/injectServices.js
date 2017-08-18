import inject from 'makeen/build/middlewares/inject';

export default inject('makeen.security')([
  'GroupRepository',
  'UserRepository',
  'Security',
]);
