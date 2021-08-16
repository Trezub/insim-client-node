import correiosController from './controllers/correiosController';
import Player from './Player';

export interface Zone {
    name: string;
    texts?: string[];
    handler: (p: Player) => any;
    id: number;
}

export const defaultZones: {
    [key: string]: string;
} = {
    SO1X: 'South City',
    WE2X: 'West Hills',
};

const zones: Zone[] = [
    {
        name: 'Valetim Terra',
        handler: (p) => correiosController.finishJob(p),
        texts: ['Opa vai com calma ai Toretto Vindisio', 'Eai meu chapa'],
        id: 1,
    },
    {
        name: 'Pablito',
        handler: (p) => correiosController.finishJob(p),
        texts: [
            'Fala meu parceirinho, passa pra cá esse bagulho',
            'Você é persistente hein, passa isso antes a polícia embace o nosso trampo',
        ],
        id: 2,
    },
    {
        name: 'Osmar Contato',
        handler: (p) => correiosController.finishJob(p),
        texts: [
            'Salve quebrada, manda o pacotinho e pega o pagamento na saída',
            'Boa pra nóis, você é o melhor entregador que eu tenho, agora sai fora',
        ],
        id: 3,
    },
    {
        name: 'Correios',
        handler: (player: Player) => {
            correiosController.handlePlayerEntrance(player);
        },
        id: 4,
    },
    {
        name: 'Pastelaria Tekomo Nakama',
        handler: (p) => correiosController.finishJob(p),
        texts: [
            'Obrigado moço, estamos precisando dos ingredientes para fazer os pastéis, tenha um bom dia',
            'Hoje está uma correria, não tivemos tempo de ir ao mercado fazer as compras',
        ],
        id: 5,
    },
    {
        name: 'Ultragaz',
        handler: (p) => correiosController.finishJob(p),
        texts: [
            'Descarrega com cuidado esse botijão aí meu parceiro',
            'Cuidado pra não derrubar esse barato no meu dedo',
        ],
        id: 6,
    },
    {
        name: 'Banco',
        handler: () => {},
        texts: [
            'Seja bem vindo, sou o seu gerente e ajudarei com o que precisar',
            'Cuidado ao sacar uma alta quantia de dinheiro, podem te assaltar assim que sair daqui',
            'Evite de andar com muito dinheiro pela cidade, ultimamente tem crescido o índice de assalto aqui na região',
        ],
        id: 7,
    },
    {
        name: 'Concessionária',
        handler: () => {},
        texts: [
            'Seja bem vindo, será um prazer atender você, você pensa em algum modelo específico?',
            'Olá senhor, temos todos os modelos de veículos, se comprar hoje podemos negociar um IPVA grátis',
            'Opa, você tem cara de quem tem dinheiro, vamos sentar ali na minha mesa',
        ],
        id: 8,
    },
];

export default zones;
