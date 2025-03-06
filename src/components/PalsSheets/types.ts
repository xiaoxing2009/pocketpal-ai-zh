import {z} from 'zod';
import {Model} from '../../utils/types';

export enum PalType {
  ROLEPLAY = 'roleplay',
  ASSISTANT = 'assistant',
}

// Base schema with common fields
const baseFormSchema = {
  name: z.string().min(1, 'Name is required'),
  defaultModel: z.any().optional(),
  useAIPrompt: z.boolean(),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  originalSystemPrompt: z.string().optional(),
  isSystemPromptChanged: z.boolean().default(false),
  color: z.tuple([z.string(), z.string()]).optional(),
  promptGenerationModel: z.any().optional(),
  generatingPrompt: z.string().optional(),
};

// Base type for common fields
interface BaseFormData {
  id?: string;
  name: string;
  defaultModel?: Model;
  useAIPrompt: boolean;
  systemPrompt: string;
  originalSystemPrompt?: string;
  isSystemPromptChanged: boolean;
  color?: [string, string];
  promptGenerationModel?: Model;
  generatingPrompt?: string;
}

// Assistant-specific schema and type
export const assistantFormSchema = z.object({
  ...baseFormSchema,
  palType: z.literal(PalType.ASSISTANT),
});

export interface AssistantFormData extends BaseFormData {
  palType: PalType.ASSISTANT;
}

// Roleplay-specific schema and type
export const roleplayFormSchema = z.object({
  ...baseFormSchema,
  palType: z.literal(PalType.ROLEPLAY),
  world: z.string().min(1, 'World is required'),
  location: z.string().min(1, 'Location is required'),
  aiRole: z.string().min(1, "AI's role is required"),
  userRole: z.string().min(1, 'User role is required'),
  situation: z.string().min(1, 'Situation is required'),
  toneStyle: z.string().min(1, 'Tone/Style is required'),
});

export interface RoleplayFormData extends BaseFormData {
  palType: PalType.ROLEPLAY;
  world: string;
  location: string;
  aiRole: string;
  userRole: string;
  situation: string;
  toneStyle: string;
}

// Union type for form data
export type PalFormData = AssistantFormData | RoleplayFormData;
