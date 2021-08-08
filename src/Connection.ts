import GuiController from './controllers/GuiController';
import { Language } from './enums/Languages';
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
        this.gui = new GuiController(this);
    }

    id: number;

    username: string;

    nickname: string;

    isAdmin: boolean;

    player: Player;

    ipAddress: string;

    language: Language;

    userId: number;

    gui: GuiController;

    private _health: number = 100;

    private _cash: number = 16734932;

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
