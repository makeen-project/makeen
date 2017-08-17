import injectServices from 'makeen/build/middlewares/injectServices';

export default injectServices({
  Account: 'makeen:user.Account',
  AccountRepository: 'makeen:user.AccountRepository',
  User: 'makeen:user.User',
  UserRepository: 'makeen:user.UserRepository',
  UserLoginRepository: 'makeen:user.UserLoginRepository',
});
