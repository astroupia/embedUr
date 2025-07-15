export declare class AIPersonaResponseDto {
    id: string;
    name: string;
    description?: string;
    prompt: string;
    parameters?: Record<string, any>;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
