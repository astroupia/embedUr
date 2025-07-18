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

export class CampaignEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly status: CampaignStatus,
    public readonly aiPersonaId: string | null,
    public readonly workflowId: string | null,
    public readonly companyId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly aiPersona?: AIPersonaPreview,
    public readonly workflow?: WorkflowPreview,
    public readonly leadCount?: number,
  ) {}

  // Business logic methods
  public get score(): number {
    let score = 0;
    
    if (this.status === CampaignStatus.ACTIVE) score += 10;
    if (this.aiPersonaId) score += 15;
    if (this.workflowId) score += 20;
    if (this.leadCount && this.leadCount > 0) score += 25;
    
    return score;
  }

  public get isActive(): boolean {
    return this.status === CampaignStatus.ACTIVE;
  }

  public get isEditable(): boolean {
    return this.status !== CampaignStatus.ARCHIVED && this.status !== CampaignStatus.COMPLETED;
  }

  public get isDeletable(): boolean {
    return this.status === CampaignStatus.DRAFT || this.status === CampaignStatus.ARCHIVED;
  }

  public get hasAI(): boolean {
    return this.aiPersonaId !== null;
  }

  public get hasWorkflow(): boolean {
    return this.workflowId !== null;
  }

  public canTransitionTo(newStatus: CampaignStatus): boolean {
    const validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
      [CampaignStatus.DRAFT]: [CampaignStatus.ACTIVE, CampaignStatus.ARCHIVED],
      [CampaignStatus.ACTIVE]: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED, CampaignStatus.ARCHIVED],
      [CampaignStatus.PAUSED]: [CampaignStatus.ACTIVE, CampaignStatus.COMPLETED, CampaignStatus.ARCHIVED],
      [CampaignStatus.COMPLETED]: [CampaignStatus.ARCHIVED],
      [CampaignStatus.ARCHIVED]: [],
    };

    return validTransitions[this.status].includes(newStatus);
  }

  public canActivate(): boolean {
    return this.status === CampaignStatus.DRAFT || this.status === CampaignStatus.PAUSED;
  }

  public canPause(): boolean {
    return this.status === CampaignStatus.ACTIVE;
  }

  public canComplete(): boolean {
    return this.status === CampaignStatus.ACTIVE || this.status === CampaignStatus.PAUSED;
  }

  public canArchive(): boolean {
    return this.status !== CampaignStatus.ARCHIVED;
  }

  public static create(
    name: string,
    description: string | null,
    companyId: string,
    aiPersonaId?: string,
    workflowId?: string,
  ): CampaignEntity {
    return new CampaignEntity(
      '', // ID will be generated by the database
      name,
      description,
      CampaignStatus.DRAFT,
      aiPersonaId || null,
      workflowId || null,
      companyId,
      new Date(),
      new Date(),
    );
  }

  public withStatus(newStatus: CampaignStatus): CampaignEntity {
    return new CampaignEntity(
      this.id,
      this.name,
      this.description,
      newStatus,
      this.aiPersonaId,
      this.workflowId,
      this.companyId,
      this.createdAt,
      new Date(),
      this.aiPersona,
      this.workflow,
      this.leadCount,
    );
  }

  public withRelations(
    aiPersona?: AIPersonaPreview,
    workflow?: WorkflowPreview,
    leadCount?: number,
  ): CampaignEntity {
    return new CampaignEntity(
      this.id,
      this.name,
      this.description,
      this.status,
      this.aiPersonaId,
      this.workflowId,
      this.companyId,
      this.createdAt,
      this.updatedAt,
      aiPersona,
      workflow,
      leadCount,
    );
  }
} 