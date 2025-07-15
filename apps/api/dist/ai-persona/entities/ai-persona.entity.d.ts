export declare class AIPersonaEntity {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly prompt: string;
    readonly parameters: Record<string, any> | null;
    readonly companyId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, name: string, description: string | null, prompt: string, parameters: Record<string, any> | null, companyId: string, createdAt: Date, updatedAt: Date);
    isEditable(): boolean;
}
