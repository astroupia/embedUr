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
var TargetAudienceTranslatorAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetAudienceTranslatorAiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const target_audience_translator_dto_1 = require("../dto/target-audience-translator.dto");
let TargetAudienceTranslatorAiService = TargetAudienceTranslatorAiService_1 = class TargetAudienceTranslatorAiService {
    httpService;
    logger = new common_1.Logger(TargetAudienceTranslatorAiService_1.name);
    constructor(httpService) {
        this.httpService = httpService;
    }
    async processTargetAudience(inputFormat, targetAudienceData, structuredData, config) {
        this.logger.log(`Processing target audience with format ${inputFormat}`);
        try {
            let interpretedCriteria;
            let reasoning;
            switch (inputFormat) {
                case target_audience_translator_dto_1.InputFormat.FREE_TEXT:
                    const freeTextResult = await this.interpretFreeText(targetAudienceData);
                    interpretedCriteria = freeTextResult.criteria;
                    reasoning = freeTextResult.reasoning;
                    break;
                case target_audience_translator_dto_1.InputFormat.STRUCTURED_JSON:
                    const jsonResult = await this.interpretStructuredJson(targetAudienceData, structuredData);
                    interpretedCriteria = jsonResult.criteria;
                    reasoning = jsonResult.reasoning;
                    break;
                case target_audience_translator_dto_1.InputFormat.CSV_UPLOAD:
                    const csvResult = await this.interpretCsvData(targetAudienceData);
                    interpretedCriteria = csvResult.criteria;
                    reasoning = csvResult.reasoning;
                    break;
                case target_audience_translator_dto_1.InputFormat.FORM_INPUT:
                    const formResult = await this.interpretFormInput(targetAudienceData);
                    interpretedCriteria = formResult.criteria;
                    reasoning = formResult.reasoning;
                    break;
                default:
                    throw new Error(`Unsupported input format: ${inputFormat}`);
            }
            const enrichmentSchema = this.generateEnrichmentSchema(interpretedCriteria);
            const leads = await this.generateSampleLeads(interpretedCriteria, config);
            const confidence = this.calculateConfidence(interpretedCriteria, enrichmentSchema, leads);
            return {
                leads,
                enrichmentSchema,
                interpretedCriteria,
                reasoning,
                confidence,
            };
        }
        catch (error) {
            this.logger.error('Error processing target audience:', error);
            throw error;
        }
    }
    async interpretFreeText(text) {
        this.logger.log('Interpreting free text input');
        const prompt = `
    Analyze the following target audience description and extract structured criteria:
    
    "${text}"
    
    Please return a JSON object with the following structure:
    {
      "jobTitles": ["array of job titles"],
      "industries": ["array of industries"],
      "location": "geographic location",
      "companySize": "company size range",
      "fundingStatus": "funding status if mentioned",
      "additionalCriteria": {"any other relevant criteria"}
    }
    
    Also provide a brief reasoning for your interpretation.
    `;
        const mockResponse = await this.callAiService(prompt);
        return {
            criteria: mockResponse.criteria,
            reasoning: mockResponse.reasoning,
        };
    }
    async interpretStructuredJson(jsonData, structuredData) {
        this.logger.log('Interpreting structured JSON input');
        let parsedData;
        try {
            parsedData = JSON.parse(jsonData);
        }
        catch (error) {
            throw new Error('Invalid JSON format');
        }
        const mergedData = {
            ...parsedData,
            ...structuredData,
        };
        const criteria = {
            jobTitles: mergedData.jobTitles || [],
            industries: mergedData.industries || [],
            location: mergedData.location,
            companySize: mergedData.companySize,
            fundingStatus: mergedData.fundingStatus,
            additionalCriteria: mergedData.additionalCriteria || {},
        };
        return {
            criteria,
            reasoning: 'Structured data interpreted directly from JSON input',
        };
    }
    async interpretCsvData(csvData) {
        this.logger.log('Interpreting CSV data');
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('Empty CSV data');
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });
        const jobTitles = [...new Set(data.map(row => row.jobTitle || row.title || row.role).filter(Boolean))];
        const industries = [...new Set(data.map(row => row.industry || row.sector).filter(Boolean))];
        const locations = [...new Set(data.map(row => row.location || row.city || row.country).filter(Boolean))];
        const criteria = {
            jobTitles,
            industries,
            location: locations.length > 0 ? locations.join(', ') : undefined,
            additionalCriteria: {
                csvRowCount: data.length,
                availableFields: headers,
            },
        };
        return {
            criteria,
            reasoning: `CSV data interpreted with ${data.length} rows and ${headers.length} columns`,
        };
    }
    async interpretFormInput(formData) {
        this.logger.log('Interpreting form input');
        let parsedData;
        try {
            parsedData = JSON.parse(formData);
        }
        catch (error) {
            throw new Error('Invalid form data format');
        }
        const criteria = {
            jobTitles: parsedData.jobTitles || [],
            industries: parsedData.industries || [],
            location: parsedData.location,
            companySize: parsedData.companySize,
            fundingStatus: parsedData.fundingStatus,
            additionalCriteria: parsedData.additionalCriteria || {},
        };
        return {
            criteria,
            reasoning: 'Form data interpreted from structured input fields',
        };
    }
    generateEnrichmentSchema(criteria) {
        this.logger.log('Generating enrichment schema');
        const requiredFields = [
            {
                name: 'fullName',
                type: target_audience_translator_dto_1.EnrichmentFieldType.REQUIRED,
                description: 'Full name of the person',
                example: 'John Doe',
            },
            {
                name: 'email',
                type: target_audience_translator_dto_1.EnrichmentFieldType.REQUIRED,
                description: 'Email address',
                example: 'john.doe@company.com',
            },
        ];
        const optionalFields = [
            {
                name: 'linkedinUrl',
                type: target_audience_translator_dto_1.EnrichmentFieldType.OPTIONAL,
                description: 'LinkedIn profile URL',
                example: 'https://linkedin.com/in/johndoe',
            },
            {
                name: 'jobTitle',
                type: target_audience_translator_dto_1.EnrichmentFieldType.OPTIONAL,
                description: 'Job title or position',
                example: 'CTO',
            },
            {
                name: 'companyName',
                type: target_audience_translator_dto_1.EnrichmentFieldType.OPTIONAL,
                description: 'Company name',
                example: 'TechCorp Inc',
            },
            {
                name: 'location',
                type: target_audience_translator_dto_1.EnrichmentFieldType.OPTIONAL,
                description: 'Geographic location',
                example: 'San Francisco, CA',
            },
        ];
        const conditionalFields = [];
        if (criteria.jobTitles && criteria.jobTitles.length > 0) {
            conditionalFields.push({
                name: 'jobTitle',
                type: target_audience_translator_dto_1.EnrichmentFieldType.CONDITIONAL,
                description: 'Job title (required for this targeting criteria)',
                example: criteria.jobTitles[0],
            });
        }
        if (criteria.industries && criteria.industries.length > 0) {
            conditionalFields.push({
                name: 'companyIndustry',
                type: target_audience_translator_dto_1.EnrichmentFieldType.CONDITIONAL,
                description: 'Company industry (required for this targeting criteria)',
                example: criteria.industries[0],
            });
        }
        if (criteria.location) {
            conditionalFields.push({
                name: 'location',
                type: target_audience_translator_dto_1.EnrichmentFieldType.CONDITIONAL,
                description: 'Location (required for this targeting criteria)',
                example: criteria.location,
            });
        }
        return {
            requiredFields,
            optionalFields,
            conditionalFields,
        };
    }
    async generateSampleLeads(criteria, config) {
        this.logger.log('Generating sample leads');
        const maxLeads = config?.maxSampleLeads || 5;
        const leads = [];
        for (let i = 0; i < maxLeads; i++) {
            const jobTitle = criteria.jobTitles?.[i % (criteria.jobTitles?.length || 1)] || 'Professional';
            const industry = criteria.industries?.[i % (criteria.industries?.length || 1)] || 'Technology';
            const location = criteria.location || 'United States';
            const lead = {
                fullName: `Sample Lead ${i + 1}`,
                jobTitle,
                companyName: `Sample ${industry} Company ${i + 1}`,
                location,
                additionalData: {
                    industry,
                    companySize: criteria.companySize,
                    fundingStatus: criteria.fundingStatus,
                },
            };
            leads.push(lead);
        }
        return leads;
    }
    calculateConfidence(criteria, schema, leads) {
        let score = 0.5;
        if (criteria.jobTitles && criteria.jobTitles.length > 0)
            score += 0.1;
        if (criteria.industries && criteria.industries.length > 0)
            score += 0.1;
        if (criteria.location)
            score += 0.1;
        if (criteria.companySize)
            score += 0.05;
        if (criteria.fundingStatus)
            score += 0.05;
        const totalFields = schema.requiredFields.length + schema.optionalFields.length + (schema.conditionalFields?.length || 0);
        score += Math.min(totalFields * 0.02, 0.1);
        score += Math.min(leads.length * 0.02, 0.1);
        return Math.min(score, 1.0);
    }
    async callAiService(prompt) {
        const mockResponse = {
            criteria: {
                jobTitles: ['CTO', 'VP Engineering', 'Head of Technology'],
                industries: ['B2B SaaS', 'Technology'],
                location: 'Europe',
                companySize: '50-200 employees',
                fundingStatus: 'VC-backed',
                additionalCriteria: {},
            },
            reasoning: 'Based on the description, I identified key targeting criteria including senior technical roles, B2B SaaS industry focus, European market, and specific company characteristics.',
        };
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockResponse;
    }
};
exports.TargetAudienceTranslatorAiService = TargetAudienceTranslatorAiService;
exports.TargetAudienceTranslatorAiService = TargetAudienceTranslatorAiService = TargetAudienceTranslatorAiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], TargetAudienceTranslatorAiService);
//# sourceMappingURL=target-audience-translator-ai.service.js.map