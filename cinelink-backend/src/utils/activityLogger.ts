import Activity from "../models/Activity";

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
        console.error("Erreur log activity:", err);
    }
};
