import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InputFormat, StructuredTargetingData, EnrichmentField, EnrichmentSchema, GeneratedLead, EnrichmentFieldType, InterpretedCriteria } from '../dto/target-audience-translator.dto';

@Injectable()
export class TargetAudienceTranslatorAiService {
  private readonly logger = new Logger(TargetAudienceTranslatorAiService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Process target audience data and generate structured output
   */
  async processTargetAudience(
    inputFormat: InputFormat,
    targetAudienceData: string,
    structuredData?: StructuredTargetingData,
    config?: Record<string, any>,
  ): Promise<{
    leads: GeneratedLead[];
    enrichmentSchema: EnrichmentSchema;
    interpretedCriteria: InterpretedCriteria;
    reasoning: string;
    confidence: number;
  }> {
    this.logger.log(`Processing target audience with format ${inputFormat}`);

    try {
      let interpretedCriteria: InterpretedCriteria;
      let reasoning: string;

      // Step 1: Interpret the input based on format
      switch (inputFormat) {
        case InputFormat.FREE_TEXT:
          const freeTextResult = await this.interpretFreeText(targetAudienceData);
          interpretedCriteria = freeTextResult.criteria;
          reasoning = freeTextResult.reasoning;
          break;

        case InputFormat.STRUCTURED_JSON:
          const jsonResult = await this.interpretStructuredJson(targetAudienceData, structuredData);
          interpretedCriteria = jsonResult.criteria;
          reasoning = jsonResult.reasoning;
          break;

        case InputFormat.CSV_UPLOAD:
          const csvResult = await this.interpretCsvData(targetAudienceData);
          interpretedCriteria = csvResult.criteria;
          reasoning = csvResult.reasoning;
          break;

        case InputFormat.FORM_INPUT:
          const formResult = await this.interpretFormInput(targetAudienceData);
          interpretedCriteria = formResult.criteria;
          reasoning = formResult.reasoning;
          break;

        default:
          throw new Error(`Unsupported input format: ${inputFormat}`);
      }

      // Step 2: Generate enrichment schema based on interpreted criteria
      const enrichmentSchema = this.generateEnrichmentSchema(interpretedCriteria);

      // Step 3: Generate sample leads based on criteria
      const leads = await this.generateSampleLeads(interpretedCriteria, config);

      // Step 4: Calculate confidence score
      const confidence = this.calculateConfidence(interpretedCriteria, enrichmentSchema, leads);

      return {
        leads,
        enrichmentSchema,
        interpretedCriteria,
        reasoning,
        confidence,
      };
    } catch (error) {
      this.logger.error('Error processing target audience:', error);
      throw error;
    }
  }

  /**
   * Interpret free text input using AI
   */
  private async interpretFreeText(text: string): Promise<{
    criteria: InterpretedCriteria;
    reasoning: string;
  }> {
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

    // Mock AI response for now - in production, this would call an AI service
    const mockResponse = await this.callAiService(prompt);
    
    return {
      criteria: mockResponse.criteria,
      reasoning: mockResponse.reasoning,
    };
  }

  /**
   * Interpret structured JSON input
   */
  private async interpretStructuredJson(
    jsonData: string,
    structuredData?: StructuredTargetingData,
  ): Promise<{
    criteria: InterpretedCriteria;
    reasoning: string;
  }> {
    this.logger.log('Interpreting structured JSON input');

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonData);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }

    // Merge with provided structured data
    const mergedData = {
      ...parsedData,
      ...structuredData,
    };

    const criteria: InterpretedCriteria = {
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

  /**
   * Interpret CSV data
   */
  private async interpretCsvData(csvData: string): Promise<{
    criteria: InterpretedCriteria;
    reasoning: string;
  }> {
    this.logger.log('Interpreting CSV data');

    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('Empty CSV data');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    // Extract criteria from CSV data
    const jobTitles = [...new Set(data.map(row => row.jobTitle || row.title || row.role).filter(Boolean))];
    const industries = [...new Set(data.map(row => row.industry || row.sector).filter(Boolean))];
    const locations = [...new Set(data.map(row => row.location || row.city || row.country).filter(Boolean))];

    const criteria: InterpretedCriteria = {
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

  /**
   * Interpret form input
   */
  private async interpretFormInput(formData: string): Promise<{
    criteria: InterpretedCriteria;
    reasoning: string;
  }> {
    this.logger.log('Interpreting form input');

    let parsedData: any;
    try {
      parsedData = JSON.parse(formData);
    } catch (error) {
      throw new Error('Invalid form data format');
    }

    const criteria: InterpretedCriteria = {
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

  /**
   * Generate enrichment schema based on interpreted criteria
   */
  private generateEnrichmentSchema(criteria: InterpretedCriteria): EnrichmentSchema {
    this.logger.log('Generating enrichment schema');

    const requiredFields: EnrichmentField[] = [
      {
        name: 'fullName',
        type: EnrichmentFieldType.REQUIRED,
        description: 'Full name of the person',
        example: 'John Doe',
      },
      {
        name: 'email',
        type: EnrichmentFieldType.REQUIRED,
        description: 'Email address',
        example: 'john.doe@company.com',
      },
    ];

    const optionalFields: EnrichmentField[] = [
      {
        name: 'linkedinUrl',
        type: EnrichmentFieldType.OPTIONAL,
        description: 'LinkedIn profile URL',
        example: 'https://linkedin.com/in/johndoe',
      },
      {
        name: 'jobTitle',
        type: EnrichmentFieldType.OPTIONAL,
        description: 'Job title or position',
        example: 'CTO',
      },
      {
        name: 'companyName',
        type: EnrichmentFieldType.OPTIONAL,
        description: 'Company name',
        example: 'TechCorp Inc',
      },
      {
        name: 'location',
        type: EnrichmentFieldType.OPTIONAL,
        description: 'Geographic location',
        example: 'San Francisco, CA',
      },
    ];

    const conditionalFields: EnrichmentField[] = [];

    // Add conditional fields based on criteria
    if (criteria.jobTitles && criteria.jobTitles.length > 0) {
      conditionalFields.push({
        name: 'jobTitle',
        type: EnrichmentFieldType.CONDITIONAL,
        description: 'Job title (required for this targeting criteria)',
        example: criteria.jobTitles[0],
      });
    }

    if (criteria.industries && criteria.industries.length > 0) {
      conditionalFields.push({
        name: 'companyIndustry',
        type: EnrichmentFieldType.CONDITIONAL,
        description: 'Company industry (required for this targeting criteria)',
        example: criteria.industries[0],
      });
    }

    if (criteria.location) {
      conditionalFields.push({
        name: 'location',
        type: EnrichmentFieldType.CONDITIONAL,
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

  /**
   * Generate sample leads based on criteria
   */
  private async generateSampleLeads(
    criteria: InterpretedCriteria,
    config?: Record<string, any>,
  ): Promise<GeneratedLead[]> {
    this.logger.log('Generating sample leads');

    const maxLeads = config?.maxSampleLeads || 5;
    const leads: GeneratedLead[] = [];

    // Generate sample leads based on criteria
    for (let i = 0; i < maxLeads; i++) {
      const jobTitle = criteria.jobTitles?.[i % (criteria.jobTitles?.length || 1)] || 'Professional';
      const industry = criteria.industries?.[i % (criteria.industries?.length || 1)] || 'Technology';
      const location = criteria.location || 'United States';

      const lead: GeneratedLead = {
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

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    criteria: InterpretedCriteria,
    schema: EnrichmentSchema,
    leads: GeneratedLead[],
  ): number {
    let score = 0.5; // Base score

    // Add points for specific criteria
    if (criteria.jobTitles && criteria.jobTitles.length > 0) score += 0.1;
    if (criteria.industries && criteria.industries.length > 0) score += 0.1;
    if (criteria.location) score += 0.1;
    if (criteria.companySize) score += 0.05;
    if (criteria.fundingStatus) score += 0.05;

    // Add points for schema completeness
    const totalFields = schema.requiredFields.length + schema.optionalFields.length + (schema.conditionalFields?.length || 0);
    score += Math.min(totalFields * 0.02, 0.1);

    // Add points for sample leads
    score += Math.min(leads.length * 0.02, 0.1);

    return Math.min(score, 1.0);
  }

  /**
   * Call AI service (mock implementation)
   */
  private async callAiService(prompt: string): Promise<any> {
    // Mock AI response - in production, this would call OpenAI, Anthropic, etc.
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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockResponse;
  }
} 