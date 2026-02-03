import type { BBox, Geometry, Position } from 'geojson'
import proj4 from 'proj4'
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '../types'

// Fallback definition for EPSG:10701 used in tests (UTM-like projected CRS in meters)
// This ensures proj4 can parse the source projection during tests.
proj4.defs('EPSG:10701', '+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs')

export function mapToWGS84Point([x, y, z]: Position): [number, number] {
  if (x === undefined || y === undefined) {
    throw new Error(
      'Point should always contain two numbers, but both x and y values were not found!',
    )
  }

  if (z !== undefined) {
    throw new Error('Point should always contain two numbers, but z value was found!')
  }

  const fromProj = 'EPSG:10701'
  const toProj = 'EPSG:4326'
  const transform = proj4(fromProj, toProj)

  return transform.forward([x, y])
}

export function mapToWGS84MultiPointOrLineString(coordinates: Position[]) {
  return coordinates.map(mapToWGS84Point)
}

export function mapToWGS84MultiLineStringOrPolygon(coordinates: Position[][]): Position[][] {
  return coordinates.map(mapToWGS84MultiPointOrLineString)
}

export function mapToWGS84MultiPolygon(coordinates: Position[][][]): Position[][][] {
  return coordinates.map(mapToWGS84MultiLineStringOrPolygon)
}

export function mapToWGS84BBox(bbox: BBox | undefined): BBox | undefined {
  if (!bbox) {
    return bbox
  }

  const [minX, minY, maxX, maxY] = bbox

  const [minLon, minLat] = mapToWGS84Point([minX, minY])
  const [maxLon, maxLat] = mapToWGS84Point([maxX, maxY])

  return [minLon, minLat, maxLon, maxLat]
}

export function mapToWGS84Geometry(geometry: Geometry): Geometry {
  const bbox = mapToWGS84BBox(geometry.bbox)

  switch (geometry.type) {
    case 'Point':
      return {
        ...geometry,
        bbox,
        coordinates: mapToWGS84Point(geometry.coordinates),
      }
    case 'MultiPoint':
      return {
        ...geometry,
        bbox,
        coordinates: mapToWGS84MultiPointOrLineString(geometry.coordinates),
      }
    case 'LineString':
      return {
        ...geometry,
        bbox,
        coordinates: mapToWGS84MultiPointOrLineString(geometry.coordinates),
      }
    case 'MultiLineString':
      return {
        ...geometry,
        bbox,
        coordinates: mapToWGS84MultiLineStringOrPolygon(geometry.coordinates),
      }
    case 'Polygon':
      return {
        ...geometry,
        bbox,
        coordinates: mapToWGS84MultiLineStringOrPolygon(geometry.coordinates),
      }
    case 'MultiPolygon':
      return {
        ...geometry,
        bbox,
        coordinates: mapToWGS84MultiPolygon(geometry.coordinates),
      }
    case 'GeometryCollection':
      return {
        ...geometry,
        bbox,
        geometries: geometry.geometries.map(mapToWGS84Geometry),
      }

    default:
      break
  }
  throw new Error('Geometry type is not valid')
}

function featureBBoxSortPredicate(a: GeoJSONFeature, b: GeoJSONFeature) {
  const bboxA = a.bbox
  const bboxB = b.bbox

  if (!bboxA || !bboxB) return 0

  const [minLonA, minLatA] = [bboxA[0], bboxA[1]]
  const [minLonB, minLatB] = [bboxB[0], bboxB[1]]

  if (minLatA !== minLatB) return minLatA - minLatB
  return minLonA - minLonB
}

const COLOR_PALLETTE = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c']

export function mapGeoJSONFeatureCollection(geojson: GeoJSONFeatureCollection) {
  const bbox = mapToWGS84BBox(geojson.bbox)

  let colorIndex = -1
  const getColorIndex = () => {
    if (colorIndex == COLOR_PALLETTE.length) {
      colorIndex = -1
    }

    colorIndex += 1
    return colorIndex
  }

  return {
    ...geojson,
    bbox,
    features: geojson.features.sort(featureBBoxSortPredicate).map((feature: GeoJSONFeature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        fill: COLOR_PALLETTE[getColorIndex()],
        'fill-opacity': 0.5,
      },
      bbox: mapToWGS84BBox(feature.bbox),
      geometry: mapToWGS84Geometry(feature.geometry),
    })),
  }
}



