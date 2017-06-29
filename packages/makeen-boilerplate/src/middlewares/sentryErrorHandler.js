import Raven from 'raven';

export default {
  id: 'sentryErrorHandler',
  factory: () => Raven.errorHandler(),
};
