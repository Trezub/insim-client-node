import { Car, Language } from '@prisma/client';
import GuiController from './controllers/GuiController';
import inSimClient from './inSimClient';
import { NewConnectionProps } from './packets/IS_NCN';
import IS_PLC from './packets/IS_PLC';
import Player from './Player';
import { PlayerCar } from './enums/PlayerCar';
import healthController from './controllers/healthController';
import reduceToEnum from './utils/reduceToEnum';
import createAutoFailingPromise from './utils/autoFailingPromise';
import { lightGreen, red } from './colors';

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

        this.connectionInfoPromise = createAutoFailingPromise(
            10000,
            `Connection info did not arrive in time for connection ${this.id} (${this.username})`,
        );
    }

    id: number;

    username: string;

    private _cars: Car[];

    get cars() {
        return this._cars;
    }

    set cars(value: Car[]) {
        this._cars = value;
        const cars = this.canUseAnyCar
            ? PlayerCar.ALL
            : reduceToEnum(
                  PlayerCar,
                  value
                      .filter(({ allowed }) => allowed)
                      .map(({ name }) => name as keyof typeof PlayerCar),
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

    connectionInfoPromise: Promise<void> & {
        resolve: () => void;
    };

    ipAddress: string;

    language: Language;

    userId: number;

    canUseAnyCar: boolean;

    gui: GuiController;

    bankCash: number;

    private _health: number;

    private _cash = 0;

    get cash() {
        return this._cash;
    }

    set cash(value: number) {
        this._cash = value;

        this.gui.hud.getChild('cash').text = `${
            this.cash >= 0 ? lightGreen : red
        }R$${(this.cash / 100).toFixed(2)}`;
    }

    get health() {
        return this._health;
    }

    set health(value: number) {
        if (value < 0) {
            this._health = 0;
        } else {
            this._health = value;
        }
        if (this._health === 0) {
            healthController.handlePlayerDied(this);
        }
        this.gui.hud.getChild('health').text = `Saúde: ${
            this.health >= 10 ? lightGreen : red
        }${this.health}%`;
    }
}
