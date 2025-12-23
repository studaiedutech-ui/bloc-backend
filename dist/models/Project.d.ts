export interface Project {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    files?: string;
    created_at?: Date;
    updated_at?: Date;
}
export declare class ProjectModel {
    static findByUserId(userId: number): Promise<Project[]>;
    static findById(id: number): Promise<Project | null>;
    static create(userId: number, name: string, description?: string, files?: string): Promise<Project>;
    static update(id: number, data: Partial<Project>): Promise<Project | null>;
    static delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=Project.d.ts.map