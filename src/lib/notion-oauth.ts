import { Client as NotionClient } from '@notionhq/client';

// Notion OAuth 2.0 configuration
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || 'http://localhost:3000/api/auth/notion/callback';

// Notion OAuth URLs
const NOTION_OAUTH_BASE_URL = 'https://api.notion.com/v1/oauth';
const NOTION_AUTHORIZE_URL = `${NOTION_OAUTH_BASE_URL}/authorize`;
const NOTION_TOKEN_URL = `${NOTION_OAUTH_BASE_URL}/token`;

export interface NotionOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface NotionOAuthTokens {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_name: string;
  workspace_id: string;
  workspace_icon?: string;
  owner?: {
    type: string;
    user?: {
      id: string;
      name: string;
      avatar_url?: string;
      type: string;
      person?: {
        email: string;
      };
    };
  };
  duplicated_template_id?: string;
}

export interface NotionDatabase {
  object: 'database';
  id: string;
  title: Array<{
    type: 'text';
    text: {
      content: string;
    };
  }>;
  description: Array<{
    type: 'text';
    text: {
      content: string;
    };
  }>;
  icon?: {
    type: 'emoji' | 'file' | 'external';
    emoji?: string;
    file?: { url: string };
    external?: { url: string };
  };
  cover?: {
    type: 'file' | 'external';
    file?: { url: string };
    external?: { url: string };
  };
  properties: Record<string, any>;
  parent: {
    type: string;
    workspace?: boolean;
    page_id?: string;
  };
  created_time: string;
  last_edited_time: string;
}

/**
 * Generate the Notion OAuth authorization URL
 */
export function getNotionAuthUrl(state?: string): string {
  if (!NOTION_CLIENT_ID) {
    throw new Error('NOTION_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: NOTION_CLIENT_ID,
    response_type: 'code',
    redirect_uri: NOTION_REDIRECT_URI,
    owner: 'user',
  });

  if (state) {
    params.set('state', state);
  }

  return `${NOTION_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<NotionOAuthTokens> {
  if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET) {
    throw new Error('Notion OAuth credentials are not configured');
  }

  const response = await fetch(NOTION_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: NOTION_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

/**
 * Create a Notion client with OAuth access token
 */
export function createNotionClient(accessToken: string): NotionClient {
  return new NotionClient({
    auth: accessToken,
  });
}

/**
 * Fetch all databases the user has access to
 */
export async function fetchUserDatabases(accessToken: string): Promise<NotionDatabase[]> {
  const notion = createNotionClient(accessToken);

  try {
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });

    return response.results as NotionDatabase[];
  } catch (error) {
    console.error('Error fetching user databases:', error);
    throw new Error('Failed to fetch databases from Notion');
  }
}

/**
 * Get database title as string
 */
export function getDatabaseTitle(database: NotionDatabase): string {
  return database.title
    .map(title => title.text.content)
    .join('')
    .trim() || 'Untitled Database';
}

/**
 * Get database description as string
 */
export function getDatabaseDescription(database: NotionDatabase): string {
  return database.description
    .map(desc => desc.text.content)
    .join('')
    .trim();
}

/**
 * Check if a database has the required properties for a specific type
 */
export function validateDatabaseStructure(
  database: NotionDatabase,
  type: 'clients' | 'projects' | 'tasks'
): { valid: boolean; missingProperties: string[]; suggestions?: string[] } {
  const requiredProperties: Record<string, string[]> = {
    clients: ['Name', 'Email', 'Company', 'Status'],
    projects: ['Name', 'Client', 'Status', 'Priority'],
    tasks: ['Name', 'Project', 'Status', 'Priority', 'Assignee'],
  };

  const required = requiredProperties[type];
  const existingProperties = Object.keys(database.properties);
  const missingProperties: string[] = [];
  const suggestions: string[] = [];

  required.forEach(prop => {
    // Check for exact match first
    if (!existingProperties.includes(prop)) {
      // Look for similar properties (case-insensitive)
      const similar = existingProperties.find(existing => 
        existing.toLowerCase() === prop.toLowerCase() ||
        existing.toLowerCase().includes(prop.toLowerCase()) ||
        prop.toLowerCase().includes(existing.toLowerCase())
      );
      
      if (similar) {
        suggestions.push(`Consider using '${similar}' for '${prop}'`);
      } else {
        missingProperties.push(prop);
      }
    }
  });

  return {
    valid: missingProperties.length === 0,
    missingProperties,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

/**
 * Test database connection and validate structure
 */
export async function testDatabaseConnection(
  accessToken: string,
  databaseId: string,
  expectedType: 'clients' | 'projects' | 'tasks'
): Promise<{
  success: boolean;
  database?: NotionDatabase;
  validation?: ReturnType<typeof validateDatabaseStructure>;
  error?: string;
}> {
  try {
    const notion = createNotionClient(accessToken);
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const validation = validateDatabaseStructure(database as NotionDatabase, expectedType);

    return {
      success: true,
      database: database as NotionDatabase,
      validation,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to database',
    };
  }
}

/**
 * Refresh access token (if supported by Notion in the future)
 * Currently Notion doesn't support refresh tokens, but this is here for future compatibility
 */
export async function refreshAccessToken(refreshToken: string): Promise<NotionOAuthTokens> {
  // Note: As of 2024, Notion doesn't support refresh tokens
  // Access tokens don't expire, but this method is here for future compatibility
  throw new Error('Notion does not currently support refresh tokens');
}

/**
 * Revoke access token
 */
export async function revokeAccessToken(accessToken: string): Promise<boolean> {
  // Note: Notion doesn't have a revoke endpoint
  // Users need to revoke access from their Notion settings
  // This method is here for completeness and future compatibility
  return true;
}
