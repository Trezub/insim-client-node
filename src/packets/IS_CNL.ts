export enum ConnectionLeaveReason {
    LEAVR_DISCO, // 0 - none
    LEAVR_TIMEOUT, // 1 - timed out
    LEAVR_LOSTCONN, // 2 - lost connection
    LEAVR_KICKED, // 3 - kicked
    LEAVR_BANNED, // 4 - banned
    LEAVR_SECURITY, // 5 - security
    LEAVR_CPW, // 6 - cheat protection wrong
    LEAVR_OOS, // 7 - out of sync with host
    LEAVR_JOOS, // 8 - join OOS (initial sync failed)
    LEAVR_HACK, // 9 - invalid packet
    LEAVR_NUM,
}

export interface ConnectionLeaveProps {
    connectionId: number;
    reason: ConnectionLeaveReason;
}

export default {
    fromBuffer(buffer: Buffer): ConnectionLeaveProps {
        const [, , , connectionId, reason] = buffer;
        return {
            connectionId,
            reason,
        };
    },
};
