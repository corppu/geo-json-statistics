import express from "express";
import * as client from './client';
import * as apiV1 from './geo_api_v1';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    // In development, try to load from .env file
    try {
        require('dotenv').config();
    } catch (e) {
        // dotenv not available in production
    }
}

// Create a new express application instance
const app = express();

// Set the network port
const port = process.env.PORT || 3000;

// Serve APIs
apiV1.default(app);

// Serve clients
client.default(app, "../../../client/dist", "/client");
client.default(app, "../../../client/storybook-static", "/storybook");

// Start the Express server
app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
});
