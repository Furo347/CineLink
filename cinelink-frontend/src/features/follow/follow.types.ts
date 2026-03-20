export interface UserLite {
    _id: string;
    name?: string;
    email?: string;
    avatar?: string;
}

export interface FollowRelation {
    _id: string;
    follower: string;
    following: UserLite;
    createdAt?: string;
    updatedAt?: string;
}
