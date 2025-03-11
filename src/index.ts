#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Environment variables for Strava API authentication
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
  throw new Error('Missing required Strava API credentials in environment variables');
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

class StravaServer {
  private server: Server;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.server = new Server(
      {
        name: 'strava-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    
    // If we have a valid token, return it
    if (this.accessToken && this.tokenExpiresAt > now + 60) {
      return this.accessToken;
    }
    
    // Otherwise, get a new token
    try {
      const response = await axios.post<StravaTokenResponse>(
        'https://www.strava.com/oauth/token',
        {
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: STRAVA_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }
      );
      
      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = response.data.expires_at;
      
      return this.accessToken;
    } catch (error) {
      console.error('Error refreshing Strava access token:', error);
      throw new McpError(
        ErrorCode.InternalError,
        'Failed to refresh Strava access token'
      );
    }
  }

  private async stravaApiRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    params?: Record<string, any>,
    data?: Record<string, any>
  ): Promise<T> {
    const accessToken = await this.getAccessToken();
    
    try {
      const response = await axios({
        method,
        url: `https://www.strava.com/api/v3${endpoint}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
        data,
      });
      
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        throw new McpError(
          ErrorCode.InternalError,
          `Strava API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Strava API request failed: ${error.message}`
      );
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_athlete_activities',
          description: 'Get activities for the authenticated athlete',
          inputSchema: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              per_page: {
                type: 'number',
                description: 'Number of items per page (default: 30, max: 100)',
                minimum: 1,
                maximum: 100,
              },
              before: {
                type: 'string',
                description: 'An epoch timestamp to use for filtering activities that have taken place before a certain time',
              },
              after: {
                type: 'string',
                description: 'An epoch timestamp to use for filtering activities that have taken place after a certain time',
              },
            },
          },
        },
        {
          name: 'get_activity',
          description: 'Get details of a specific activity',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The identifier of the activity',
              },
              include_all_efforts: {
                type: 'boolean',
                description: 'To include all segments efforts',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'create_activity',
          description: 'Create a manual activity',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the activity',
              },
              sport_type: {
                type: 'string',
                description: 'Sport type of activity (e.g., Run, MountainBikeRide, Ride)',
              },
              start_date_local: {
                type: 'string',
                description: 'ISO 8601 formatted date time',
              },
              elapsed_time: {
                type: 'number',
                description: 'In seconds',
              },
              type: {
                type: 'string',
                description: 'Type of activity (e.g., Run, Ride)',
              },
              description: {
                type: 'string',
                description: 'Description of the activity',
              },
              distance: {
                type: 'number',
                description: 'In meters',
              },
              trainer: {
                type: 'number',
                description: 'Set to 1 to mark as a trainer activity',
              },
              commute: {
                type: 'number',
                description: 'Set to 1 to mark as commute',
              },
            },
            required: ['name', 'sport_type', 'start_date_local', 'elapsed_time'],
          },
        },
        {
          name: 'get_activity_kudoers',
          description: 'Get the athletes who kudoed an activity',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The identifier of the activity',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              per_page: {
                type: 'number',
                description: 'Number of items per page (default: 30)',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'get_activity_laps',
          description: 'Get the laps of an activity',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The identifier of the activity',
              },
            },
            required: ['id'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_athlete_activities': {
          const { page, per_page, before, after } = request.params.arguments as {
            page?: number;
            per_page?: number;
            before?: string;
            after?: string;
          };
          
          const activities = await this.stravaApiRequest(
            'get',
            '/athlete/activities',
            {
              page,
              per_page,
              before,
              after,
            }
          );
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(activities, null, 2),
              },
            ],
          };
        }
        
        case 'get_activity': {
          const { id, include_all_efforts } = request.params.arguments as {
            id: string;
            include_all_efforts?: boolean;
          };
          
          const activity = await this.stravaApiRequest(
            'get',
            `/activities/${id}`,
            {
              include_all_efforts,
            }
          );
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(activity, null, 2),
              },
            ],
          };
        }
        
        case 'create_activity': {
          const activityData = request.params.arguments as {
            name: string;
            sport_type: string;
            start_date_local: string;
            elapsed_time: number;
            type?: string;
            description?: string;
            distance?: number;
            trainer?: number;
            commute?: number;
          };
          
          const activity = await this.stravaApiRequest(
            'post',
            '/activities',
            undefined,
            activityData
          );
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(activity, null, 2),
              },
            ],
          };
        }
        
        case 'get_activity_kudoers': {
          const { id, page, per_page } = request.params.arguments as {
            id: string;
            page?: number;
            per_page?: number;
          };
          
          const kudoers = await this.stravaApiRequest(
            'get',
            `/activities/${id}/kudos`,
            {
              page,
              per_page,
            }
          );
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(kudoers, null, 2),
              },
            ],
          };
        }
        
        case 'get_activity_laps': {
          const { id } = request.params.arguments as {
            id: string;
          };
          
          const laps = await this.stravaApiRequest(
            'get',
            `/activities/${id}/laps`
          );
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(laps, null, 2),
              },
            ],
          };
        }
        
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Strava MCP server running on stdio');
  }
}

const server = new StravaServer();
server.run().catch(console.error);
