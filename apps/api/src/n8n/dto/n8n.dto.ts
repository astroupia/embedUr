import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsBoolean, ValidateNested, IsEmail, IsArray, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum WorkflowCompletionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
}

export class WorkflowCompletionPayloadDto {
  @ApiProperty({ description: 'Workflow ID' })
  @IsString()
  workflowId: string;

  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Workflow completion status', enum: WorkflowCompletionStatus })
  @IsEnum(WorkflowCompletionStatus)
  status: WorkflowCompletionStatus;

  @ApiPropertyOptional({ description: 'Output data from workflow' })
  @IsOptional()
  @IsObject()
  outputData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Error message if workflow failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Workflow name' })
  @IsOptional()
  @IsString()
  workflowName?: string;
}

export class WorkflowLogPayloadDto {
  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Node name in workflow' })
  @IsString()
  nodeName: string;

  @ApiProperty({ description: 'Output data from node' })
  @IsObject()
  outputData: Record<string, any>;

  @ApiProperty({ description: 'Timestamp of log entry' })
  @IsDateString()
  timestamp: string;
}

export class SmartleadReplyPayloadDto {
  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Email ID from Smartlead' })
  @IsString()
  emailId: string;

  @ApiProperty({ description: 'Reply content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiPropertyOptional({ description: 'Reply ID if already exists' })
  @IsOptional()
  @IsString()
  replyId?: string;
}

export class ReplyHandlingCompletionPayloadDto {
  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Reply ID' })
  @IsString()
  replyId: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Output data from reply handling' })
  @IsObject()
  outputData: Record<string, any>;
}

// --- Shared Types ---

export class CredentialsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() airtableApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() openRouterApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() scrapingBeeApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emailVerificationApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clearbitApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() smartleadApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() calendlyApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() apolloApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dropContactApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinScraperApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hunterApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() snovApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gmailApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() outlookApiKey?: string;
}

export class ConfigDto {
  @ApiProperty() @IsString() airtableBaseId: string;
  @ApiProperty() @IsString() airtableTableName: string;
  @ApiProperty() @IsString() backendLogUrl: string;
  @ApiProperty() @IsString() backendCompleteUrl: string;
  @ApiPropertyOptional() @IsOptional() @IsString() smartleadCampaignId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() calendlyEventTypeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() apolloCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dropContactCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clearbitCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinScraperCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hunterCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() snovCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() smartleadCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gmailCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() outlookCompanyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emailTemplateId?: string;
}

export class PromptsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() structureDataPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() enrichmentPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emailDraftPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() classifyReplyPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meetingPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() validationPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() scrapingPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() verificationPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() scoringPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() draftingPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() personalizationPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subjectPrompt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() followUpPrompt?: string;
}

export class AiPersonaDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() prompt: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() parameters?: Record<string, any>;
}

// --- 1. Lead Validation and LinkedIn Scraping ---
export class LeadValidationInputDto {
  @ApiProperty() @IsString() linkedinUrl: string;
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
  @ApiProperty() @ValidateNested() @Type(() => CredentialsDto) credentials: CredentialsDto;
  @ApiProperty() @ValidateNested() @Type(() => ConfigDto) config: ConfigDto;
  @ApiProperty() @ValidateNested() @Type(() => PromptsDto) prompts: PromptsDto;
}

export class LeadValidationOutputDto {
  @ApiProperty() @IsString() workflow: string;
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() status: string;
  @ApiProperty() @IsObject() outputData: {
    leadId: string;
    name: string;
    email?: string;
    company?: string;
    jobTitle?: string;
  };
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
}

// --- 2. Lead Enrichment and Verification ---
export class LeadEnrichmentInputDto {
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
  @ApiProperty() @ValidateNested() @Type(() => CredentialsDto) credentials: CredentialsDto;
  @ApiProperty() @ValidateNested() @Type(() => ConfigDto) config: ConfigDto;
  @ApiProperty() @ValidateNested() @Type(() => PromptsDto) prompts: PromptsDto;
}

export class LeadEnrichmentOutputDto {
  @ApiProperty() @IsString() workflow: string;
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() status: string;
  @ApiProperty() @IsObject() outputData: {
    leadId: string;
    name: string;
    email?: string;
    company?: string;
    jobTitle?: string;
    industry?: string;
    companySize?: string;
    emailVerified?: boolean;
  };
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
}

// --- 3. Email Drafting and Smartlead Sending ---
export class EmailDraftingInputDto {
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() industry?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companySize?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() emailVerified?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
  @ApiProperty() @ValidateNested() @Type(() => CredentialsDto) credentials: CredentialsDto;
  @ApiProperty() @ValidateNested() @Type(() => ConfigDto) config: ConfigDto;
  @ApiProperty() @ValidateNested() @Type(() => PromptsDto) prompts: PromptsDto;
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => AiPersonaDto) aiPersona?: AiPersonaDto;
}

export class EmailDraftingOutputDto {
  @ApiProperty() @IsString() workflow: string;
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() status: string;
  @ApiProperty() @IsObject() outputData: {
    emailSent: boolean;
    emailId: string;
    leadId: string;
  };
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
}

// --- 4. Reply Handling and Meeting Scheduling ---
export class ReplyHandlingInputDto {
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() emailId: string;
  @ApiProperty() @IsString() replyContent: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
  @ApiProperty() @ValidateNested() @Type(() => CredentialsDto) credentials: CredentialsDto;
  @ApiProperty() @ValidateNested() @Type(() => ConfigDto) config: ConfigDto;
  @ApiProperty() @ValidateNested() @Type(() => PromptsDto) prompts: PromptsDto;
}

export class ReplyHandlingOutputDto {
  @ApiProperty() @IsString() workflow: string;
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() status: string;
  @ApiProperty() @IsObject() outputData: {
    leadId: string;
    emailId: string;
    replySentiment: string;
    meetingLink?: string;
  };
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
}

// --- Workflow Payload DTOs for LeadEventsService ---

export class LeadValidationPayloadDto {
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinUrl?: string;
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @ValidateNested() @Type(() => CredentialsDto) credentials: CredentialsDto;
  @ApiProperty() @ValidateNested() @Type(() => ConfigDto) config: ConfigDto;
  @ApiProperty() @ValidateNested() @Type(() => PromptsDto) prompts: PromptsDto;
}

export class LeadEnrichmentPayloadDto {
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinUrl?: string;
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @ValidateNested() @Type(() => CredentialsDto) credentials: CredentialsDto;
  @ApiProperty() @ValidateNested() @Type(() => ConfigDto) config: ConfigDto;
  @ApiProperty() @ValidateNested() @Type(() => PromptsDto) prompts: PromptsDto;
}

export class EmailDraftingPayloadDto {
  @ApiProperty() @IsString() leadId: string;
  @ApiProperty() @IsString() fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() enrichmentData?: Record<string, any>;
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() campaignId: string;
  @ApiProperty() @ValidateNested() @Type(() => AiPersonaDto) aiPersona: AiPersonaDto;
  @ApiProperty() @ValidateNested() @Type(() => CredentialsDto) credentials: CredentialsDto;
  @ApiProperty() @ValidateNested() @Type(() => ConfigDto) config: ConfigDto;
  @ApiProperty() @ValidateNested() @Type(() => PromptsDto) prompts: PromptsDto;
} 