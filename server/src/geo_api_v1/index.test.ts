import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import setupRoutes, { sendError } from './index';

describe('geo_api_v1 routes', () => {
  let mockRes: Partial<Response>;
  let mockReq: Partial<Request>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRes = {
      setHeader: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    mockReq = {
      path: '/test-path',
      query: {},
    };
  });

  describe('sendError function', () => {
    it('should send error with default status 500', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      sendError('/error-path', mockRes as Response, 'Test error', 500, testDate);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalled();

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.status).toBe(500);
      expect(sentData.path).toBe('/error-path');
    });

    it('should send error with custom status code', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      sendError('/error-path', mockRes as Response, 'Not found', 404, testDate);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should handle Error objects', () => {
      const testError = new Error('Test error message');
      const testDate = new Date('2026-01-11T10:00:00Z');
      sendError('/error-path', mockRes as Response, testError, 500, testDate);

      expect(mockRes.send).toHaveBeenCalled();
      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.data).toHaveProperty('message');
    });

    it('should handle non-Error objects', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      sendError('/error-path', mockRes as Response, 'String error', 400, testDate);

      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle null error', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      sendError('/error-path', mockRes as Response, null, 500, testDate);

      expect(mockRes.send).toHaveBeenCalled();
      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.status).toBe(500);
    });

    it('should use default date when not provided', () => {
      const beforeTime = Date.now();
      sendError('/error-path', mockRes as Response, 'Test error');
      const afterTime = Date.now();

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.dateTime).toBeGreaterThanOrEqual(beforeTime);
      expect(sentData.dateTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('routes setup', () => {
    let mockApp: any;

    beforeEach(() => {
      mockApp = {
        get: vi.fn(),
      };
    });

    it('should register three GET routes', () => {
      setupRoutes(mockApp);

      expect(mockApp.get).toHaveBeenCalledTimes(3);
    });

    it('should register root API route at /geo/api/v1', () => {
      setupRoutes(mockApp);

      const firstCall = mockApp.get.mock.calls[0];
      expect(firstCall[0]).toBe('/geo/api/v1');
    });

    it('should register search route at /geo/api/v1/search', () => {
      setupRoutes(mockApp);

      const secondCall = mockApp.get.mock.calls[1];
      expect(secondCall[0]).toBe('/geo/api/v1/search');
    });

    it('should register catch-all route at /geo/api/v1/*', () => {
      setupRoutes(mockApp);

      const thirdCall = mockApp.get.mock.calls[2];
      expect(thirdCall[0]).toBe('/geo/api/v1/*');
    });
  });

  describe('root API route handler', () => {
    let mockApp: any;
    let routeHandler: Function;

    beforeEach(() => {
      mockApp = {
        get: vi.fn((path, handler) => {
          if (path === '/geo/api/v1') {
            routeHandler = handler;
          }
        }),
      };
      setupRoutes(mockApp);
    });

    it('should return version 1', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(testDate);

      routeHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalled();

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.data.version).toBe(1);
      expect(sentData.status).toBe(200);

      vi.useRealTimers();
    });
  });

  describe('search route handler', () => {
    let mockApp: any;
    let searchHandler: Function;

    beforeEach(() => {
      mockApp = {
        get: vi.fn((path, handler) => {
          if (path === '/geo/api/v1/search') {
            searchHandler = handler;
          }
        }),
      };
      setupRoutes(mockApp);
    });

    it('should return empty arrays when no query parameters provided', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(testDate);

      mockReq.query = {};
      searchHandler(mockReq as Request, mockRes as Response);

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.data.areaCodes).toEqual([]);
      expect(sentData.data.properties).toEqual([]);

      vi.useRealTimers();
    });

    it('should return query parameters when provided', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(testDate);

      mockReq.query = {
        areaCodes: ['code1', 'code2'],
        properties: ['prop1', 'prop2'],
      };
      searchHandler(mockReq as Request, mockRes as Response);

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.data.areaCodes).toEqual(['code1', 'code2']);
      expect(sentData.data.properties).toEqual(['prop1', 'prop2']);

      vi.useRealTimers();
    });

    it('should return HTTP 200 status', () => {
      searchHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('catch-all route handler', () => {
    let mockApp: any;
    let catchAllHandler: Function;

    beforeEach(() => {
      mockApp = {
        get: vi.fn((path, handler) => {
          if (path === '/geo/api/v1/*') {
            catchAllHandler = handler;
          }
        }),
      };
      setupRoutes(mockApp);
    });

    it('should return 404 error for unknown routes', () => {
      mockReq.path = '/geo/api/v1/unknown';
      catchAllHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalled();

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.status).toBe(404);
    });
  });

  describe('response structure', () => {
    let mockApp: any;
    let routeHandler: Function;

    beforeEach(() => {
      mockApp = {
        get: vi.fn((path, handler) => {
          if (path === '/geo/api/v1') {
            routeHandler = handler;
          }
        }),
      };
      setupRoutes(mockApp);
    });

    it('should include all required fields in response', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(testDate);

      routeHandler(mockReq as Request, mockRes as Response);

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData).toHaveProperty('dateTime');
      expect(sentData).toHaveProperty('dateISO');
      expect(sentData).toHaveProperty('dateTimezoneOffset');
      expect(sentData).toHaveProperty('status');
      expect(sentData).toHaveProperty('path');
      expect(sentData).toHaveProperty('duration');
      expect(sentData).toHaveProperty('data');

      vi.useRealTimers();
    });

    it('should have correct dateISO format', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      vi.setSystemTime(testDate);
      routeHandler(mockReq as Request, mockRes as Response);

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(sentData.dateISO).toBe('2026-01-11T10:00:00.000Z');
    });

    it('should include timezone offset', () => {
      const testDate = new Date('2026-01-11T10:00:00Z');
      routeHandler(mockReq as Request, mockRes as Response);

      const sentData = (mockRes.send as any).mock.calls[0][0];
      expect(typeof sentData.dateTimezoneOffset).toBe('number');
    });
  });
});
