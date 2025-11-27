export interface CreateUserRequest {
    username: string;
    password: string;
    email?: string;
    fullname: string;
    enabled?: boolean;
    roles?: number[];
    permissions?: string[];
}