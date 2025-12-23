export interface ChatMessage {
    id: number;
    user_id: number;
    project_id?: number;
    role: 'user' | 'assistant';
    content: string;
    created_at?: Date;
}
export declare class ChatModel {
    static findByUserId(userId: number, limit?: number): Promise<ChatMessage[]>;
    static findByProjectId(projectId: number): Promise<ChatMessage[]>;
    static create(userId: number, role: string, content: string, projectId?: number): Promise<ChatMessage>;
}
//# sourceMappingURL=Chat.d.ts.map