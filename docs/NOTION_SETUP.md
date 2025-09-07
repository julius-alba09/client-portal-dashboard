# Notion OAuth Integration Setup

This guide walks you through setting up the Notion OAuth integration for the Client Portal Dashboard, similar to how third-party apps like Zapier, Todoist, or Monday.com integrate with Notion.

## Overview

The Client Portal Dashboard uses Notion's OAuth 2.0 API to connect to users' Notion workspaces and access their databases. This allows users to:

- Connect their own Notion workspace securely
- Select which databases to use for clients, projects, and tasks
- Have real-time data synchronization with their existing Notion setup
- Maintain data ownership and control

## 🏗️ Architecture

The integration follows the standard OAuth 2.0 flow:

1. **User Authorization**: User clicks "Connect to Notion" and is redirected to Notion's authorization server
2. **OAuth Callback**: Notion redirects back with an authorization code
3. **Token Exchange**: Server exchanges code for access token
4. **Database Discovery**: App fetches user's databases and validates structure
5. **Configuration**: User selects which databases to use for each data type
6. **Data Sync**: App uses user's access token to read/write data to their Notion databases

## 🔧 Setup Instructions

### Step 1: Create a Notion Integration

1. **Go to Notion's Integration Gallery**
   - Visit [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Click "New integration"

2. **Configure Your Integration**
   - **Name**: `Client Portal Dashboard` (or your preferred name)
   - **Logo**: Upload your app logo (optional)
   - **Description**: "A client portal dashboard that syncs with your Notion workspace"
   - **Website**: Your app's website URL
   - **Redirect URI**: `http://localhost:3000/api/auth/notion/callback` (for development)
   - For production: `https://yourdomain.com/api/auth/notion/callback`

3. **Set Capabilities**
   - ✅ **Read content**
   - ✅ **Update content** 
   - ✅ **Insert content**
   - ❌ **Read user information** (not needed)

4. **OAuth Domain and URLs**
   - **OAuth redirect URLs**: 
     - Development: `http://localhost:3000/api/auth/notion/callback`
     - Production: `https://yourdomain.com/api/auth/notion/callback`

5. **Submit for Review** (if distributing publicly)
   - For private use, you can skip this step

### Step 2: Get Your Credentials

After creating the integration:

1. **Copy Client ID**: Found on the integration settings page
2. **Copy Client Secret**: Found on the integration settings page  
3. **Note the Redirect URI**: Must match exactly what you configured

### Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Notion OAuth Integration
NOTION_CLIENT_ID=your_client_id_here
NOTION_CLIENT_SECRET=your_client_secret_here
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback

# For production
# NOTION_REDIRECT_URI=https://yourdomain.com/api/auth/notion/callback
```

### Step 4: Set Up Your Notion Databases

The app expects three databases with specific structures:

#### Clients Database
Required properties:
- **Name** (Title): Client name
- **Email** (Email): Contact email
- **Company** (Rich Text): Company name
- **Status** (Select): Options: `Active`, `Inactive`, `Pending`

Optional properties:
- **Avatar** (Files): Profile image
- **Phone** (Phone): Contact phone
- **Notes** (Rich Text): Additional notes

#### Projects Database  
Required properties:
- **Name** (Title): Project name
- **Client** (Relation): Link to Clients database
- **Status** (Select): Options: `Not Started`, `In Progress`, `On Hold`, `Completed`, `Cancelled`
- **Priority** (Select): Options: `Low`, `Medium`, `High`, `Urgent`

Optional properties:
- **Description** (Rich Text): Project details
- **Start Date** (Date): Project start date
- **Due Date** (Date): Project deadline
- **Budget** (Number): Project budget

#### Tasks Database
Required properties:
- **Name** (Title): Task title
- **Project** (Relation): Link to Projects database
- **Status** (Select): Options: `To Do`, `In Progress`, `Review`, `Done`, `Blocked`
- **Priority** (Select): Options: `Low`, `Medium`, `High`, `Urgent`
- **Assignee** (Rich Text): Person assigned to task

Optional properties:
- **Description** (Rich Text): Task details
- **Due Date** (Date): Task deadline
- **Estimated Hours** (Number): Time estimate
- **Actual Hours** (Number): Time spent
- **Tags** (Multi-select): Task categories

### Step 5: Test the Integration

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Settings**
   - Go to `http://localhost:3000/settings`
   - You should see the Notion Integration card

3. **Connect to Notion**
   - Click "Connect to Notion"
   - You'll be redirected to Notion for authorization
   - Grant permissions to your workspace
   - You'll be redirected back to the settings page

4. **Configure Databases**
   - Select your Clients, Projects, and Tasks databases
   - The app will validate the structure and show recommendations
   - Click "Save Configuration"

## 🔒 Security Considerations

### Token Storage
- **Development**: Tokens are stored in HTTP-only cookies for demo purposes
- **Production**: Store tokens encrypted in your database with proper user association

### Scopes and Permissions
- The integration only requests necessary permissions (read/write content)
- Users can revoke access from their Notion settings at any time
- Tokens don't expire but can be revoked by the user

### Data Privacy
- The app only accesses databases that users explicitly share
- No data is stored permanently without user consent
- All API calls are made server-side to protect tokens

## 🚀 Production Deployment

### Environment Variables
```env
NOTION_CLIENT_ID=your_production_client_id
NOTION_CLIENT_SECRET=your_production_client_secret
NOTION_REDIRECT_URI=https://yourdomain.com/api/auth/notion/callback
```

### Database Storage
Replace cookie-based storage with proper database storage:

```typescript
// Example: Store in database instead of cookies
const userIntegration = await db.notionIntegrations.create({
  userId: user.id,
  accessToken: encrypt(tokens.access_token),
  workspaceId: tokens.workspace_id,
  workspaceName: tokens.workspace_name,
  clientsDatabase: config.clientsDatabase,
  projectsDatabase: config.projectsDatabase,
  tasksDatabase: config.tasksDatabase,
});
```

### Webhook Support (Future Enhancement)
Notion doesn't currently support webhooks, but you can implement polling:

```typescript
// Example: Periodic sync job
cron.schedule('*/5 * * * *', async () => {
  const integrations = await db.notionIntegrations.findMany({
    where: { active: true }
  });
  
  for (const integration of integrations) {
    await syncNotionData(integration);
  }
});
```

## 🔍 Troubleshooting

### Common Issues

**"Client ID not found"**
- Verify `NOTION_CLIENT_ID` is set correctly
- Check if the integration exists in your Notion workspace

**"Invalid redirect URI"**
- Ensure the redirect URI in your Notion integration matches exactly
- Check for trailing slashes or protocol mismatches

**"Database not found"**
- Verify the integration has access to the selected databases
- User must explicitly share databases with the integration

**"Missing properties"**
- Check that your databases have the required properties
- Property names are case-sensitive

### Debug Mode

Enable debug logging:

```env
DEBUG=notion:*
NODE_ENV=development
```

This will show detailed Notion API request/response logs.

## 📚 API Reference

### Key Functions

**OAuth Flow**:
- `getNotionAuthUrl()`: Generate authorization URL
- `exchangeCodeForTokens()`: Exchange code for tokens

**Database Operations**:
- `fetchUserDatabases()`: Get user's databases
- `validateDatabaseStructure()`: Check database schema
- `testDatabaseConnection()`: Test database access

**Data Operations**:
- `fetchNotionClient()`: Get specific client
- `fetchNotionProjectsByClient()`: Get projects for client  
- `fetchNotionTasksByClient()`: Get tasks for client
- `updateNotionTask()`: Update a task

### Error Handling

All functions include proper error handling and fallback to dummy data when Notion is not configured.

## 🎯 Best Practices

1. **Always validate database structure** before saving configuration
2. **Provide clear error messages** to help users fix issues
3. **Use rate limiting** to avoid hitting Notion's API limits
4. **Implement retry logic** for transient failures
5. **Cache frequently accessed data** to improve performance
6. **Log integration events** for debugging and monitoring

## 🔄 Migration from Internal Integration

If you're migrating from a Notion Internal Integration:

1. **Create OAuth integration** following steps above
2. **Update environment variables** to use OAuth credentials
3. **Migrate existing data** to use database relations
4. **Test thoroughly** with your existing databases
5. **Update documentation** for your users

---

For additional help, see the [Notion API documentation](https://developers.notion.com) or [open an issue](https://github.com/your-repo/issues) in this repository.
