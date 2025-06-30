import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const BGG_API_URL = process.env.BGG_API_URL || 'https://boardgamegeek.com/xmlapi2';
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name) => ['item', 'link', 'name', 'rank'].includes(name),
});

export interface BGGGame {
  type: string;
  id: string;
  name: string;
  yearpublished?: number;
  thumbnail?: string;
  image?: string;
  description?: string;
  minplayers?: number;
  maxplayers?: number;
  playingtime?: number;
  minplaytime?: number;
  maxplaytime?: number;
  minage?: number;
  statistics?: {
    ratings: {
      average: {
        value: number;
      };
      usersrated: {
        value: number;
      };
      ranks?: {
        rank: Array<{
          type: string;
          id: string;
          name: string;
          friendlyname: string;
          value: string;
          bayesaverage: string;
        }>;
      };
    };
  };
  links?: Array<{
    type: string;
    id: string;
    value: string;
    [key: string]: any;
  }>;
}

export interface BGGSearchResult {
  id: string;
  type: string;
  name: string;
  yearpublished?: number;
}

export class BGGClient {
  private static instance: BGGClient;
  private cache: Map<string, any>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): BGGClient {
    if (!BGGClient.instance) {
      BGGClient.instance = new BGGClient();
    }
    return BGGClient.instance;
  }

  private async fetchFromBGG<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    try {
      const response = await axios.get(`${BGG_API_URL}${endpoint}`, {
        params,
        timeout: 10000,
      });
      
      if (response.status === 200) {
        return parser.parse(response.data);
      }
      throw new Error(`BGG API returned status ${response.status}`);
    } catch (error) {
      console.error('Error fetching from BGG API:', error);
      throw error;
    }
  }

  public async searchGames(query: string): Promise<BGGSearchResult[]> {
    const cacheKey = `search:${query.toLowerCase()}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const data = await this.fetchFromBGG<{ items: { item: BGGSearchResult[] } }>('/search', {
      query,
      type: 'boardgame,boardgameexpansion',
      exact: '0',
    });

    // Remove duplicate game IDs while preserving the first occurrence
    const uniqueResults = (data.items?.item || []).reduce<BGGSearchResult[]>((acc, current) => {
      if (!acc.some(item => item.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    this.cache.set(cacheKey, uniqueResults);
    
    return uniqueResults;
  }

  public async getGameDetails(id: string): Promise<BGGGame | null> {
    const cacheKey = `game:${id}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const data = await this.fetchFromBGG<{ items: { item: BGGGame } }>('/thing', {
        id,
        stats: '1',
      });

      if (!data.items?.item) return null;

      const game = Array.isArray(data.items.item) ? data.items.item[0] : data.items.item;
      this.cache.set(cacheKey, game);
      
      return game;
    } catch (error) {
      console.error(`Error fetching game details for ID ${id}:`, error);
      return null;
    }
  }

  public async searchAndGetDetails(query: string): Promise<BGGGame[]> {
    const searchResults = await this.searchGames(query);
    const detailedGames = await Promise.all(
      searchResults.map((result) => this.getGameDetails(result.id))
    );
    return detailedGames.filter((game): game is BGGGame => game !== null);
  }
}

export const bggClient = BGGClient.getInstance();
