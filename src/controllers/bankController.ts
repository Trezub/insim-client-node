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
                    height: 150,
                    width: 100,
                    left: 50,
                    top: 25,
                    style: ButtonStyle.ISB_DARK,
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
                    style: ButtonStyle.ISB_LIGHT,
                    text: `${red}^H¡y^LSantoandré^H¡z^L`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 102,
                    height: 100,
                    width: 49,
                    left: 100,
                    top: 27 + 16,
                    style: ButtonStyle.ISB_LIGHT,
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
                    text: `${white}Saldo: ${darkGreen}R$5169,45`,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 1,
                    id: 107,
                    height: 8,
                    width: 24,
                    left: 51 + 12,
                    top: 49 + 15,
                    text: `${white}Depositar tudo`,
                    style: ButtonStyle.ISB_LIGHT,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 100,
                    id: 108,
                    height: 8,
                    width: 24,
                    left: 51 + 12,
                    top: 49 + 15 + 9 * 1,
                    text: `${white}Sacar tudo`,
                    style: ButtonStyle.ISB_LIGHT | ButtonStyle.ISB_CLICK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 101,
                    id: 109,
                    height: 8,
                    width: 24,
                    left: 51 + 12,
                    top: 49 + 15 + 9 * 2,
                    text: `${white}Depositar valor`,
                    style: ButtonStyle.ISB_LIGHT | ButtonStyle.ISB_CLICK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    requestId: 102,
                    id: 110,
                    height: 8,
                    width: 24,
                    left: 51 + 12,
                    top: 49 + 15 + 9 * 3,
                    text: `${white}Sacar valor`,
                    style: ButtonStyle.ISB_LIGHT | ButtonStyle.ISB_CLICK,
                }),
            ]),
        );
    }
}

export default new BankController();
