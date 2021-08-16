import {
    black,
    blue,
    darkGreen,
    lightBlue,
    lightGreen,
    purple,
    red,
    white,
    yellow,
} from '../colors';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import inSimClient from '../inSimClient';
import jobs from '../jobs';
import log from '../log';
import IS_BTN, { ButtonStyle } from '../packets/IS_BTN';
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

    async handlePlayerEntrance(player: Player) {
        const connectionId = player.connection.id;
        await inSimClient.sendPacket(
            Buffer.from([
                // Container Dark
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 99,
                    height: 70,
                    width: 92,
                    left: 54,
                    top: 42,
                    style: ButtonStyle.DARK,
                }),
                // Container
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 100,
                    height: 60,
                    width: 90,
                    left: 55,
                    top: 50,
                    style: ButtonStyle.LIGHT,
                }),
                // Title
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 101,
                    height: 15,
                    width: 100,
                    left: 50,
                    top: 25,
                    style: ButtonStyle.LIGHT,
                    text: `${yellow} Correios`,
                }),
                // Title Container
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 102,
                    height: 8,
                    width: 66,
                    left: 67,
                    top: 42,
                    text: `${white}Entregas`,
                }),
                // First Job
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 103,
                    height: 5,
                    width: 30,
                    left: 55,
                    top: 51,
                    text: `${white}Pacote Padrão`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 104,
                    height: 5,
                    width: 30,
                    left: 55,
                    top: 56,
                    style: ButtonStyle.LEFT,
                    text: `${white}Destino: ${lightGreen}Valentim Terra`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 105,
                    height: 5,
                    width: 30,
                    left: 55,
                    top: 61,
                    style: ButtonStyle.LEFT,
                    text: `${white}Valor: ${lightGreen}Até 566,98`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 106,
                    height: 5,
                    width: 30,
                    left: 55,
                    top: 66,
                    style: ButtonStyle.LEFT,
                    text: `${white}Distância: ${lightGreen}1566m`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 107,
                    height: 6,
                    width: 28,
                    left: 56,
                    top: 72,
                    style:
                        ButtonStyle.CLICK | ButtonStyle.DARK | ButtonStyle.OK,
                    text: 'Aceitar',
                }),

                // Second Job
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 108,
                    height: 5,
                    width: 30,
                    left: 85,
                    top: 51,
                    text: `${white}Pacote Padrão`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 109,
                    height: 5,
                    width: 30,
                    left: 85,
                    top: 56,
                    style: ButtonStyle.LEFT,
                    text: `${white}Destino: ${lightGreen}Valentim Terra`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 110,
                    height: 5,
                    width: 30,
                    left: 85,
                    top: 61,
                    style: ButtonStyle.LEFT,
                    text: `${white}Valor: ${lightGreen}Até 566,98`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 111,
                    height: 5,
                    width: 30,
                    left: 85,
                    top: 66,
                    style: ButtonStyle.LEFT,
                    text: `${white}Distância: ${lightGreen}1566m`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 112,
                    height: 6,
                    width: 28,
                    left: 86,
                    top: 72,
                    style:
                        ButtonStyle.CLICK | ButtonStyle.DARK | ButtonStyle.OK,
                    text: 'Aceitar',
                }),
                // Third Job
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 113,
                    height: 5,
                    width: 30,
                    left: 115,
                    top: 51,
                    text: `${white}Pacote Padrão`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 114,
                    height: 5,
                    width: 30,
                    left: 115,
                    top: 56,
                    style: ButtonStyle.LEFT,
                    text: `${white}Destino: ${lightGreen}Valentim Terra`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 115,
                    height: 5,
                    width: 30,
                    left: 115,
                    top: 61,
                    style: ButtonStyle.LEFT,
                    text: `${white}Valor: ${lightGreen}Até 566,98`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 116,
                    height: 5,
                    width: 30,
                    left: 115,
                    top: 66,
                    style: ButtonStyle.LEFT,
                    text: `${white}Distância: ${lightGreen}1566m`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 117,
                    height: 6,
                    width: 28,
                    left: 116,
                    top: 72,
                    style:
                        ButtonStyle.CLICK | ButtonStyle.DARK | ButtonStyle.OK,
                    text: 'Aceitar',
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: 120,
                    requestId: 1,
                    height: 5,
                    width: 90,
                    left: 55,
                    top: 80,
                    style: ButtonStyle.LEFT,
                    text: `${white}^H¡´^L Lembre-se, você pagará uma multa de ${red}50%${white} sobre o valor da entrega se não`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: 121,
                    requestId: 1,
                    height: 5,
                    width: 90,
                    left: 55,
                    top: 85,
                    style: ButtonStyle.LEFT,
                    text: `${white}entregá-la a tempo.`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: 122,
                    requestId: 1,
                    height: 5,
                    width: 90,
                    left: 55,
                    top: 90,
                    style: ButtonStyle.LEFT,
                    text: `${white}^H¡´^L Para saber onde você deve entregar, veja as setas no topo da tela.`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: 123,
                    requestId: 1,
                    height: 5,
                    width: 90,
                    left: 55,
                    top: 95,
                    style: ButtonStyle.LEFT,
                    text: `${white}^H¡´^L Entregas especiais tem um valor maior, mas também precisam ser`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: 124,
                    requestId: 1,
                    height: 5,
                    width: 90,
                    left: 55,
                    top: 100,
                    style: ButtonStyle.LEFT,
                    text: `${white}entregues intactas.`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: 125,
                    requestId: 200,
                    height: 7,
                    width: 15,
                    left: 131,
                    top: 113,
                    style:
                        ButtonStyle.CLICK |
                        ButtonStyle.DARK |
                        ButtonStyle.CANCEL,
                    text: 'Fechar',
                }),
            ]),
        );
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
