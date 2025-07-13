export class AIPersonaEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly prompt: string,
    public readonly parameters: Record<string, any> | null,
    public readonly companyId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isEditable(): boolean {
    // Add future logic for versioning, usage limits, etc.
    return true;
  }
} 