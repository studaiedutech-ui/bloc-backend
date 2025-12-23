export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    created_at?: Date;
    updated_at?: Date;
}
export declare class UserModel {
    static findByEmail(email: string): Promise<User | null>;
    static findById(id: number): Promise<User | null>;
    static create(name: string, email: string, password: string): Promise<User>;
    static update(id: number, data: Partial<User>): Promise<User | null>;
}
//# sourceMappingURL=User.d.ts.map