import GuiController from './controllers/GuiController';
import { Language } from './enums/Languages';
import inSimClient from './inSimClient';
import { NewConnectionProps } from './packets/IS_NCN';
import IS_PLC from './packets/IS_PLC';
import Player, { PlayerCar } from './Player';
import { PlayerCar as PlayerCarEnum } from './enums/PlayerCar';

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
        this.gui = new GuiController(this);
    }

    id: number;

    username: string;

    private _cars: PlayerCar[];

    get cars() {
        return this._cars;
    }

    set cars(value: PlayerCar[]) {
        this._cars = value;
        const cars = value.reduce<PlayerCarEnum>(
            (acc, val) =>
                acc | PlayerCarEnum[val as keyof typeof PlayerCarEnum],
            0,
        );
        inSimClient.sendPacket(
            IS_PLC.fromProps({
                connectionId: this.id,
                cars,
            }),
        );
    }

    nickname: string;

    isAdmin: boolean;

    player: Player;

    ipAddress: string;

    language: Language;

    userId: number;

    gui: GuiController;

    private _health: number;

    private _cash: number;

    get cash() {
        return this._cash;
    }

    set cash(value: number) {
        this._cash = value;
        this.gui.handleCashUpdate();
    }

    get health() {
        return this._health;
    }

    set health(value: number) {
        this._health = value;
        this.gui.handleHealthUpdate();
    }
}
