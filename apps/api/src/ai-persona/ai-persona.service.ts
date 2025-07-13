import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AIPersonaRepository } from './ai-persona.repository';
import { CreateAIPersonaDto } from './dto/create-ai-persona.dto';
import { UpdateAIPersonaDto } from './dto/update-ai-persona.dto';
import { AIPersonaMapper } from './ai-persona.mapper';
import { AIPersonaResponseDto } from './dto/ai-persona-response.dto';

@Injectable()
export class AIPersonaService {
  private readonly PROMPT_MAX_LENGTH = 10000; // 10KB limit
  private readonly NAME_MAX_LENGTH = 100;
  private readonly DESCRIPTION_MAX_LENGTH = 500;
  private readonly FORBIDDEN_KEYWORDS = [
    'hack', 'exploit', 'vulnerability', 'breach', 'steal', 'phishing',
    'malware', 'virus', 'trojan', 'ransomware', 'ddos', 'sql injection',
    'xss', 'csrf', 'privilege escalation', 'backdoor', 'rootkit',
    'social engineering', 'password cracking', 'brute force'
  ];

  constructor(private readonly repo: AIPersonaRepository) {}

  async findAll(companyId: string): Promise<AIPersonaResponseDto[]> {
    const personas = await this.repo.findAll(companyId);
    return personas.map(AIPersonaMapper.toResponseDto);
  }

  async findById(id: string, companyId: string): Promise<AIPersonaResponseDto> {
    const persona = await this.repo.findById(id, companyId);
    if (!persona) throw new NotFoundException('Persona not found');
    if (persona.companyId !== companyId) throw new ForbiddenException('Access denied');
    return AIPersonaMapper.toResponseDto(persona);
  }

  async create(dto: CreateAIPersonaDto, companyId: string): Promise<AIPersonaResponseDto> {
    // Validate parameters if provided
    if (dto.parameters !== undefined) {
      if (dto.parameters === null) {
        throw new BadRequestException('Parameters must be a valid object');
      }
      await this.validateParameters(dto.parameters);
    }

    // Validate prompt
    await this.validatePrompt(dto.prompt);

    // Validate name
    await this.validateName(dto.name);

    // Validate description if provided
    if (dto.description) {
      await this.validateDescription(dto.description);
    }

    const persona = await this.repo.create(dto, companyId);
    return AIPersonaMapper.toResponseDto(persona);
  }

  async update(id: string, dto: UpdateAIPersonaDto, companyId: string): Promise<AIPersonaResponseDto> {
    const persona = await this.repo.findById(id, companyId);
    if (!persona) throw new NotFoundException('Persona not found');
    if (persona.companyId !== companyId) throw new ForbiddenException('Access denied');
    
    // Add prompt validation logic here
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
    return AIPersonaMapper.toResponseDto(updated);
  }

  async delete(id: string, companyId: string): Promise<void> {
    const persona = await this.repo.findById(id, companyId);
    if (!persona) throw new NotFoundException('Persona not found');
    if (persona.companyId !== companyId) throw new ForbiddenException('Access denied');
    await this.repo.delete(id, companyId);
  }

  /**
   * Validate AI persona prompt for safety and quality
   */
  private async validatePrompt(prompt: string): Promise<void> {
    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException('Prompt cannot be empty');
    }

    if (prompt.length > this.PROMPT_MAX_LENGTH) {
      throw new BadRequestException(`Prompt exceeds maximum length of ${this.PROMPT_MAX_LENGTH} characters`);
    }

    // Check for forbidden keywords
    const lowerPrompt = prompt.toLowerCase();
    const foundKeywords = this.FORBIDDEN_KEYWORDS.filter(keyword => 
      lowerPrompt.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      throw new BadRequestException(
        `Prompt contains forbidden keywords: ${foundKeywords.join(', ')}`
      );
    }

    // Check for potential prompt injection attempts
    if (this.containsPromptInjection(prompt)) {
      throw new BadRequestException('Prompt contains potential injection attempts');
    }

    // Check for balanced brackets and quotes
    if (!this.hasBalancedBrackets(prompt)) {
      throw new BadRequestException('Prompt contains unbalanced brackets or quotes');
    }

    // Check for excessive repetition
    if (this.hasExcessiveRepetition(prompt)) {
      throw new BadRequestException('Prompt contains excessive repetition');
    }
  }

  /**
   * Validate AI persona name
   */
  private async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }

    if (name.length > this.NAME_MAX_LENGTH) {
      throw new BadRequestException(`Name exceeds maximum length of ${this.NAME_MAX_LENGTH} characters`);
    }

    // Check for forbidden characters
    const forbiddenChars = /[<>:"/\\|?*]/;
    if (forbiddenChars.test(name)) {
      throw new BadRequestException('Name contains forbidden characters');
    }

    // Check for excessive whitespace
    if (name.trim().length !== name.length) {
      throw new BadRequestException('Name cannot start or end with whitespace');
    }
  }

  /**
   * Validate AI persona description
   */
  private async validateDescription(description: string): Promise<void> {
    if (description.length > this.DESCRIPTION_MAX_LENGTH) {
      throw new BadRequestException(`Description exceeds maximum length of ${this.DESCRIPTION_MAX_LENGTH} characters`);
    }

    // Check for excessive whitespace
    if (description.trim().length !== description.length) {
      throw new BadRequestException('Description cannot start or end with whitespace');
    }
  }

  /**
   * Validate AI persona parameters
   */
  private async validateParameters(parameters: Record<string, any>): Promise<void> {
    if (typeof parameters !== 'object' || parameters === null) {
      throw new BadRequestException('Parameters must be a valid object');
    }

    // Check parameter count
    const paramCount = Object.keys(parameters).length;
    if (paramCount > 50) {
      throw new BadRequestException('Too many parameters (maximum 50)');
    }

    // Validate each parameter (including undefined values)
    for (const key of Object.getOwnPropertyNames(parameters)) {
      await this.validateParameter(key, parameters[key]);
    }
  }

  /**
   * Validate individual parameter
   */
  private async validateParameter(key: string, value: any): Promise<void> {
    // Validate key
    if (typeof key !== 'string' || key.length === 0) {
      throw new BadRequestException('Parameter key must be a non-empty string');
    }

    if (key.length > 50) {
      throw new BadRequestException('Parameter key too long (maximum 50 characters)');
    }

    // Check for forbidden characters in key
    const forbiddenKeyChars = /[<>:"/\\|?*]/;
    if (forbiddenKeyChars.test(key)) {
      throw new BadRequestException(`Parameter key contains forbidden characters: ${key}`);
    }

    // Validate value
    if (value === null || value === undefined) {
      throw new BadRequestException(`Parameter value cannot be null or undefined: ${key}`);
    }

    // Check value type and size
    if (typeof value === 'string') {
      if (value.length > 1000) {
        throw new BadRequestException(`Parameter value too long: ${key}`);
      }
    } else if (typeof value === 'number') {
      if (!isFinite(value)) {
        throw new BadRequestException(`Parameter value must be a finite number: ${key}`);
      }
    } else if (typeof value === 'boolean') {
      // Boolean values are fine
    } else if (Array.isArray(value)) {
      if (value.length > 100) {
        throw new BadRequestException(`Parameter array too large: ${key}`);
      }
      // Validate array elements
      for (const item of value) {
        if (typeof item === 'string' && item.length > 100) {
          throw new BadRequestException(`Array item too long in parameter: ${key}`);
        }
      }
    } else if (typeof value === 'object') {
      if (Object.keys(value).length > 20) {
        throw new BadRequestException(`Parameter object too large: ${key}`);
      }
    } else {
      throw new BadRequestException(`Unsupported parameter type: ${key}`);
    }
  }

  /**
   * Check for prompt injection attempts
   */
  private containsPromptInjection(prompt: string): boolean {
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

  /**
   * Check for balanced brackets and quotes
   */
  private hasBalancedBrackets(text: string): boolean {
    const brackets = {
      '(': ')',
      '[': ']',
      '{': '}',
      '<': '>',
    };

    const quotes = ['"', "'", '`'];
    const stack: string[] = [];

    for (const char of text) {
      // Handle opening brackets
      if (brackets[char]) {
        stack.push(char);
      }
      // Handle closing brackets
      else if (Object.values(brackets).includes(char)) {
        const lastOpen = stack.pop();
        if (!lastOpen || brackets[lastOpen] !== char) {
          return false;
        }
      }
      // Handle quotes
      else if (quotes.includes(char)) {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop(); // Close quote
        } else {
          stack.push(char); // Open quote
        }
      }
    }

    return stack.length === 0;
  }

  /**
   * Check for excessive repetition
   */
  private hasExcessiveRepetition(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    const wordCount: Record<string, number> = {};

    for (const word of words) {
      if (word.length >= 2) { // Check words 2 characters or longer
        wordCount[word] = (wordCount[word] || 0) + 1;
        if (wordCount[word] > 8) { // More than 8 repetitions
          return true;
        }
      }
    }

    // Also check for phrase repetition
    const phrases = text.toLowerCase().match(/\b\w+(?:\s+\w+)*\b/g) || [];
    const phraseCount: Record<string, number> = {};

    for (const phrase of phrases) {
      if (phrase.length >= 3) { // Check phrases 3 characters or longer
        phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
        if (phraseCount[phrase] > 5) { // More than 5 repetitions of the same phrase
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Test prompt with AI model for safety (placeholder for future implementation)
   */
  async testPromptSafety(prompt: string): Promise<{
    isSafe: boolean;
    confidence: number;
    issues: string[];
  }> {
    // TODO: Implement actual AI safety testing
    // This could integrate with OpenAI's moderation API or similar services
    
    const issues: string[] = [];
    let confidence = 1.0;

    // Basic checks
    if (this.containsPromptInjection(prompt)) {
      issues.push('Potential prompt injection detected');
      confidence *= 0.5;
    }

    if (this.FORBIDDEN_KEYWORDS.some(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    )) {
      issues.push('Contains forbidden keywords');
      confidence *= 0.7;
    }

    return {
      isSafe: issues.length === 0,
      confidence,
      issues,
    };
  }

  /**
   * Get prompt statistics
   */
  async getPromptStats(companyId: string): Promise<{
    totalPersonas: number;
    averagePromptLength: number;
    longestPrompt: number;
    shortestPrompt: number;
  }> {
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
} 