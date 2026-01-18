import express, { Request, Response, Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

function mapDistPathToClientRoutePath(distPath: string) {
  const lastItemStartsAt = distPath.lastIndexOf("/");
  if (lastItemStartsAt === -1) {
    return '/' + distPath;
  }

  return distPath.substring(lastItemStartsAt);
}

export default function (app: Express, distPath: string, clientRoutePath: string = mapDistPathToClientRoutePath(distPath)) {
  // Get current directory for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Serve static files from the Vue client dist directory
  const clientDistPath = path.join(__dirname, distPath);
  app.use(express.static(clientDistPath));

  // Define the root path to serve the Vue client
  app.get(clientRoutePath, (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });

  // Fallback to index.html for client-side routing
  app.get(`${clientRoutePath}/{*any}`, (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}
