import jobs from '../jobs';
import log from '../log';
import Player from '../Player';

class CorreiosController {
    // handlePlayerArrival(player: Player) {}

    createJob(player: Player) {
        const job = jobs[Math.round(Math.random() * jobs.length - 1)];
        player.job = job;
        log.info('cu');
    }
}

export default new CorreiosController();
