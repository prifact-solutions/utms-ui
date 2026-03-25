export interface UserModel {
    id: number;
    email: string;
    first_name: string;
    last_name?: string;
    is_staff: boolean;
    is_active: boolean;
}