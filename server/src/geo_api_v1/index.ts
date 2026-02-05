import { Request, Response, Express } from "express";
import { fetchGeoStatFIGeoJSON } from "../integrations/geo_stat_fi";
import { promises as fs } from 'fs';
import path from 'path';
import { mapGeoJSONFeatureCollection } from '../../../common/tools/mapCoordinates';

const NEWLINE = "\n   ";

const INFO_START = "\nINFO START\n";
const INFO_END = "\nINFO END\n";

const ERROR_START = "\nERROR START\n";
const ERROR_END = "\nERROR END\n";

function createJSON(path: string, data: object, status: number, date: Date) {
  const log = status === 200 ? console.info : console.error;
  const logStart = status === 200 ? INFO_START : ERROR_START;
  const logEnd = status === 200 ? INFO_END : ERROR_END;
  const dateTime = date.getTime();
  const dateISO = date.toISOString();
  const dateTimezoneOffset = date.getTimezoneOffset();
  const duration = Date.now() - date.getTime();
  log(logStart, dateISO, NEWLINE, status, NEWLINE, path, NEWLINE, duration, data, logEnd);

  return {
    dateTime,
    dateISO,
    dateTimezoneOffset,
    status,
    path,
    duration,
    data,
  };
}

function createErrorData(error: unknown) {
  if (error != null && typeof error === "object") {
    return error;
  }

  return createErrorData(new Error("" + error));
}

function sendJSON(
  reqPath: string,
  res: Response,
  json: object,
  date: Date = new Date(),
  status: number = 200,
) {
  res
    .setHeader("Content-Type", "application/json")
    .status(status)
    .send(createJSON(reqPath, json, status, date));
}

export function sendError(
  reqPath: string,
  res: Response,
  error: unknown,
  status: number = 500,
  date: Date = new Date(),
) {
  const errorData = createErrorData(error);
  sendJSON(reqPath, res, errorData, date, status);
}

export default function (app: Express) {
  const apiRoutePath: string = "/geo/api/v1";

  app.get(apiRoutePath, (req: Request, res: Response) => {
    sendJSON(req.path, res, {
      version: 1,
    });
  });

  app.get(`${apiRoutePath}/areas`, async (req: Request, res: Response) => {
    const date = new Date();

    try {
      const data = await fetchGeoStatFIGeoJSON();
      sendJSON(req.path, res, data, date);
    } catch (error: unknown) {
      sendError(req.path, res, error, 500, date);
    }
  });

  // Local endpoint that reads the bundled kunnat JSON and maps it using common mappers
  app.get(`${apiRoutePath}/kunnat`, async (req: Request, res: Response) => {
    const date = new Date();
    try {
      const assetPath = path.resolve(__dirname, '../../../client/src/assets/kunta_1000k_2025.json');
      const file = await fs.readFile(assetPath, 'utf8');
      const raw = JSON.parse(file);
      const mapped = mapGeoJSONFeatureCollection(raw);

      sendJSON(req.path, res, mapped, date);
    } catch (error: unknown) {
      sendError(req.path, res, error, 500, date);
    }
  });

  app.get(`${apiRoutePath}/search`, (req: Request, res: Response) => {
    const date = new Date();
    const { areaCodes = [], properties = [] } = req.query;
    sendJSON(
      req.path,
      res,
      {
        areaCodes,
        properties,
      },
      date,
    );
  });

  // Secure endpoint to get Google Maps API key (only returns key, no sensitive data exposed in client)
  app.get(`${apiRoutePath}/config/google-maps-key`, (req: Request, res: Response) => {
    const date = new Date();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return sendError(req.path, res, "Google Maps API key not configured", 500, date);
    }

    // Return only the API key in a minimal response
    sendJSON(
      req.path,
      res,
      {
        apiKey,
      },
      date,
    );
  });

  app.get(`${apiRoutePath}/{*any}`, (req: Request, res: Response) => {
    sendError(req.path, res, "Not Found", 404);
  });
}
