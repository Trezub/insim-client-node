export enum Penalty {
    PENALTY_NONE, // 0
    PENALTY_DT, // 1
    PENALTY_DT_VALID, // 2
    PENALTY_SG, // 3
    PENALTY_SG_VALID, // 4
    PENALTY_30, // 5
    PENALTY_45, // 6
    PENALTY_NUM,
}

export enum PenaltyReason {
    PENR_UNKNOWN, // 0 - unknown or cleared penalty
    PENR_ADMIN, // 1 - penalty given by admin
    PENR_WRONG_WAY, // 2 - wrong way driving
    PENR_FALSE_START, // 3 - starting before green light
    PENR_SPEEDING, // 4 - speeding in pit lane
    PENR_STOP_SHORT, // 5 - stop-go pit stop too short
    PENR_STOP_LATE, // 6 - compulsory stop is too late
    PENR_NUM,
}

export interface PenaltyProps {
    playerId: number;
    oldPenalties: Penalty;
    newPenalties: Penalty;
    reason: PenaltyReason;
}

export default {
    fromBuffer(buffer: Buffer): PenaltyProps {
        const [, , , playerId, oldPenalties, newPenalties, reason] = buffer;
        return {
            newPenalties,
            oldPenalties,
            playerId,
            reason,
        };
    },
};
