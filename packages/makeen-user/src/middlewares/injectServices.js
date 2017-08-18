import inject from 'makeen/build/middlewares/inject';

export default inject('makeen.user')([
  'Account',
  'AccountRepository',
  'User',
  'UserRepository',
  'UserLoginRepository',
]);
