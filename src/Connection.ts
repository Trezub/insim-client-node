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
    }

    id: number;

    username: string;

    nickname: string;

    isAdmin: boolean;

    player: Player;

    ipAddress: string;

    language: Language;

    userId: number;
}
