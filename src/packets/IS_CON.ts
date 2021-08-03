import CarContact, { CarContactProps } from './helpers/CarContact';

export interface ContactProps {
    closingSpeed: number;
    carA: CarContactProps;
    carB: CarContactProps;
}

export default {
    fromBuffer(buffer: Buffer): ContactProps {
        const [, , , , closingSpeed] = buffer;
        const carA = CarContact.fromBuffer(buffer.slice(8, 25));
        const carB = CarContact.fromBuffer(buffer.slice(25, 42));
        return {
            closingSpeed,
            carA,
            carB,
        };
    },
};
