import { create } from 'zustand';
import type { 
  Player, 
  GameState, 
  DuckProfile, 
  Lane, 
  Obstacle,
  FinishResult 
} from '../core/types/race';
import { audioDB } from '../dexie/audioDB';

interface RaceState {
  // Settings
  players: Player[];
  raceMode: 'fixed' | 'random';
  raceDuration: number;
  audioFiles: {
    countdown?: Blob;
    racing?: Blob;
    finish?: Blob;
  };
  
  // Calculated race data
  lanes: Lane[];
  profiles: DuckProfile[];
  obstacles: Obstacle[];
  isCalculating: boolean;
  
  // Runtime
  gameState: GameState;
  currentResults: FinishResult[] | null;
  raceStartTime: number | null;
  
  // Actions
  addPlayer: (name: string, votes: number) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  setRaceMode: (mode: 'fixed' | 'random') => void;
  setRaceDuration: (seconds: number) => void;
  uploadAudio: (type: 'countdown' | 'racing' | 'finish', file: File) => Promise<void>;
  loadAudioFromDB: () => Promise<void>;
  deleteAudio: (type: 'countdown' | 'racing' | 'finish') => Promise<void>;
  setRaceData: (data: { lanes: Lane[]; profiles: DuckProfile[]; obstacles: Obstacle[] }) => void;
  setGameState: (state: GameState) => void;
  setCurrentResults: (results: FinishResult[] | null) => void;
  setRaceStartTime: (time: number | null) => void;
  setIsCalculating: (calculating: boolean) => void;
  resetRace: () => void;
  resetAll: () => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useRaceStore = create<RaceState>((set) => ({
  // Initial state
  players: [
    { id: generateId(), name: 'Player 1', votes: 10 },
    { id: generateId(), name: 'Player 2', votes: 8 },
    { id: generateId(), name: 'Player 3', votes: 5 },
    { id: generateId(), name: 'Player 4', votes: 3 },
    { id: generateId(), name: 'Player 5', votes: 1 }
  ],
  raceMode: 'fixed',
  raceDuration: 10,
  audioFiles: {},
  lanes: [],
  profiles: [],
  obstacles: [],
  isCalculating: false,
  gameState: 'settings',
  currentResults: null,
  raceStartTime: null,

  // Actions
  addPlayer: (name: string, votes: number) => {
    const newPlayer: Player = {
      id: generateId(),
      name,
      votes
    };
    set(state => ({
      players: [...state.players, newPlayer]
    }));
  },

  removePlayer: (id: string) => {
    set(state => ({
      players: state.players.filter(p => p.id !== id)
    }));
  },

  updatePlayer: (id: string, updates: Partial<Player>) => {
    set(state => ({
      players: state.players.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
    }));
  },

  setRaceMode: (mode) => set({ raceMode: mode }),

  setRaceDuration: (seconds) => set({ raceDuration: seconds }),

  uploadAudio: async (type, file) => {
    try {
      await audioDB.saveAudioFile(type, file, file.name);
      set(state => ({
        audioFiles: {
          ...state.audioFiles,
          [type]: file
        }
      }));
    } catch (error) {
      console.error('Failed to upload audio:', error);
      throw error;
    }
  },

  loadAudioFromDB: async () => {
    try {
      const files = await audioDB.getAllAudioFiles();
      const audioFiles: { countdown?: Blob; racing?: Blob; finish?: Blob } = {};
      
      files.forEach(file => {
        audioFiles[file.type] = file.blob;
      });
      
      set({ audioFiles });
    } catch (error) {
      console.error('Failed to load audio from DB:', error);
    }
  },

  deleteAudio: async (type) => {
    try {
      await audioDB.deleteAudioFile(type);
      set(state => {
        const newAudioFiles = { ...state.audioFiles };
        delete newAudioFiles[type];
        return { audioFiles: newAudioFiles };
      });
    } catch (error) {
      console.error('Failed to delete audio:', error);
      throw error;
    }
  },

  setRaceData: (data) => set({
    lanes: data.lanes,
    profiles: data.profiles,
    obstacles: data.obstacles
  }),

  setGameState: (state) => set({ gameState: state }),

  setCurrentResults: (results) => set({ currentResults: results }),

  setRaceStartTime: (time) => set({ raceStartTime: time }),

  setIsCalculating: (calculating) => set({ isCalculating: calculating }),

  resetRace: () => set({
    gameState: 'settings',
    currentResults: null,
    raceStartTime: null,
    isCalculating: false
  }),

  resetAll: () => set({
    players: [
      { id: generateId(), name: 'Player 1', votes: 10 },
      { id: generateId(), name: 'Player 2', votes: 8 },
      { id: generateId(), name: 'Player 3', votes: 5 },
      { id: generateId(), name: 'Player 4', votes: 3 },
      { id: generateId(), name: 'Player 5', votes: 1 }
    ],
    raceMode: 'fixed',
    raceDuration: 10,
    lanes: [],
    profiles: [],
    obstacles: [],
    isCalculating: false,
    gameState: 'settings',
    currentResults: null,
    raceStartTime: null
  })
}));
