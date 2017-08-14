import inject from 'makeen/build/middlewares/inject';

export default inject({
  Account: 'makeen:user.Account',
  AccountRepository: 'makeen:user.AccountRepository',
  User: 'makeen:user.User',
  UserRepository: 'makeen:user.UserRepository',
  UserLoginRepository: 'makeen:user.UserLoginRepository',
});
