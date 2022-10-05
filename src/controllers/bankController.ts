/* eslint-disable no-bitwise */
import { darkGreen, lightGreen, red, white } from '../colors';
import inSimClient from '../inSimClient';
import IS_BTN, { ButtonStyle } from '../packets/IS_BTN';
import Player from '../Player';

export class BankController {
    async handlePlayerEntrance(player: Player) {
        const connectionId = player.connection.id;
        await inSimClient.sendPacket(
            Buffer.from([
                // Container
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 100,
                    height: 120,
                    width: 100,
                    left: 50,
                    top: 25,
                    style: ButtonStyle.DARK,
                }),
                // Title
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 101,
                    height: 15,
                    width: 98,
                    left: 51,
                    top: 27,
                    style: ButtonStyle.LIGHT,
                    text: `${red}^H¡y^LSantoandré^H¡z^L`,
                }),
                // Last Transactions container
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 102,
                    height: 100,
                    width: 49,
                    left: 100,
                    top: 27 + 16,
                    style: ButtonStyle.LIGHT,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 103,
                    height: 10,
                    width: 49,
                    left: 100,
                    top: 27 + 17,
                    text: 'Últimas transações',
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 104,
                    height: 8,
                    width: 49,
                    left: 100,
                    top: 27 + 28 + 1,
                    text: `Saque       -   ${red}R$-105,79`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 105,
                    height: 8,
                    width: 49,
                    left: 100,
                    top: 27 + 28 + 1 + 9 * 1,
                    text: `Depósito    -       ${lightGreen}R$32,49`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 106,
                    height: 8,
                    width: 49,
                    left: 51,
                    top: 49,
                    text: `${white}Saldo: ${darkGreen}R$${(
                        player.connection.bankCash / 100
                    ).toFixed(2)}`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 100,
                    id: 107,
                    height: 8,
                    width: 24,
                    left: 51 + 12,
                    top: 49 + 15,
                    text: `${white}Depositar tudo`,
                    style: ButtonStyle.LIGHT | ButtonStyle.CLICK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 101,
                    id: 108,
                    height: 8,
                    width: 24,
                    left: 51 + 12,
                    top: 49 + 15 + 9 * 1,
                    text: `${white}Sacar tudo`,
                    style: ButtonStyle.LIGHT | ButtonStyle.CLICK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 102,
                    id: 109,
                    height: 8,
                    width: 24,
                    left: 51 + 12,
                    top: 49 + 15 + 9 * 2,
                    typeIn: 9,
                    typeInDescription: `${white}Digite o valor a ser depositado:`,
                    text: `${white}Depositar valor`,
                    style: ButtonStyle.LIGHT | ButtonStyle.CLICK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 103,
                    id: 110,
                    height: 8,
                    width: 24,
                    left: 51 + 12,
                    top: 49 + 15 + 9 * 3,
                    text: `${white}Sacar valor`,
                    typeIn: 9,
                    typeInDescription: `${white}Digite o valor a ser sacado:`,
                    style: ButtonStyle.LIGHT | ButtonStyle.CLICK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 111,
                    height: 10,
                    width: 26,
                    left: 150 - 25,
                    top: 25 + 121,
                    style: ButtonStyle.LIGHT,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 200,
                    id: 112,
                    height: 8,
                    width: 24,
                    left: 150 - 24,
                    top: 25 + 122,
                    text: 'Fechar',
                    style:
                        ButtonStyle.DARK |
                        ButtonStyle.CANCEL |
                        ButtonStyle.CLICK,
                }),
            ]),
        );
    }
}

export default new BankController();
