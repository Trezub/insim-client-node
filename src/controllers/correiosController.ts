/* eslint-disable no-param-reassign */
import { lightBlue, lightGreen, red, white } from '../colors';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import jobs from '../jobs';
import Player from '../Player';
import { isStreet } from '../streets';
import { createComponent, UiComponentProps } from '../utils/ui';
import zones from '../zones';

const bottomNotes = [
    `${white}^H¡´^L Lembre-se, você pagará uma multa de ${red}50%${white} sobre o valor da entrega se não entregá-la a tempo.`,
    `${white}^H¡´^L Para saber onde você deve entregar, veja as setas no topo da tela.`,
    `${white}^H¡´^L Entregas especiais tem um valor maior, mas também precisam ser entregues intactas.`,
];

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
                `${red}| ${white}${player.zone.name} ${lightGreen}${
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
                `${red}| ${white}${player.zone.name} ${lightGreen}${
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
        if (player.job) {
            const multipleJobErrors = [
                'Vai com calma ai meu chapa, você só pode fazer um trabalho por vez.',
                'Seu carrinho não vai aguentar toda essa carga não.',
                'Termina esse trabalho primeiro aí p****.',
            ];
            sendMessageToConnection(
                `${red}| ${white}${player.zone.name} ${lightGreen}${
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

        const texts = [
            'Olá, pegue a encomenda na segunda prateleira à esquerda.',
            'Obrigado por fazer as nossas entregas com excelência, agora pegue outra e saia.',
        ];

        await sendMessageToConnection(
            `${lightBlue}| ${white}${player.zone.name}: ${lightGreen} ${
                texts[Math.round(Math.random() * (texts.length - 1))]
            }`,
            player,
        );
        const connectionId = player.connection.id;

        player.connection.gui.openWindow = createComponent({
            connectionId,
            props: {
                height: 63,
                width: 102,
                centerSelf: ['horizontal', 'vertical'],
                left: 0,
                top: -20,
                style: 'dark',
                name: 'correios',
                flow: 'bottom',
                children: [
                    {
                        height: 8,
                        width: 100,
                        left: 0,
                        top: 0,
                        text: `${white}Entregas`,
                    },
                    {
                        top: 0,
                        left: 0,
                        centerSelf: ['horizontal'],
                        width: 100,
                        height: 53,
                        style: 'light',
                        flow: 'bottom',
                        children: [
                            {
                                isVirtual: true,
                                height: 29,
                                width: 98,
                                top: 2,
                                centerSelf: ['horizontal'],
                                flow: 'right',
                                children: [
                                    ...player.availableJobs.map<UiComponentProps>(
                                        (job, index) => ({
                                            top: 0,
                                            left: index > 0 ? 1 : 0,
                                            height: 29,
                                            width: 32,
                                            style: 'dark',
                                            flow: 'bottom',
                                            children: [
                                                {
                                                    top: 0,
                                                    left: 0,
                                                    width: 32,
                                                    height: 5,
                                                    text: `${white}Pacote Padrão`,
                                                    style: 'dark',
                                                },
                                                {
                                                    top: 1,
                                                    left: 1,
                                                    align: 'left',
                                                    text: `${white}Destino: ${lightGreen}${
                                                        zones.find(
                                                            (z) =>
                                                                z.id ===
                                                                job.destination,
                                                        ).name
                                                    }`,
                                                    height: 5,
                                                    width: 30,
                                                },
                                                {
                                                    top: 0,
                                                    left: 1,
                                                    align: 'left',
                                                    text: `${white}Valor: ${lightGreen}Até R$${(
                                                        job.maxPayout / 100
                                                    ).toFixed(2)}`,
                                                    height: 5,
                                                    width: 30,
                                                },
                                                {
                                                    top: 0,
                                                    left: 1,
                                                    align: 'left',
                                                    text: `${white}Distância: ${lightGreen}----`,
                                                    height: 5,
                                                    width: 30,
                                                },
                                                {
                                                    top: 0,
                                                    left: 0,
                                                    text: `${white}Aceitar`,
                                                    height: 7,
                                                    width: 32,
                                                    stickTo: ['bottom', 'left'],
                                                    style: 'dark',
                                                    onClick: () => {
                                                        player.job = job;
                                                        player.connection.gui.openWindow =
                                                            null;
                                                    },
                                                },
                                            ],
                                        }),
                                    ),
                                ],
                            },
                            {
                                height: 19,
                                top: 1,
                                width: 98,
                                left: 0,
                                style: 'dark',
                                centerSelf: ['horizontal'],
                                children: [
                                    {
                                        isVirtual: true,
                                        height: 15,
                                        width: 98,
                                        centerSelf: ['vertical', 'horizontal'],
                                        flow: 'bottom',
                                        children:
                                            bottomNotes.map<UiComponentProps>(
                                                (text) => ({
                                                    top: 0,
                                                    left: 0,
                                                    height: 5,
                                                    width: 98,
                                                    align: 'left',
                                                    text,
                                                }),
                                            ),
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        top: 11,
                        left: 0,
                        width: 20,
                        height: 10,
                        stickTo: ['bottom', 'right'],
                        style: 'dark',
                        text: `${white}Fechar`,
                        onClick: () => {
                            player.connection.gui.openWindow = null;
                        },
                    },
                ],
            },
        });
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
        if (!isStreet(player.zone)) {
            if (player.job?.destination !== player.zone.id) {
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
