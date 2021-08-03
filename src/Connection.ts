import { blue, lightGreen, white } from './colors';
import { Language } from './enums/Languages';
import inSimClient from './inSimClient';
import IS_BTN, { ButtonStyle } from './packets/IS_BTN';
import { NewConnectionProps } from './packets/IS_NCN';
import Player from './Player';

export default class Connection {
    constructor({
        connectionId,
        isAdmin,
        nickname,
        username,
    }: NewConnectionProps) {
        this.id = connectionId;
        this.isAdmin = isAdmin;
        this.nickname = nickname;
        this.username = username;

        inSimClient.sendPacket(
            IS_BTN.fromProps({
                connectionId,
                id: 1,
                requestId: 1,
                text: `${white}R$${lightGreen}${(this.cash / 100).toFixed(2)}`,
                alwaysVisible: false,
                height: 5,
                left: 74,
                top: 1,
                width: 10,
                style: ButtonStyle.ISB_DARK,
            }),
        );
        inSimClient.sendPacket(
            IS_BTN.fromProps({
                connectionId,
                id: 2,
                requestId: 3,
                text: `${white}Saúde: ${lightGreen}${this.health}%`,
                alwaysVisible: false,
                height: 5,
                left: 85,
                top: 1,
                width: 15,
                style: ButtonStyle.ISB_DARK,
            }),
        );

        setInterval(() => {
            this.cash += 1;
        }, 1000);
    }

    id: number;

    username: string;

    nickname: string;

    isAdmin: boolean;

    player: Player;

    ipAddress: string;

    language: Language;

    userId: number;

    private _health: number = 100;

    private _cash: number = 100;

    get cash() {
        return this._cash;
    }

    set cash(value: number) {
        this._cash = value;
        inSimClient.sendPacket(
            IS_BTN.fromProps({
                connectionId: this.id,
                id: 1,
                requestId: 1,
                text: `${white}R$${lightGreen}${(this.cash / 100).toFixed(2)}`,
            }),
        );
    }

    get health() {
        return this._health;
    }

    set health(value: number) {
        inSimClient.sendPacket(
            IS_BTN.fromProps({
                connectionId: this.id,
                id: 2,
                requestId: 2,
                text: `${white}Saúde: ${lightGreen}${this.health}%`,
            }),
        );
        this._health = value;
    }
}
