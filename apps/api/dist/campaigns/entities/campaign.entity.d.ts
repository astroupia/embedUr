import { CampaignStatus } from '../constants/campaign.constants';
export interface AIPersonaPreview {
    id: string;
    name: string;
    description?: string;
}
export interface WorkflowPreview {
    id: string;
    name: string;
    type: string;
}
export declare class CampaignEntity {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly status: CampaignStatus;
    readonly aiPersonaId: string | null;
    readonly workflowId: string | null;
    readonly companyId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly aiPersona?: AIPersonaPreview | undefined;
    readonly workflow?: WorkflowPreview | undefined;
    readonly leadCount?: number | undefined;
    constructor(id: string, name: string, description: string | null, status: CampaignStatus, aiPersonaId: string | null, workflowId: string | null, companyId: string, createdAt: Date, updatedAt: Date, aiPersona?: AIPersonaPreview | undefined, workflow?: WorkflowPreview | undefined, leadCount?: number | undefined);
    get score(): number;
    get isActive(): boolean;
    get isEditable(): boolean;
    get isDeletable(): boolean;
    get hasAI(): boolean;
    get hasWorkflow(): boolean;
    canTransitionTo(newStatus: CampaignStatus): boolean;
    canActivate(): boolean;
    canPause(): boolean;
    canComplete(): boolean;
    canArchive(): boolean;
    static create(name: string, description: string | null, companyId: string, aiPersonaId?: string, workflowId?: string): CampaignEntity;
    withStatus(newStatus: CampaignStatus): CampaignEntity;
    withRelations(aiPersona?: AIPersonaPreview, workflow?: WorkflowPreview, leadCount?: number): CampaignEntity;
}
