import prisma from './prisma';

const gameCars = [
    'UF1',
    'XFG',
    'XRG',
    'XRT',
    'RB4',
    'FXO',
    'LX4',
    'LX6',
    'MRT',
    'RAC',
    'FZ5',
    'FOX',
    'XFR',
    'UFR',
    'FO8',
    'FXR',
    'XRR',
    'FZR',
    'BF1',
    'FBM',
] as const;

async function main() {
    await prisma.car.createMany({
        data: gameCars.map((car) => ({
            name: car,
            allowed: true,
        })),
    });
}

main()
    .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
