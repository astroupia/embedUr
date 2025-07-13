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
exports.AIPersonaService = void 0;
const common_1 = require("@nestjs/common");
const ai_persona_repository_1 = require("./ai-persona.repository");
const ai_persona_mapper_1 = require("./ai-persona.mapper");
let AIPersonaService = class AIPersonaService {
    repo;
    PROMPT_MAX_LENGTH = 10000;
    NAME_MAX_LENGTH = 100;
    DESCRIPTION_MAX_LENGTH = 500;
    FORBIDDEN_KEYWORDS = [
        'hack', 'exploit', 'vulnerability', 'breach', 'steal', 'phishing',
        'malware', 'virus', 'trojan', 'ransomware', 'ddos', 'sql injection',
        'xss', 'csrf', 'privilege escalation', 'backdoor', 'rootkit',
        'social engineering', 'password cracking', 'brute force'
    ];
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(companyId) {
        const personas = await this.repo.findAll(companyId);
        return personas.map(ai_persona_mapper_1.AIPersonaMapper.toResponseDto);
    }
    async findById(id, companyId) {
        const persona = await this.repo.findById(id, companyId);
        if (!persona)
            throw new common_1.NotFoundException('Persona not found');
        if (persona.companyId !== companyId)
            throw new common_1.ForbiddenException('Access denied');
        return ai_persona_mapper_1.AIPersonaMapper.toResponseDto(persona);
    }
    async create(dto, companyId) {
        if (dto.parameters !== undefined) {
            if (dto.parameters === null) {
                throw new common_1.BadRequestException('Parameters must be a valid object');
            }
            await this.validateParameters(dto.parameters);
        }
        await this.validatePrompt(dto.prompt);
        await this.validateName(dto.name);
        if (dto.description) {
            await this.validateDescription(dto.description);
        }
        const persona = await this.repo.create(dto, companyId);
        return ai_persona_mapper_1.AIPersonaMapper.toResponseDto(persona);
    }
    async update(id, dto, companyId) {
        const persona = await this.repo.findById(id, companyId);
        if (!persona)
            throw new common_1.NotFoundException('Persona not found');
        if (persona.companyId !== companyId)
            throw new common_1.ForbiddenException('Access denied');
        if (dto.prompt) {
            await this.validatePrompt(dto.prompt);
        }
        if (dto.name) {
            await this.validateName(dto.name);
        }
        if (dto.description) {
            await this.validateDescription(dto.description);
        }
        if (dto.parameters) {
            await this.validateParameters(dto.parameters);
        }
        const updated = await this.repo.update(id, dto, companyId);
        return ai_persona_mapper_1.AIPersonaMapper.toResponseDto(updated);
    }
    async delete(id, companyId) {
        const persona = await this.repo.findById(id, companyId);
        if (!persona)
            throw new common_1.NotFoundException('Persona not found');
        if (persona.companyId !== companyId)
            throw new common_1.ForbiddenException('Access denied');
        await this.repo.delete(id, companyId);
    }
    async validatePrompt(prompt) {
        if (!prompt || prompt.trim().length === 0) {
            throw new common_1.BadRequestException('Prompt cannot be empty');
        }
        if (prompt.length > this.PROMPT_MAX_LENGTH) {
            throw new common_1.BadRequestException(`Prompt exceeds maximum length of ${this.PROMPT_MAX_LENGTH} characters`);
        }
        const lowerPrompt = prompt.toLowerCase();
        const foundKeywords = this.FORBIDDEN_KEYWORDS.filter(keyword => lowerPrompt.includes(keyword.toLowerCase()));
        if (foundKeywords.length > 0) {
            throw new common_1.BadRequestException(`Prompt contains forbidden keywords: ${foundKeywords.join(', ')}`);
        }
        if (this.containsPromptInjection(prompt)) {
            throw new common_1.BadRequestException('Prompt contains potential injection attempts');
        }
        if (!this.hasBalancedBrackets(prompt)) {
            throw new common_1.BadRequestException('Prompt contains unbalanced brackets or quotes');
        }
        if (this.hasExcessiveRepetition(prompt)) {
            throw new common_1.BadRequestException('Prompt contains excessive repetition');
        }
    }
    async validateName(name) {
        if (!name || name.trim().length === 0) {
            throw new common_1.BadRequestException('Name cannot be empty');
        }
        if (name.length > this.NAME_MAX_LENGTH) {
            throw new common_1.BadRequestException(`Name exceeds maximum length of ${this.NAME_MAX_LENGTH} characters`);
        }
        const forbiddenChars = /[<>:"/\\|?*]/;
        if (forbiddenChars.test(name)) {
            throw new common_1.BadRequestException('Name contains forbidden characters');
        }
        if (name.trim().length !== name.length) {
            throw new common_1.BadRequestException('Name cannot start or end with whitespace');
        }
    }
    async validateDescription(description) {
        if (description.length > this.DESCRIPTION_MAX_LENGTH) {
            throw new common_1.BadRequestException(`Description exceeds maximum length of ${this.DESCRIPTION_MAX_LENGTH} characters`);
        }
        if (description.trim().length !== description.length) {
            throw new common_1.BadRequestException('Description cannot start or end with whitespace');
        }
    }
    async validateParameters(parameters) {
        if (typeof parameters !== 'object' || parameters === null) {
            throw new common_1.BadRequestException('Parameters must be a valid object');
        }
        const paramCount = Object.keys(parameters).length;
        if (paramCount > 50) {
            throw new common_1.BadRequestException('Too many parameters (maximum 50)');
        }
        for (const key of Object.getOwnPropertyNames(parameters)) {
            await this.validateParameter(key, parameters[key]);
        }
    }
    async validateParameter(key, value) {
        if (typeof key !== 'string' || key.length === 0) {
            throw new common_1.BadRequestException('Parameter key must be a non-empty string');
        }
        if (key.length > 50) {
            throw new common_1.BadRequestException('Parameter key too long (maximum 50 characters)');
        }
        const forbiddenKeyChars = /[<>:"/\\|?*]/;
        if (forbiddenKeyChars.test(key)) {
            throw new common_1.BadRequestException(`Parameter key contains forbidden characters: ${key}`);
        }
        if (value === null || value === undefined) {
            throw new common_1.BadRequestException(`Parameter value cannot be null or undefined: ${key}`);
        }
        if (typeof value === 'string') {
            if (value.length > 1000) {
                throw new common_1.BadRequestException(`Parameter value too long: ${key}`);
            }
        }
        else if (typeof value === 'number') {
            if (!isFinite(value)) {
                throw new common_1.BadRequestException(`Parameter value must be a finite number: ${key}`);
            }
        }
        else if (typeof value === 'boolean') {
        }
        else if (Array.isArray(value)) {
            if (value.length > 100) {
                throw new common_1.BadRequestException(`Parameter array too large: ${key}`);
            }
            for (const item of value) {
                if (typeof item === 'string' && item.length > 100) {
                    throw new common_1.BadRequestException(`Array item too long in parameter: ${key}`);
                }
            }
        }
        else if (typeof value === 'object') {
            if (Object.keys(value).length > 20) {
                throw new common_1.BadRequestException(`Parameter object too large: ${key}`);
            }
        }
        else {
            throw new common_1.BadRequestException(`Unsupported parameter type: ${key}`);
        }
    }
    containsPromptInjection(prompt) {
        const injectionPatterns = [
            /ignore previous instructions/i,
            /forget everything/i,
            /ignore all previous/i,
            /disregard previous/i,
            /ignore the above/i,
            /ignore what was said/i,
            /ignore all rules/i,
            /break character/i,
            /stop being/i,
            /act as if/i,
            /pretend to be/i,
            /roleplay as/i,
            /system prompt/i,
            /override/i,
            /bypass/i,
            /hack/i,
            /exploit/i,
            /forget the above/i,
            /ignore the above/i,
            /disregard the above/i,
            /disregard all previous prompts/i,
            /ignore previous instructions and/i,
            /disregard all previous prompts and/i,
            /forget everything and/i,
            /ignore the above and/i,
            /disregard the above and/i,
            /forget the above and/i,
        ];
        return injectionPatterns.some(pattern => pattern.test(prompt));
    }
    hasBalancedBrackets(text) {
        const brackets = {
            '(': ')',
            '[': ']',
            '{': '}',
            '<': '>',
        };
        const quotes = ['"', "'", '`'];
        const stack = [];
        for (const char of text) {
            if (brackets[char]) {
                stack.push(char);
            }
            else if (Object.values(brackets).includes(char)) {
                const lastOpen = stack.pop();
                if (!lastOpen || brackets[lastOpen] !== char) {
                    return false;
                }
            }
            else if (quotes.includes(char)) {
                if (stack.length > 0 && stack[stack.length - 1] === char) {
                    stack.pop();
                }
                else {
                    stack.push(char);
                }
            }
        }
        return stack.length === 0;
    }
    hasExcessiveRepetition(text) {
        const words = text.toLowerCase().split(/\s+/);
        const wordCount = {};
        for (const word of words) {
            if (word.length >= 2) {
                wordCount[word] = (wordCount[word] || 0) + 1;
                if (wordCount[word] > 8) {
                    return true;
                }
            }
        }
        const phrases = text.toLowerCase().match(/\b\w+(?:\s+\w+)*\b/g) || [];
        const phraseCount = {};
        for (const phrase of phrases) {
            if (phrase.length >= 3) {
                phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
                if (phraseCount[phrase] > 5) {
                    return true;
                }
            }
        }
        return false;
    }
    async testPromptSafety(prompt) {
        const issues = [];
        let confidence = 1.0;
        if (this.containsPromptInjection(prompt)) {
            issues.push('Potential prompt injection detected');
            confidence *= 0.5;
        }
        if (this.FORBIDDEN_KEYWORDS.some(keyword => prompt.toLowerCase().includes(keyword.toLowerCase()))) {
            issues.push('Contains forbidden keywords');
            confidence *= 0.7;
        }
        return {
            isSafe: issues.length === 0,
            confidence,
            issues,
        };
    }
    async getPromptStats(companyId) {
        const personas = await this.repo.findAll(companyId);
        if (personas.length === 0) {
            return {
                totalPersonas: 0,
                averagePromptLength: 0,
                longestPrompt: 0,
                shortestPrompt: 0,
            };
        }
        const promptLengths = personas.map(p => p.prompt.length);
        const totalLength = promptLengths.reduce((sum, length) => sum + length, 0);
        return {
            totalPersonas: personas.length,
            averagePromptLength: Math.round(totalLength / personas.length),
            longestPrompt: Math.max(...promptLengths),
            shortestPrompt: Math.min(...promptLengths),
        };
    }
};
exports.AIPersonaService = AIPersonaService;
exports.AIPersonaService = AIPersonaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_persona_repository_1.AIPersonaRepository])
], AIPersonaService);
//# sourceMappingURL=ai-persona.service.js.map