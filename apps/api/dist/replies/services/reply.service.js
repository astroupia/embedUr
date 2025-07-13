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
var ReplyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyService = void 0;
const common_1 = require("@nestjs/common");
const reply_repository_1 = require("../repositories/reply.repository");
const lead_events_service_1 = require("../../leads/services/lead-events.service");
const reply_mapper_1 = require("../mappers/reply.mapper");
const prisma_1 = require("../../../generated/prisma");
let ReplyService = ReplyService_1 = class ReplyService {
    replyRepository;
    leadEvents;
    logger = new common_1.Logger(ReplyService_1.name);
    constructor(replyRepository, leadEvents) {
        this.replyRepository = replyRepository;
        this.leadEvents = leadEvents;
    }
    async create(createDto, companyId) {
        this.logger.log(`Creating reply for company ${companyId}`);
        const reply = await this.replyRepository.create(createDto, companyId);
        await this.triggerReplyClassification(reply);
        await this.leadEvents.logExecution(reply, 'REPLY_CREATED', {
            leadId: reply.leadId,
            emailLogId: reply.emailLogId,
            contentLength: reply.content.length,
        });
        this.logger.log(`Reply created successfully: ${reply.id}`);
        const responseDto = reply_mapper_1.ReplyMapper.toDto(reply);
        if (!responseDto) {
            throw new Error('Failed to create reply DTO');
        }
        return responseDto;
    }
    async findAll(companyId, query) {
        this.logger.log(`Fetching replies for company ${companyId} with cursor: ${query.cursor}`);
        const result = await this.replyRepository.findWithCursor(companyId, query);
        this.logger.log(`Found ${result.data.length} replies for company ${companyId}`);
        return {
            data: reply_mapper_1.ReplyMapper.toDtoArray(result.data),
            nextCursor: result.nextCursor,
        };
    }
    async findOne(id, companyId) {
        this.logger.log(`Fetching reply ${id} for company ${companyId}`);
        const reply = await this.replyRepository.findOne(id, companyId);
        if (!reply) {
            throw new common_1.NotFoundException('Reply not found');
        }
        this.logger.log(`Reply ${id} found successfully`);
        const responseDto = reply_mapper_1.ReplyMapper.toDto(reply);
        if (!responseDto) {
            throw new Error('Failed to create reply DTO');
        }
        return responseDto;
    }
    async update(id, companyId, updateDto) {
        this.logger.log(`Updating reply ${id} for company ${companyId}`);
        const currentReply = await this.replyRepository.findOne(id, companyId);
        if (!currentReply) {
            throw new common_1.NotFoundException('Reply not found');
        }
        if (!currentReply.canBeUpdated()) {
            throw new common_1.ConflictException('Reply has already been handled and cannot be updated');
        }
        const updatedReply = await this.replyRepository.update(id, companyId, updateDto);
        await this.leadEvents.logExecution(updatedReply, 'REPLY_UPDATED', {
            previousClassification: currentReply.classification,
            newClassification: updatedReply.classification,
            handledBy: updateDto.handledBy,
        });
        this.logger.log(`Reply ${id} updated successfully`);
        const responseDto = reply_mapper_1.ReplyMapper.toDto(updatedReply);
        if (!responseDto) {
            throw new Error('Failed to create reply DTO');
        }
        return responseDto;
    }
    async remove(id, companyId) {
        this.logger.log(`Removing reply ${id} for company ${companyId}`);
        const reply = await this.replyRepository.findOne(id, companyId);
        if (!reply) {
            throw new common_1.NotFoundException('Reply not found');
        }
        await this.replyRepository.remove(id, companyId);
        await this.leadEvents.logExecution(reply, 'REPLY_DELETED', {
            leadId: reply.leadId,
            emailLogId: reply.emailLogId,
            classification: reply.classification,
        });
        this.logger.log(`Reply ${id} removed successfully`);
    }
    async findByLead(leadId, companyId) {
        this.logger.log(`Fetching replies for lead ${leadId} in company ${companyId}`);
        const replies = await this.replyRepository.findByLead(leadId, companyId);
        this.logger.log(`Found ${replies.length} replies for lead ${leadId}`);
        return reply_mapper_1.ReplyMapper.toDtoArray(replies);
    }
    async findByEmailLog(emailLogId, companyId) {
        this.logger.log(`Fetching replies for email log ${emailLogId} in company ${companyId}`);
        const replies = await this.replyRepository.findByEmailLog(emailLogId, companyId);
        this.logger.log(`Found ${replies.length} replies for email log ${emailLogId}`);
        return reply_mapper_1.ReplyMapper.toDtoArray(replies);
    }
    async findByClassification(classification, companyId) {
        this.logger.log(`Fetching replies with classification ${classification} in company ${companyId}`);
        const replies = await this.replyRepository.findByClassification(classification, companyId);
        this.logger.log(`Found ${replies.length} replies with classification ${classification}`);
        return reply_mapper_1.ReplyMapper.toDtoArray(replies);
    }
    async findRequiringAttention(companyId) {
        this.logger.log(`Fetching replies requiring attention in company ${companyId}`);
        const replies = await this.replyRepository.findRequiringAttention(companyId);
        this.logger.log(`Found ${replies.length} replies requiring attention`);
        return reply_mapper_1.ReplyMapper.toDtoArray(replies);
    }
    async getStats(companyId) {
        this.logger.log(`Fetching reply stats for company ${companyId}`);
        const stats = await this.replyRepository.getStats(companyId);
        this.logger.log(`Reply stats for company ${companyId}: total=${stats.total}`);
        return stats;
    }
    async handleWorkflowCompletion(workflowData) {
        this.logger.log(`Handling workflow completion for reply ${workflowData.replyId}`);
        const { replyId, companyId, replySentiment, meetingLink, metadata } = workflowData;
        const updatedReply = await this.replyRepository.updateWithWorkflowData(replyId, companyId, {
            replySentiment,
            handledBy: 'AI',
            metadata: {
                ...metadata,
                workflowCompletedAt: new Date().toISOString(),
            },
        });
        await this.leadEvents.logExecution(updatedReply, 'REPLY_CLASSIFIED', {
            classification: replySentiment,
            meetingLink: meetingLink || null,
        });
        if (replySentiment === prisma_1.$Enums.ReplyClassification.INTERESTED && meetingLink) {
            await this.createBookingFromReply(updatedReply, meetingLink, metadata);
        }
        this.logger.log(`Workflow completion handled for reply ${replyId}`);
    }
    async triggerReplyClassification(reply) {
        this.logger.log(`Triggering reply classification for reply ${reply.id}`);
        try {
            this.logger.log(`Would trigger reply classification workflow for reply ${reply.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger reply classification for reply ${reply.id}:`, error);
        }
    }
    async createBookingFromReply(reply, meetingLink, metadata) {
        this.logger.log(`Creating booking from positive reply ${reply.id}`);
        try {
            this.logger.log(`Would create booking for reply ${reply.id} with meeting link: ${meetingLink}`);
        }
        catch (error) {
            this.logger.error(`Failed to create booking from reply ${reply.id}:`, error);
        }
    }
    async classifyReply(id, companyId, classification, handledBy) {
        this.logger.log(`Manually classifying reply ${id} as ${classification} by ${handledBy}`);
        const updatedReply = await this.replyRepository.update(id, companyId, {
            classification,
            handledBy,
        });
        await this.leadEvents.logExecution(updatedReply, 'REPLY_MANUALLY_CLASSIFIED', {
            classification,
            handledBy,
        });
        this.logger.log(`Reply ${id} classified successfully`);
        const responseDto = reply_mapper_1.ReplyMapper.toDto(updatedReply);
        if (!responseDto) {
            throw new Error('Failed to create reply DTO');
        }
        return responseDto;
    }
    async getReplyPriority(replyId, companyId) {
        const reply = await this.replyRepository.findOne(replyId, companyId);
        if (!reply) {
            throw new common_1.NotFoundException('Reply not found');
        }
        return reply.priority;
    }
    async markAsHandled(id, companyId, handledBy) {
        const updatedReply = await this.replyRepository.update(id, companyId, {
            handledBy,
        });
        await this.leadEvents.logExecution(updatedReply, 'REPLY_MARKED_AS_HANDLED', {
            handledBy,
        });
        const responseDto = reply_mapper_1.ReplyMapper.toDto(updatedReply);
        if (!responseDto) {
            throw new Error('Failed to create reply DTO');
        }
        return responseDto;
    }
};
exports.ReplyService = ReplyService;
exports.ReplyService = ReplyService = ReplyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reply_repository_1.ReplyRepository,
        lead_events_service_1.LeadEventsService])
], ReplyService);
//# sourceMappingURL=reply.service.js.map