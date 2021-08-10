import { blue, lightBlue, lightGreen, red, white } from '../colors';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import jobs from '../jobs';
import log from '../log';
import Player from '../Player';
import { isStreet } from '../streets';
import zones from '../zones';

class CorreiosController {
    // handlePlayerArrival(player: Player) {}

    createJob(player: Player) {
        const multipleJobErrors = [
            'Vai com calma ai meu chapa, você só pode fazer um trabalho por vez.',
            'Seu carrinho não vai aguentar toda essa carga não.',
            'Termina esse trabalho primeiro aí p****.',
        ];

        const movingCarErrors = [
            'Calma aí que sou ruim de mira, se ficar parado, ajuda.',
            'Você tá achando que sou o Michael Jordan??',
            'Minha vista já não é mais a mesma, pare o carro para pegar o trabalho, filho.',
            'Acho melhor você ficar parado senão eu acerto você.',
            'Você sabe o que é freio??',
            'Acho bom você levar esse carro para verificar os freios, para o carro pra eu te passar o pacote.',
            'Vamos rápido aí amigo, aqui ninguém é arremessador, para esse carro logo.',
            'Facilita aí meu mano, ta atrasando o serviço dos outros, para e pega esse pacote logo.',
        ];
        if (player.speedKmh > 3) {
            sendMessageToConnection(
                `${red}| ${white}${player.location.name} ${lightGreen}${
                    movingCarErrors[
                        Math.round(Math.random() * (movingCarErrors.length - 1))
                    ]
                }`,
                player,
                'error',
            );
            return;
        }
        if (player.job) {
            sendMessageToConnection(
                `${red}| ${white}${player.location.name} ${lightGreen}${
                    multipleJobErrors[
                        Math.round(
                            Math.random() * (multipleJobErrors.length - 1),
                        )
                    ]
                }`,
                player,
                'error',
            );
            return;
        }
        const job = jobs[Math.round(Math.random() * (jobs.length - 1))];
        player.job = job;
    }

    handleJobExpired(player: Player) {
        const fine =
            Math.floor(
                Math.random() * (player.job.maxPayout - player.job.minPayout) +
                    player.job.minPayout,
            ) * 0.5;
        sendMessageToConnection(
            `${red}| ${white}Você não entregou a encomenda a tempo, você pagou uma multa de ${red}R$ ${(
                fine / 100
            ).toFixed(2)}${white}.`,
            player,
            'error',
        );
        player.connection.cash -= fine;
        player.job = null;
    }

    finishJob(player: Player) {
        if (!isStreet(player.location)) {
            if (player.job?.destination !== player.location.id) {
                return;
            }
        } else {
            return;
        }
        const payment = Math.floor(
            Math.random() * (player.job.maxPayout - player.job.minPayout) +
                player.job.minPayout,
        );
        player.connection.cash += payment;
        const zone = zones.find((z) => z.id === player.job?.destination);
        sendMessageToConnection(
            `${lightBlue}| ${white}Você recebeu ${lightGreen}R$ ${(
                payment / 100
            ).toFixed(2)} ${white}de ${lightGreen}${zone.name}`,
            player,
            'system',
        );
        player.job = null;
        clearTimeout(player.jobTimeout);
    }
}

export default new CorreiosController();
