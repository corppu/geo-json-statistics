import type { Meta, StoryObj } from "@storybook/vue3-vite";
import type { GeoJSONFeatureCollection } from "../../../common/types";
import GoogleMap from "../components/GoogleMap.vue";

// Sample GeoJSON data for testing
const samplePointGeoJSON: GeoJSONFeatureCollection = {
  type: "FeatureCollection",

  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [24.9384, 60.1699],
      },
      properties: {
        title: "Helsinki",
        description: "Capital of Finland",
        areaCode: "helsinki",
        areaName: { en: "Helsinki", fi: "Helsinki" },
        populationSize: 656000,
        "marker-size": "medium",
        "marker-color": "ff0000",
        "marker-symbol": "h",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [25.7482, 62.6022],
      },
      properties: {
        title: "Kuopio",
        description: "City in central Finland",
        areaCode: "kuopio",
        areaName: { en: "Kuopio", fi: "Kuopio" },
        populationSize: 128000,
        "marker-size": "small",
        "marker-color": "0000ff",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [23.5505, 61.9241],
      },
      properties: {
        title: "Turku",
        description: "City in southwestern Finland",
        areaCode: "turku",
        areaName: { en: "Turku", fi: "Turku" },
        populationSize: 196000,
        "marker-size": "large",
        "marker-color": "00ff00",
      },
    },
  ],
};

const samplePolygonGeoJSON: GeoJSONFeatureCollection = {
  type: "FeatureCollection",

  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [24.0, 60.0],
            [25.5, 60.0],
            [25.5, 61.0],
            [24.0, 61.0],
            [24.0, 60.0],
          ],
        ],
      },
      properties: {
        title: "Southern Region",
        description: "A region in southern Finland",
        areaCode: "south",
        areaName: { en: "South", fi: "Etelä" },
        areaSize: 5000,
        populationSize: 1500000,
        stroke: "0066cc",
        "stroke-width": 2,
        "stroke-opacity": 1,
        fill: "0066cc",
        "fill-opacity": 0.3,
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [25.0, 61.5],
            [27.0, 61.5],
            [27.0, 63.0],
            [25.0, 63.0],
            [25.0, 61.5],
          ],
        ],
      },
      properties: {
        title: "Central Region",
        description: "A region in central Finland",
        areaCode: "central",
        areaName: { en: "Central", fi: "Keskusta" },
        areaSize: 7000,
        populationSize: 800000,
        stroke: "ff6600",
        "stroke-width": 3,
        "stroke-opacity": 1,
        fill: "ff6600",
        "fill-opacity": 0.2,
      },
    },
  ],
};

const sampleLineGeoJSON: GeoJSONFeatureCollection = {
  type: "FeatureCollection",

  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [24.9384, 60.1699],
          [25.7482, 62.6022],
        ],
      },
      properties: {
        areaCode: "routeheku",
        areaName: { en: "Route Helsinki to Kuopio",
          fi: "Reitti Helsingistä Kuopioon",
        },
        title: "Route Helsinki to Kuopio",
        description: "Main transportation route",
        stroke: "00aa00",
        "stroke-width": 4,
        "stroke-opacity": 0.8,
      },
    },
  ],
};

const meta = {
  title: "Components/GoogleMap",
  component: GoogleMap,
  tags: ["autodocs"],
  argTypes: {
    zoom: { control: "number", min: 1, max: 19 },
    height: { control: "text" },
    apiKey: { control: "text", description: "Google Maps API Key (required)" },
    center: {
      control: { type: "object" },
      description: "[latitude, longitude]",
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "GoogleMap component for displaying GeoJSON data using Google Maps API. Requires a valid Google Maps API key.",
      },
    },
  },
} satisfies Meta<typeof GoogleMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default map without any GeoJSON data
 * Note: Requires a valid Google Maps API key to be provided
 */
export const EmptyMap: Story = {
  args: {
    zoom: 5,
    center: [62.2, 25.7482],
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "A basic empty map centered on Finland. Provide your own API key in the apiKey prop.",
      },
    },
  },
};

/**
 * Map displaying point features with different marker styles and sizes
 */
export const PointFeatures: Story = {
  args: {
    geojson: samplePointGeoJSON,
    zoom: 7,
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Shows point features with styled markers in different sizes and colors.",
      },
    },
  },
};

/**
 * Map displaying polygon features with fill and stroke styling
 */
export const PolygonFeatures: Story = {
  args: {
    geojson: samplePolygonGeoJSON,
    zoom: 7,
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Shows polygon features with customized fill and stroke styles.",
      },
    },
  },
};

/**
 * Map displaying line features (routes/connections)
 */
export const LineFeatures: Story = {
  args: {
    geojson: sampleLineGeoJSON,
    zoom: 8,
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Shows line features representing routes or connections between locations.",
      },
    },
  },
};

/**
 * Map displaying mixed feature types (points, polygons, and lines)
 */
export const MixedFeatures: Story = {
  args: {
    geojson: {
      type: "FeatureCollection",

      features: [
        ...samplePointGeoJSON.features,
        ...samplePolygonGeoJSON.features,
        ...sampleLineGeoJSON.features,
      ],
    },
    zoom: 7,
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Shows all feature types together: points, polygons, and lines.",
      },
    },
  },
};

/**
 * Map with custom zoom level
 */
export const ZoomedIn: Story = {
  args: {
    geojson: samplePointGeoJSON,
    zoom: 11,
    center: [60.1699, 24.9384],
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Map zoomed in to street level, focused on Helsinki.",
      },
    },
  },
};

/**
 * Map with wider view for all features
 */
export const ZoomedOut: Story = {
  args: {
    geojson: samplePointGeoJSON,
    zoom: 5,
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Map zoomed out to show a wider area of Finland.",
      },
    },
  },
};

/**
 * Map with custom height
 */
export const TallMap: Story = {
  args: {
    geojson: samplePolygonGeoJSON,
    height: "800px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Map with increased height for better visibility.",
      },
    },
  },
};

/**
 * Map with small height
 */
export const CompactMap: Story = {
  args: {
    geojson: samplePointGeoJSON,
    height: "300px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Map with reduced height for space-constrained layouts.",
      },
    },
  },
};

/**
 * Interactive story - Demonstrates popups with rich content
 */
export const InteractivePopups: Story = {
  args: {
    geojson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [24.9384, 60.1699],
          },
          properties: {
            title: "Click me!",
            description: "This popup shows area information",
            areaCode: "demo-01",
            areaName: { en: "Demo Area", fi: "Demoalue" },
            areaSize: 1000,
            populationSize: 500000,
            "marker-color": "ff0000",
            "marker-size": "large",
          },
        },
      ],
    },
    zoom: 12,
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Click on markers to see popups with area information displayed.",
      },
    },
  },
};

/**
 * Comparison Story: Same data as LeafletMap for testing
 */
export const ComparisonWithLeaflet: Story = {
  args: {
    geojson: samplePointGeoJSON,
    zoom: 7,
    height: "600px",
    apiKey: "",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses the same sample data as LeafletMap stories for easy comparison between map libraries.",
      },
    },
  },
};
