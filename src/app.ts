import net from 'net';
import { promisify } from 'util';
import inSimInit from './packets/InsimInit';
import { InSimInitFlag } from './enums/InSimInitFlag';
import * as SendMessage from './packets/SendMessage';
import * as InSimTiny from './packets/InSimTiny';
import * as NewConnection from './packets/NewConnection';
import { TinyPacketSubType } from './enums/TinyPacketSubType';
import { PacketType } from './enums/PacketType';
import messageController from './controllers/messageController';
import connectionController from './controllers/connectionController';

const client = new net.Socket();
const sendPacket = promisify(client.write.bind(client));

async function decodePacket(buffer: Buffer) {
    const [, type] = buffer;
    // console.log(`Received ${PacketType[type]}`);
    switch (type) {
        case PacketType.ISP_MSO:
            messageController.handleNewMessage(SendMessage.fromBuffer(buffer));
            break;
        case PacketType.ISP_TINY: {
            const packet = InSimTiny.fromBuffer(buffer);
            if (packet.subType === TinyPacketSubType.TINY_NONE) {
                console.log('Received ping');
                await sendPacket(InSimTiny.fromProps(packet));
            }
        }
        case PacketType.ISP_NCN:
            connectionController.handleNewConnection(NewConnection.fromBuffer(buffer));
            break;
        default:
            break;
    }
}

setTimeout(() => {
    client.connect({
        host: '192.168.0.5',
        port: 29999,
    });
    client.on('data', (originalBuffer) => {
        let buffer = originalBuffer;
        while (buffer.length > 0) {
            const size = buffer.readUInt8();
            decodePacket(buffer.copyWithin(0, 0, size));
            buffer = buffer.slice(size);
        }
    });
    client.on('connect', async () => {
        console.log('Connected to insim');
        await sendPacket(
            inSimInit({
                adminPassword: 'nono123',
                appName: 'TTG Node',
                flags: InSimInitFlag.ISF_AXM_EDIT | InSimInitFlag.ISF_AXM_LOAD,
                inSimVersion: 8,
                interval: 10,
                prefixChar: '!',
                udpPort: 0,
            }),
        );
        await sendPacket(
            SendMessage.fromProps({
                message: 'HELLO WORLD!',
            }),
        );
        await sendPacket(
            InSimTiny.fromProps({ requestId: 255, subType: TinyPacketSubType.TINY_NCN }),
        );
    });
}, 2000);
