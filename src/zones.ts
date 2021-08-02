import Player from './Player';

export interface Zone {
    name: string;
    texts: string[];
    handler: (player: Player) => any;
    id: number;
}

const zones: Zone[] = [
    {
        name: 'Valetim Terra',
        handler: () => {},
        texts: ['Opa vai com calma ai Toretto Vindisio', 'Eai meu chapa'],
        id: 1,
    },
];

export default zones;
