import prisma from '../prisma';

export default async function getCar(car: string | number) {
    return prisma.car.findFirst({
        where: {
            name: typeof car === 'string' ? car : undefined,
            skinId:
                typeof car === 'number'
                    ? car.toString(16).toUpperCase()
                    : undefined,
        },
    });
}
