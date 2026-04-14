import Dexie, { type Table } from 'dexie';
import type { AudioFile } from '../core/types/race';

/**
 * Dexie database for storing audio files locally
 */
export class AudioDatabase extends Dexie {
  audioFiles!: Table<AudioFile>;

  constructor() {
    super('DuckRacingAudioDB');
    
    this.version(1).stores({
      audioFiles: 'id, type, uploadedAt'
    });
  }

  /**
   * Save audio file to IndexedDB
   */
  async saveAudioFile(
    type: 'countdown' | 'racing' | 'finish',
    blob: Blob,
    name: string
  ): Promise<void> {
    const id = `audio-${type}`;
    
    await this.audioFiles.put({
      id,
      type,
      blob,
      name,
      size: blob.size,
      uploadedAt: new Date()
    });
  }

  /**
   * Get audio file by type
   */
  async getAudioFile(type: 'countdown' | 'racing' | 'finish'): Promise<AudioFile | undefined> {
    const id = `audio-${type}`;
    return await this.audioFiles.get(id);
  }

  /**
   * Get all audio files
   */
  async getAllAudioFiles(): Promise<AudioFile[]> {
    return await this.audioFiles.toArray();
  }

  /**
   * Delete audio file
   */
  async deleteAudioFile(type: 'countdown' | 'racing' | 'finish'): Promise<void> {
    const id = `audio-${type}`;
    await this.audioFiles.delete(id);
  }

  /**
   * Clear all audio files
   */
  async clearAllAudioFiles(): Promise<void> {
    await this.audioFiles.clear();
  }

  /**
   * Convert blob to playable URL
   */
  createAudioUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Revoke audio URL to free memory
   */
  revokeAudioUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const audioDB = new AudioDatabase();
