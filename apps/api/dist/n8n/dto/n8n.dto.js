"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailDraftingPayloadDto = exports.LeadEnrichmentPayloadDto = exports.LeadValidationPayloadDto = exports.ReplyHandlingOutputDto = exports.ReplyHandlingInputDto = exports.EmailDraftingOutputDto = exports.EmailDraftingInputDto = exports.LeadEnrichmentOutputDto = exports.LeadEnrichmentInputDto = exports.LeadValidationOutputDto = exports.LeadValidationInputDto = exports.AiPersonaDto = exports.PromptsDto = exports.ConfigDto = exports.CredentialsDto = exports.ReplyHandlingCompletionPayloadDto = exports.SmartleadReplyPayloadDto = exports.WorkflowLogPayloadDto = exports.WorkflowCompletionPayloadDto = exports.WorkflowCompletionStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var WorkflowCompletionStatus;
(function (WorkflowCompletionStatus) {
    WorkflowCompletionStatus["SUCCESS"] = "SUCCESS";
    WorkflowCompletionStatus["FAILED"] = "FAILED";
    WorkflowCompletionStatus["TIMEOUT"] = "TIMEOUT";
})(WorkflowCompletionStatus || (exports.WorkflowCompletionStatus = WorkflowCompletionStatus = {}));
class WorkflowCompletionPayloadDto {
    workflowId;
    leadId;
    companyId;
    status;
    outputData;
    errorMessage;
    workflowName;
}
exports.WorkflowCompletionPayloadDto = WorkflowCompletionPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowCompletionPayloadDto.prototype, "workflowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowCompletionPayloadDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowCompletionPayloadDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow completion status', enum: WorkflowCompletionStatus }),
    (0, class_validator_1.IsEnum)(WorkflowCompletionStatus),
    __metadata("design:type", String)
], WorkflowCompletionPayloadDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Output data from workflow' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WorkflowCompletionPayloadDto.prototype, "outputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if workflow failed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowCompletionPayloadDto.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Workflow name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowCompletionPayloadDto.prototype, "workflowName", void 0);
class WorkflowLogPayloadDto {
    leadId;
    companyId;
    nodeName;
    outputData;
    timestamp;
}
exports.WorkflowLogPayloadDto = WorkflowLogPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowLogPayloadDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowLogPayloadDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Node name in workflow' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowLogPayloadDto.prototype, "nodeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Output data from node' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WorkflowLogPayloadDto.prototype, "outputData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of log entry' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WorkflowLogPayloadDto.prototype, "timestamp", void 0);
class SmartleadReplyPayloadDto {
    leadId;
    emailId;
    content;
    companyId;
    replyId;
}
exports.SmartleadReplyPayloadDto = SmartleadReplyPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmartleadReplyPayloadDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email ID from Smartlead' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmartleadReplyPayloadDto.prototype, "emailId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reply content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmartleadReplyPayloadDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmartleadReplyPayloadDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply ID if already exists' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmartleadReplyPayloadDto.prototype, "replyId", void 0);
class ReplyHandlingCompletionPayloadDto {
    leadId;
    replyId;
    companyId;
    outputData;
}
exports.ReplyHandlingCompletionPayloadDto = ReplyHandlingCompletionPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lead ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingCompletionPayloadDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reply ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingCompletionPayloadDto.prototype, "replyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Company ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingCompletionPayloadDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Output data from reply handling' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ReplyHandlingCompletionPayloadDto.prototype, "outputData", void 0);
class CredentialsDto {
    airtableApiKey;
    openRouterApiKey;
    scrapingBeeApiKey;
    emailVerificationApiKey;
    clearbitApiKey;
    smartleadApiKey;
    calendlyApiKey;
    apolloApiKey;
    dropContactApiKey;
    linkedinScraperApiKey;
    hunterApiKey;
    snovApiKey;
    gmailApiKey;
    outlookApiKey;
}
exports.CredentialsDto = CredentialsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "airtableApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "openRouterApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "scrapingBeeApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "emailVerificationApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "clearbitApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "smartleadApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "calendlyApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "apolloApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "dropContactApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "linkedinScraperApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "hunterApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "snovApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "gmailApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CredentialsDto.prototype, "outlookApiKey", void 0);
class ConfigDto {
    airtableBaseId;
    airtableTableName;
    backendLogUrl;
    backendCompleteUrl;
    smartleadCampaignId;
    calendlyEventTypeId;
    apolloCompanyId;
    dropContactCompanyId;
    clearbitCompanyId;
    linkedinScraperCompanyId;
    hunterCompanyId;
    snovCompanyId;
    smartleadCompanyId;
    gmailCompanyId;
    outlookCompanyId;
    emailTemplateId;
}
exports.ConfigDto = ConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "airtableBaseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "airtableTableName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "backendLogUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "backendCompleteUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "smartleadCampaignId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "calendlyEventTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "apolloCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "dropContactCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "clearbitCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "linkedinScraperCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "hunterCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "snovCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "smartleadCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "gmailCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "outlookCompanyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigDto.prototype, "emailTemplateId", void 0);
class PromptsDto {
    structureDataPrompt;
    enrichmentPrompt;
    emailDraftPrompt;
    classifyReplyPrompt;
    meetingPrompt;
    validationPrompt;
    scrapingPrompt;
    verificationPrompt;
    scoringPrompt;
    draftingPrompt;
    personalizationPrompt;
    subjectPrompt;
    followUpPrompt;
}
exports.PromptsDto = PromptsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "structureDataPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "enrichmentPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "emailDraftPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "classifyReplyPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "meetingPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "validationPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "scrapingPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "verificationPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "scoringPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "draftingPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "personalizationPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "subjectPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromptsDto.prototype, "followUpPrompt", void 0);
class AiPersonaDto {
    id;
    name;
    description;
    prompt;
    parameters;
}
exports.AiPersonaDto = AiPersonaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiPersonaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiPersonaDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiPersonaDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiPersonaDto.prototype, "prompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AiPersonaDto.prototype, "parameters", void 0);
class LeadValidationInputDto {
    linkedinUrl;
    leadId;
    name;
    clientId;
    credentials;
    config;
    prompts;
}
exports.LeadValidationInputDto = LeadValidationInputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationInputDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationInputDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationInputDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationInputDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CredentialsDto),
    __metadata("design:type", CredentialsDto)
], LeadValidationInputDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConfigDto),
    __metadata("design:type", ConfigDto)
], LeadValidationInputDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PromptsDto),
    __metadata("design:type", PromptsDto)
], LeadValidationInputDto.prototype, "prompts", void 0);
class LeadValidationOutputDto {
    workflow;
    leadId;
    status;
    outputData;
    clientId;
}
exports.LeadValidationOutputDto = LeadValidationOutputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationOutputDto.prototype, "workflow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationOutputDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationOutputDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LeadValidationOutputDto.prototype, "outputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationOutputDto.prototype, "clientId", void 0);
class LeadEnrichmentInputDto {
    leadId;
    name;
    email;
    company;
    jobTitle;
    clientId;
    credentials;
    config;
    prompts;
}
exports.LeadEnrichmentInputDto = LeadEnrichmentInputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentInputDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentInputDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LeadEnrichmentInputDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentInputDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentInputDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentInputDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CredentialsDto),
    __metadata("design:type", CredentialsDto)
], LeadEnrichmentInputDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConfigDto),
    __metadata("design:type", ConfigDto)
], LeadEnrichmentInputDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PromptsDto),
    __metadata("design:type", PromptsDto)
], LeadEnrichmentInputDto.prototype, "prompts", void 0);
class LeadEnrichmentOutputDto {
    workflow;
    leadId;
    status;
    outputData;
    clientId;
}
exports.LeadEnrichmentOutputDto = LeadEnrichmentOutputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentOutputDto.prototype, "workflow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentOutputDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentOutputDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LeadEnrichmentOutputDto.prototype, "outputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentOutputDto.prototype, "clientId", void 0);
class EmailDraftingInputDto {
    leadId;
    name;
    email;
    company;
    jobTitle;
    industry;
    companySize;
    emailVerified;
    clientId;
    credentials;
    config;
    prompts;
    aiPersona;
}
exports.EmailDraftingInputDto = EmailDraftingInputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingInputDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingInputDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EmailDraftingInputDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingInputDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingInputDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingInputDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingInputDto.prototype, "companySize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EmailDraftingInputDto.prototype, "emailVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingInputDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CredentialsDto),
    __metadata("design:type", CredentialsDto)
], EmailDraftingInputDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConfigDto),
    __metadata("design:type", ConfigDto)
], EmailDraftingInputDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PromptsDto),
    __metadata("design:type", PromptsDto)
], EmailDraftingInputDto.prototype, "prompts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AiPersonaDto),
    __metadata("design:type", AiPersonaDto)
], EmailDraftingInputDto.prototype, "aiPersona", void 0);
class EmailDraftingOutputDto {
    workflow;
    leadId;
    status;
    outputData;
    clientId;
}
exports.EmailDraftingOutputDto = EmailDraftingOutputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingOutputDto.prototype, "workflow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingOutputDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingOutputDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], EmailDraftingOutputDto.prototype, "outputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingOutputDto.prototype, "clientId", void 0);
class ReplyHandlingInputDto {
    leadId;
    emailId;
    replyContent;
    clientId;
    credentials;
    config;
    prompts;
}
exports.ReplyHandlingInputDto = ReplyHandlingInputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingInputDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingInputDto.prototype, "emailId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingInputDto.prototype, "replyContent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingInputDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CredentialsDto),
    __metadata("design:type", CredentialsDto)
], ReplyHandlingInputDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConfigDto),
    __metadata("design:type", ConfigDto)
], ReplyHandlingInputDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PromptsDto),
    __metadata("design:type", PromptsDto)
], ReplyHandlingInputDto.prototype, "prompts", void 0);
class ReplyHandlingOutputDto {
    workflow;
    leadId;
    status;
    outputData;
    clientId;
}
exports.ReplyHandlingOutputDto = ReplyHandlingOutputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingOutputDto.prototype, "workflow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingOutputDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingOutputDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ReplyHandlingOutputDto.prototype, "outputData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplyHandlingOutputDto.prototype, "clientId", void 0);
class LeadValidationPayloadDto {
    leadId;
    fullName;
    email;
    linkedinUrl;
    companyId;
    credentials;
    config;
    prompts;
}
exports.LeadValidationPayloadDto = LeadValidationPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationPayloadDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationPayloadDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LeadValidationPayloadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationPayloadDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadValidationPayloadDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CredentialsDto),
    __metadata("design:type", CredentialsDto)
], LeadValidationPayloadDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConfigDto),
    __metadata("design:type", ConfigDto)
], LeadValidationPayloadDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PromptsDto),
    __metadata("design:type", PromptsDto)
], LeadValidationPayloadDto.prototype, "prompts", void 0);
class LeadEnrichmentPayloadDto {
    leadId;
    fullName;
    email;
    linkedinUrl;
    companyId;
    credentials;
    config;
    prompts;
}
exports.LeadEnrichmentPayloadDto = LeadEnrichmentPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentPayloadDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentPayloadDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LeadEnrichmentPayloadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentPayloadDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadEnrichmentPayloadDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CredentialsDto),
    __metadata("design:type", CredentialsDto)
], LeadEnrichmentPayloadDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConfigDto),
    __metadata("design:type", ConfigDto)
], LeadEnrichmentPayloadDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PromptsDto),
    __metadata("design:type", PromptsDto)
], LeadEnrichmentPayloadDto.prototype, "prompts", void 0);
class EmailDraftingPayloadDto {
    leadId;
    fullName;
    email;
    linkedinUrl;
    enrichmentData;
    companyId;
    campaignId;
    aiPersona;
    credentials;
    config;
    prompts;
}
exports.EmailDraftingPayloadDto = EmailDraftingPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingPayloadDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingPayloadDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EmailDraftingPayloadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingPayloadDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], EmailDraftingPayloadDto.prototype, "enrichmentData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingPayloadDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailDraftingPayloadDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AiPersonaDto),
    __metadata("design:type", AiPersonaDto)
], EmailDraftingPayloadDto.prototype, "aiPersona", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CredentialsDto),
    __metadata("design:type", CredentialsDto)
], EmailDraftingPayloadDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConfigDto),
    __metadata("design:type", ConfigDto)
], EmailDraftingPayloadDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PromptsDto),
    __metadata("design:type", PromptsDto)
], EmailDraftingPayloadDto.prototype, "prompts", void 0);
//# sourceMappingURL=n8n.dto.js.map