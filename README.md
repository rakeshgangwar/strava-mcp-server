# Strava MCP Server

This is a Model Context Protocol (MCP) server for the Strava API, allowing Claude to interact with your Strava data.

## Features

The Strava MCP server provides the following tools:

- `get_athlete_activities`: Get activities for the authenticated athlete
- `get_activity`: Get details of a specific activity
- `create_activity`: Create a manual activity
- `get_activity_kudoers`: Get the athletes who kudoed an activity
- `get_activity_laps`: Get the laps of an activity

## Setup Instructions

### 1. Create a Strava API Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application:
   - Application Name: Claude Strava Integration (or any name you prefer)
   - Website: http://localhost
   - Authorization Callback Domain: localhost
3. After creating the application, note your **Client ID** and **Client Secret**

### 2. Obtain a Refresh Token

1. Install the required dependencies:
   ```bash
   cd /Users/{USERNAME}/Documents/Cline/MCP/strava-mcp-server
   npm install
   ```

2. Run the get-strava-token.js script with your Client ID and Client Secret:
```bash
node get-strava-token.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

3. The script will open a browser window asking you to authorize the application to access your Strava data.
4. After authorization, the script will display your refresh token in the terminal.

### 3. Configure the MCP Settings

1. Update the MCP settings file with your Strava API credentials:
   - Location: `/Users/rakeshgangwar/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Add your Client ID, Client Secret, and Refresh Token to the `env` section of the `strava` server configuration:
     ```json
     "strava": {
       "command": "node",
       "args": [
         "/Users/{USERNAME}/Documents/Cline/MCP/strava-mcp-server/dist/index.js"
       ],
       "env": {
         "STRAVA_CLIENT_ID": "YOUR_CLIENT_ID",
         "STRAVA_CLIENT_SECRET": "YOUR_CLIENT_SECRET",
         "STRAVA_REFRESH_TOKEN": "YOUR_REFRESH_TOKEN"
       },
       "disabled": false,
       "autoApprove": []
     }
     ```

### 4. Build and Start the Server

The server will be automatically started by Claude when needed. If you want to test it manually:

```bash
cd /Users/rakeshgangwar/Documents/Cline/MCP/strava-mcp-server
npm run build
npm start
```

## Usage Examples

Once the Strava MCP server is configured, you can ask Claude to interact with your Strava data:

- "Show me my recent Strava activities"
- "Get details about my latest Strava run"
- "Create a new manual activity on Strava"
- "Who kudoed my latest Strava ride?"
- "Show me the laps from my last track workout"

## Troubleshooting

- **Authentication Errors**: If you encounter authentication errors, your refresh token may have expired. Run the get-strava-token.js script again to obtain a new refresh token.
- **Server Not Starting**: Make sure the path to the server in the MCP settings file is correct and that you've built the server with `npm run build`.
- **API Rate Limits**: The Strava API has rate limits. If you encounter rate limit errors, wait a few minutes before trying again.

## License

This project is licensed under the MIT License.
