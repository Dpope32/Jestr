// src/utils/typeGuards.ts

import { MessageContent, MemeShareContent } from '../types/types';

/**
 * Type guard to check if the content is a MemeShareContent
 * @param content - The content to check
 * @returns True if content is MemeShareContent, else false
 */
export function isMemeShareContent(content: MessageContent): content is MemeShareContent {
  return typeof content !== 'string' && content.type === 'meme_share';
}
