/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
import { lightGreen, red, white } from '../colors';
import Connection from '../Connection';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import Player from '../Player';
import prisma from '../prisma';
import { createComponent, ProxiedUiComponent } from '../utils/ui';
import connectionController from './connectionController';

function handleTransaction(
    clickedButton: ProxiedUiComponent,
    type: 'withdraw' | 'deposit',
    value: number,
    connection: Connection,
) {
    if (type === 'withdraw') {
        if (connection.bankCash - value < 0) {
            sendMessageToConnection(
                `${red}| ${white}Você não possui dinheiro suficiente no banco para realizar esta operação.`,
                connection,
                'error',
            );
            return;
        }
        connection.bankCash -= value;
        connection.cash += value;
    } else {
        if (connection.cash - value < 0) {
            sendMessageToConnection(
                `${red}| ${white}Você não possui dinheiro suficiente na carteira para realizar esta operação.`,
                connection,
                'error',
            );
            return;
        }
        connection.bankCash += value;
        connection.cash -= value;
    }

    prisma.bankTransaction.create({
        data: {
            type,
            user: {
                connect: {
                    id: connection.userId,
                },
            },
            value: type === 'deposit' ? value : value * -1,
        },
    });

    clickedButton.parent.parent.getChild('bankCash').text = `${white}Saldo: ${
        connection.bankCash < 0 ? red : lightGreen
    }R$${(connection.bankCash / 100).toFixed(2)}`;
}

async function handlePlayerEntrance(player: Player) {
    const connectionId = player.connection.id;
    const connection = connectionController.connections.get(connectionId);
    if (!connection) {
        return;
    }

    connection.gui.openWindow = createComponent({
        connectionId,
        props: {
            top: 50,
            left: 50,
            height: 75,
            width: 100,
            style: 'light',
            name: 'bank',
            children: [
                {
                    top: 0,
                    left: 0,
                    width: 98,
                    height: 15,
                    text: `${red}^H¡y^LSantoandré^H¡z^L`,
                },
                {
                    top: 15,
                    left: 1,
                    width: 98,
                    height: 75 - 16,
                    style: 'dark',
                    children: [
                        {
                            name: 'bankCash',
                            top: 1,
                            left: 98 - 31,
                            height: 7,
                            width: 30,
                            align: 'right',
                            text: `${white}Saldo: ${
                                connection.bankCash < 0 ? red : lightGreen
                            }R$${(connection.bankCash / 100).toFixed(2)}`,
                        },
                        {
                            isVirtual: true,
                            top: 30,
                            left: 10,
                            height: 0,
                            width: 0,
                            children: [
                                {
                                    name: 'input',
                                    top: 0,
                                    left: 0,
                                    height: 10,
                                    width: 30,
                                    typeInMax: 10,
                                    initTypeInWithText: true,
                                    state: {
                                        value: connection.cash,
                                    },
                                    typeInDescription:
                                        'Digite a quantia para depositar ou sacar',
                                    text: `${white}${(
                                        connection.cash / 100
                                    ).toFixed(2)}`,
                                    style: 'dark',
                                    onType({ text }) {
                                        this.text = `${white}${parseFloat(
                                            text,
                                        )}`;
                                        this.state.value =
                                            parseFloat(text) * 100;
                                    },
                                },
                                {
                                    top: 0,
                                    left: 30,
                                    height: 10,
                                    width: 20,
                                    text: 'Sacar',
                                    style: 'dark',
                                    onClick() {
                                        const { value } =
                                            this.parent.getChild('input').state;
                                        handleTransaction(
                                            this,
                                            'withdraw',
                                            value,
                                            connection,
                                        );
                                    },
                                },
                                {
                                    top: 0,
                                    left: 50,
                                    height: 10,
                                    width: 20,
                                    text: 'Depositar',
                                    style: 'dark',
                                    onClick() {
                                        const { value } =
                                            this.parent.getChild('input').state;
                                        handleTransaction(
                                            this,
                                            'deposit',
                                            value,
                                            connection,
                                        );
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    });
}

export default {
    handlePlayerEntrance,
};
