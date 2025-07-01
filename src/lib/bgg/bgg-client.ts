import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const BGG_API_URL = process.env.BGG_API_URL || 'https://boardgamegeek.com/xmlapi2';
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
    isArray: (name: string) => ['item', 'link', 'name', 'rank'].includes(name),
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
  versions?: BGGGameVersion[];
}

export interface BGGGameVersion {
  id: string;
  type: string;
  thumbnail?: string;
  image?: string;
  links?: BGGPublisherLink[];
  name?: { type: string; sortindex: string; value: string };
  yearpublished?: { value: string };
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
          console.log(`[BGGClient] Fetching from ${BGG_API_URL}${endpoint} with params:`, params);
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

  public async searchGames(options: { query: string; type?: string | string[] }): Promise<BGGSearchResult[]> {
    const { query, type } = options;
    const cacheKey = `search:${query.toLowerCase()}:${type ? JSON.stringify(type) : 'all'}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const searchParams: Record<string, string> = { query, exact: '0' };
    if (type) {
      searchParams.type = Array.isArray(type) ? type.join(',') : type;
    } else {
      searchParams.type = 'boardgame,boardgameexpansion';
    }

    const data = await this.fetchFromBGG<{ items: { item: BGGSearchResult[] } }>('/search', searchParams);

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

  public async getGamesDetails(ids: string[]): Promise<BGGGame[]> {
    if (ids.length === 0) {
      return [];
    }

    const cacheKey = `games:${ids.sort().join(',')}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const data = await this.fetchFromBGG<{ items: { item: BGGGame[] } }>('/thing', {
        id: ids.join(','),
        stats: '1',
      });

      if (!data.items?.item) return [];

      const games = Array.isArray(data.items.item) ? data.items.item : [data.items.item];
      this.cache.set(cacheKey, games);
      
      return games;
    } catch (error) {
      console.error(`Error fetching game details for IDs ${ids.join(',')}:`, error);
      return [];
    }
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

  public async getExpansionsForGame(id: string): Promise<BGGGame[]> {
    const game = await this.getGameDetails(id);
    if (!game || !game.links) {
      return [];
    }

    const expansionLinks = game.links.filter(
      (link) => link.type === 'boardgameexpansion'
    );

    if (expansionLinks.length === 0) {
      return [];
    }

    const expansionIds = expansionLinks.map((link) => link.id);
    return this.getGamesDetails(expansionIds);
  }

  public async getGameVersions(id: string): Promise<BGGGameVersion[] | null> {
    const cacheKey = `versions:${id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const data = await this.fetchFromBGG<{ items: { item: BGGGame } }>('/thing', {
        id,
        versions: '1',
      });

      if (!data.items?.item?.versions) return null;

      const versions = Array.isArray(data.items.item.versions) ? data.items.item.versions : [data.items.item.versions];
      this.cache.set(cacheKey, versions);

      return versions;
    } catch (error) {
      console.error(`Error fetching versions for ID ${id}:`, error);
      return null;
    }
  }
}

export const bggClient = BGGClient.getInstance();
