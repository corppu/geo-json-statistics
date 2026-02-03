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

    it('should register API routes including areas, kunnat and search', () => {
      setupRoutes(mockApp);

      const registeredPaths = mockApp.get.mock.calls.map((c: any) => c[0]);
      expect(registeredPaths).toContain('/geo/api/v1');
      expect(registeredPaths).toContain('/geo/api/v1/areas');
      expect(registeredPaths).toContain('/geo/api/v1/kunnat');
      expect(registeredPaths).toContain('/geo/api/v1/search');
      // catch-all route may be registered with different placeholder syntax
      expect(registeredPaths.some((p: any) => p.includes('*') || p.includes('{*'))).toBe(true);
    });

    it('should register the root route handler', () => {
      setupRoutes(mockApp);
      const registeredPaths = mockApp.get.mock.calls.map((c: any) => c[0]);
      expect(registeredPaths).toContain('/geo/api/v1');
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

    it('kunnat route should return mapped data using local asset', async () => {
      // Spy on fs.readFile to return a small sample
      const sample = JSON.stringify([
        { code: '001', classificationItemNames: [{ name: 'TestKunta' }], localId: 'loc1' },
      ]);

      const fs = await import('fs');
      const spy = vi.spyOn(fs.promises, 'readFile').mockResolvedValue(sample as any);

      // Prepare mockApp to capture kunnat handler
      let kunnatHandler: Function | undefined;
      const mockApp2 = { get: vi.fn((path: string, handler: Function) => { if (path === '/geo/api/v1/kunnat') kunnatHandler = handler; }) };
      setupRoutes(mockApp2);

      // Call handler
      const mockRes2: any = {
        setHeader: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      const mockReq2: any = { path: '/geo/api/v1/kunnat', query: {} };

      await kunnatHandler!(mockReq2, mockRes2);

      expect(mockRes2.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockRes2.status).toHaveBeenCalledWith(200);
      expect(mockRes2.send).toHaveBeenCalled();

      const sentData = (mockRes2.send as any).mock.calls[0][0];
      expect(sentData.data).toBeDefined();
      // cleanup
      spy.mockRestore();
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
          if (String(path).includes('*') || String(path).includes('{*')) {
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
