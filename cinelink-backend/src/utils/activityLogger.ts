import Activity from "../models/Activity";
import { logger } from "../config/logger";

export const logActivity = async (data: {
    actor: string;
    type: string;
    targetMovie?: number;
    targetUser?: string;
    payload?: any;
}) => {
    try {
        await Activity.create(data);
    } catch (err) {
        logger.error("Erreur log activity", { error: err });
    }
};
