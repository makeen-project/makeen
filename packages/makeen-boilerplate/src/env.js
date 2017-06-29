import dotenv from 'dotenv';

dotenv.config();

process.on('unhandledRejection', reason => console.log(reason)); // eslint-disable-line
process.on('uncaughtException', err => console.log(err)); // eslint-disable-line
