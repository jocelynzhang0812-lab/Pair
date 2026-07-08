import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export type LlmModelTier = 'mini' | 'dialogue';

export interface LlmChatOptions {
  system: string;
  user: string;
  /** `mini` maps to OPENAI_MODEL_MINI, `dialogue` maps to OPENAI_MODEL_DIALOGUE. */
  model?: LlmModelTier;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmJsonOptions<T> extends LlmChatOptions {
  /**
   * Validate/normalize the parsed JSON. Return the typed value when valid,
   * or `null` to reject the output and trigger a retry (then mock fallback).
   */
  validate: (raw: unknown) => T | null;
}

/**
 * Thin wrapper around the OpenAI Chat Completions API.
 *
 * Feature-flagged by OPENAI_API_KEY: when the key is absent the service is
 * "disabled" and every call resolves to `null`, letting callers fall back to
 * their deterministic mock implementation. This keeps local dev and
 * `verify:flow` fully offline while preserving the real LLM contract.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly client: OpenAI | null;
  private readonly modelMini: string;
  private readonly modelDialogue: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim();
    const baseURL = this.config.get<string>('OPENAI_BASE_URL')?.trim() || undefined;
    this.modelMini = this.config.get<string>('OPENAI_MODEL_MINI')?.trim() || 'gpt-4o-mini';
    this.modelDialogue = this.config.get<string>('OPENAI_MODEL_DIALOGUE')?.trim() || 'gpt-4o';
    this.client = apiKey ? new OpenAI({ apiKey, baseURL }) : null;

    if (!this.client) {
      this.logger.warn(
        'OPENAI_API_KEY not set; LlmService runs in offline mock-fallback mode.',
      );
    }
  }

  /** Whether a real OpenAI client is configured. */
  get enabled(): boolean {
    return this.client !== null;
  }

  private resolveModel(tier: LlmModelTier = 'mini'): string {
    return tier === 'dialogue' ? this.modelDialogue : this.modelMini;
  }

  /**
   * Free-form text completion. Resolves to `null` when disabled or on failure
   * so callers can fall back to a mock string.
   */
  async chatText(options: LlmChatOptions): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.resolveModel(options.model),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 500,
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
      });

      return completion.choices[0]?.message?.content?.trim() ?? null;
    } catch (error) {
      this.logger.error(`LLM chatText failed: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * JSON completion with one retry and schema validation. Resolves to the
   * validated value, or `null` when disabled / repeatedly invalid so callers
   * can fall back to a deterministic mock.
   */
  async chatJson<T>(options: LlmJsonOptions<T>): Promise<T | null> {
    if (!this.client) {
      return null;
    }

    const model = this.resolveModel(options.model);

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const completion = await this.client.chat.completions.create({
          model,
          temperature: options.temperature ?? 0.6,
          max_tokens: options.maxTokens ?? 800,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: options.system },
            { role: 'user', content: options.user },
          ],
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          this.logger.warn(`LLM chatJson returned empty content (attempt ${attempt}).`);
          continue;
        }

        const parsed: unknown = JSON.parse(content);
        const validated = options.validate(parsed);
        if (validated !== null) {
          return validated;
        }

        this.logger.warn(`LLM chatJson validation failed (attempt ${attempt}).`);
      } catch (error) {
        this.logger.warn(
          `LLM chatJson attempt ${attempt} failed: ${(error as Error).message}`,
        );
      }
    }

    return null;
  }
}
