import Raven from 'raven';

export default {
  id: 'sentryRequestHandler',
  factory: dsn => {
    Raven.config(dsn).install();
    return Raven.requestHandler();
  },
};
