# Google Maps API Key Setup

## Overview
The Google Maps API key is now securely managed through environment variables. The key is loaded on the server-side and never exposed to the client-side code.

## Setup Instructions

### 1. Create `.env` file
Copy the `.env.example` file to `.env` in the project root:

```bash
cp .env.example .env
```

### 2. Add your Google Maps API Key
Edit the `.env` file and add your Google Maps API key:

```env
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

### 3. Security Best Practices

✅ **What's Secure:**
- The API key is stored only in `.env` file (which is in `.gitignore`)
- It's never exposed in client-side code
- The frontend fetches it from a backend endpoint only when needed
- The key is loaded as an environment variable on the server

⚠️ **Keep these in mind:**
- Never commit `.env` to version control
- Use `.env.example` to document which variables are needed
- In production, set the `GOOGLE_MAPS_API_KEY` environment variable directly on your hosting platform (e.g., Heroku, Azure, AWS)
- Consider restricting the API key to specific domains/IP addresses in Google Cloud Console

### 4. Environment Variables in Different Environments

**Development:**
```bash
# Use .env file
GOOGLE_MAPS_API_KEY=your_dev_key
```

**Production:**
Set the environment variable in your deployment platform:
- Heroku: `heroku config:set GOOGLE_MAPS_API_KEY=your_prod_key`
- Azure: Use App Service Configuration in Azure Portal
- Docker: Use `docker run -e GOOGLE_MAPS_API_KEY=...`

## How It Works

1. **Server Load**: The server reads `GOOGLE_MAPS_API_KEY` from `.env` in development or from platform environment variables in production
2. **Client Request**: When the app loads, `GeoJSONMapContainer.vue` calls `/geo/api/v1/config/google-maps-key`
3. **Secure Response**: The backend securely returns the API key to the frontend
4. **Usage**: The frontend passes the key to the Google Maps component

## Troubleshooting

**"Google Maps API key not configured" error**
- Check if `.env` file exists in the project root
- Verify the key is set: `GOOGLE_MAPS_API_KEY=your_key`
- Restart the server after adding the key

**API key not working**
- Verify the key is valid in Google Cloud Console
- Check if Maps JavaScript API is enabled in your Google Cloud project
- Ensure domain restrictions (if set) include your development/production domain
