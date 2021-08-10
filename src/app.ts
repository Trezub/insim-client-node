import { createConnection } from 'typeorm';
import log from './log';

createConnection().then(() => {
    import('./inSimClient');
    log.info('Database connected.');
});
