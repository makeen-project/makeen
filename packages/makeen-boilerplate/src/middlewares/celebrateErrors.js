import celebrate from 'celebrate';

export default {
  id: 'celebrateErrors',
  factory: () => celebrate.errors(),
};
