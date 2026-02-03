import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { BBox, Geometry, Position } from 'geojson';
import {

mapToWGS84Point,
mapToWGS84MultiPointOrLineString,
mapToWGS84MultiLineStringOrPolygon,
mapToWGS84MultiPolygon,
mapToWGS84BBox,
mapToWGS84Geometry,
} from './mapCoordinates';

describe('mapCoordinates', () => {
describe('mapToWGS84Point', () => {
  it('should transform a 2D point from EPSG:10701 to EPSG:4326', () => {
    const result = mapToWGS84Point([1000000, 2000000]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('number');
  });

  it('should throw error when x is undefined', () => {
    expect(() => mapToWGS84Point([undefined as any, 2000000])).toThrow(
      'Point should always contain two numbers, but both x and y values were not found!',
    );
  });

  it('should throw error when y is undefined', () => {
    expect(() => mapToWGS84Point([1000000, undefined as any])).toThrow(
      'Point should always contain two numbers, but both x and y values were not found!',
    );
  });

  it('should throw error when z value is present', () => {
    expect(() => mapToWGS84Point([1000000, 2000000, 500])).toThrow(
      'Point should always contain two numbers, but z value was found!',
    );
  });
});

describe('mapToWGS84MultiPointOrLineString', () => {
  it('should transform array of points', () => {
    const coordinates: Position[] = [
      [1000000, 2000000],
      [1100000, 2100000],
    ];
    const result = mapToWGS84MultiPointOrLineString(coordinates);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]!.length).toBe(2);
    expect(result[1]!.length).toBe(2);
  });

  it('should handle empty array', () => {
    const result = mapToWGS84MultiPointOrLineString([]);
    expect(result).toEqual([]);
  });

  it('should handle single point', () => {
    const coordinates: Position[] = [[1000000, 2000000]];
    const result = mapToWGS84MultiPointOrLineString(coordinates);

    expect(result.length).toBe(1);
  });
});

describe('mapToWGS84MultiLineStringOrPolygon', () => {
  it('should transform array of line strings', () => {
    const coordinates: Position[][] = [
      [
        [1000000, 2000000],
        [1100000, 2100000],
      ],
      [
        [1200000, 2200000],
        [1300000, 2300000],
      ],
    ];
    const result = mapToWGS84MultiLineStringOrPolygon(coordinates);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]!.length).toBe(2);
    expect(result[1]!.length).toBe(2);
  });

  it('should handle empty array', () => {
    const result = mapToWGS84MultiLineStringOrPolygon([]);
    expect(result).toEqual([]);
  });
});

describe('mapToWGS84MultiPolygon', () => {
  it('should transform array of polygons', () => {
    const coordinates: Position[][][] = [
      [
        [
          [1000000, 2000000],
          [1100000, 2100000],
          [1100000, 2000000],
          [1000000, 2000000],
        ],
      ],
    ];
    const result = mapToWGS84MultiPolygon(coordinates);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]!.length).toBe(1);
    expect(result[0]![0]!.length).toBe(4);
  });

  it('should handle empty array', () => {
    const result = mapToWGS84MultiPolygon([]);
    expect(result).toEqual([]);
  });
});

describe('mapToWGS84BBox', () => {
  it('should transform bounding box coordinates', () => {
    const bbox: BBox = [1000000, 2000000, 1100000, 2100000];
    const result = mapToWGS84BBox(bbox);

    expect(result).toBeDefined();
    expect(result?.length).toBe(4);
    expect(typeof result?.[0]).toBe('number');
    expect(typeof result?.[1]).toBe('number');
    expect(typeof result?.[2]).toBe('number');
    expect(typeof result?.[3]).toBe('number');
  });

  it('should return undefined when bbox is undefined', () => {
    const result = mapToWGS84BBox(undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined when bbox is null', () => {
    const result = mapToWGS84BBox(null as any);
    expect(result).toBeNull();
  });
});

describe('mapToWGS84Geometry', () => {
  it('should transform Point geometry', () => {
    const geometry: Geometry = {
      type: 'Point',
      coordinates: [1000000, 2000000],
    };
    const result = mapToWGS84Geometry(geometry);

    expect(result.type).toBe('Point');
    expect(Array.isArray(result.coordinates)).toBe(true);
    expect(result.coordinates.length).toBe(2);
  });

  it('should transform MultiPoint geometry', () => {
    const geometry: Geometry = {
      type: 'MultiPoint',
      coordinates: [
        [1000000, 2000000],
        [1100000, 2100000],
      ],
    };
    const result = mapToWGS84Geometry(geometry);

    expect(result.type).toBe('MultiPoint');
    expect(result.coordinates.length).toBe(2);
  });

  it('should transform LineString geometry', () => {
    const geometry: Geometry = {
      type: 'LineString',
      coordinates: [
        [1000000, 2000000],
        [1100000, 2100000],
      ],
    };
    const result = mapToWGS84Geometry(geometry);

    expect(result.type).toBe('LineString');
    expect(result.coordinates.length).toBe(2);
  });

  it('should transform MultiLineString geometry', () => {
    const geometry: Geometry = {
      type: 'MultiLineString',
      coordinates: [
        [
          [1000000, 2000000],
          [1100000, 2100000],
        ],
      ],
    };
    const result = mapToWGS84Geometry(geometry);

    expect(result.type).toBe('MultiLineString');
    expect(result.coordinates.length).toBe(1);
  });

  it('should transform Polygon geometry', () => {
    const geometry: Geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [1000000, 2000000],
          [1100000, 2100000],
          [1100000, 2000000],
          [1000000, 2000000],
        ],
      ],
    };
    const result = mapToWGS84Geometry(geometry);

    expect(result.type).toBe('Polygon');
    expect(result.coordinates.length).toBe(1);
  });

  it('should transform MultiPolygon geometry', () => {
    const geometry: Geometry = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [1000000, 2000000],
            [1100000, 2100000],
            [1100000, 2000000],
            [1000000, 2000000],
          ],
        ],
      ],
    };
    const result = mapToWGS84Geometry(geometry);

    expect(result.type).toBe('MultiPolygon');
    expect(result.coordinates.length).toBe(1);
  });

  it('should transform GeometryCollection', () => {
    const geometry: Geometry = {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Point',
          coordinates: [1000000, 2000000],
        },
      ],
    };
    const result = mapToWGS84Geometry(geometry);

    expect(result.type).toBe('GeometryCollection');
    expect(result.geometries?.length).toBe(1);
    expect(result.geometries?.[0].type).toBe('Point');
  });

  it('should transform geometry with bbox', () => {
    const geometry: Geometry = {
      type: 'Point',
      coordinates: [1000000, 2000000],
      bbox: [1000000, 2000000, 1000000, 2000000],
    };
    const result = mapToWGS84Geometry(geometry);

    expect(result.bbox).toBeDefined();
    expect(result.bbox?.length).toBe(4);
  });

  it('should throw error for invalid geometry type', () => {
    const geometry = {
      type: 'InvalidType',
      coordinates: [],
    } as any;

    expect(() => mapToWGS84Geometry(geometry)).toThrow('Geometry type is not valid');
  });
});
});
