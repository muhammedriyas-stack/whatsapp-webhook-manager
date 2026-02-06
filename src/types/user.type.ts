import { ROLES } from "@/constants/common";

export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: typeof ROLES[keyof typeof ROLES];
    permissions: string[];
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateUser {
    name: string;
    email: string;
    password?: string;
    role: typeof ROLES[keyof typeof ROLES];
    permissions: string[];
}

export interface IUpdateUser {
    _id: string;
    name?: string;
    email?: string;
    password?: string;
    role?: typeof ROLES[keyof typeof ROLES];
    permissions?: string[];
    isActive?: boolean;
}
