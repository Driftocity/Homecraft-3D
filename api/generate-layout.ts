/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { FURNITURE_CATALOG } from '../src/data/furnitureCatalog';

export default async function handler(req: any, res: any) {
  // Setup standard CORS and request methods
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API is not configured. Please define GEMINI_API_KEY in your Vercel Project Environment Variables.',
    });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const { prompt, width = 10, length = 10 } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A text prompt is required.' });
  }

  // Gather valid catalog IDs to give to Gemini
  const catalogIds = FURNITURE_CATALOG.map((item) => `'${item.id}'`).join(', ');
  const catalogDetails = FURNITURE_CATALOG.map(
    (item) => `- ${item.id}: ${item.name} (${item.description}, default dims: w:${item.defaultScale.x}m, h:${item.defaultScale.y}m, d:${item.defaultScale.z}m)`
  ).join('\n');

  // Define a bounding area for the room
  const halfW = width / 2;
  const halfL = length / 2;

  const systemInstruction = `You are a professional interior designer and residential architect.
The user wants to generate a room layout based on their prompt.
You must design a layout by specifying:
1. Floor material: Choose one of: 'hardwood', 'carpet', 'marble', 'tile', 'concrete'.
2. Floor color: An appropriate hex color matching the material and theme.
3. Walls: Create the outer boundary walls (a closed loop, typically a rectangle of size ${width}x${length} meters, centered at (0,0) so coordinates go from -${halfW} to ${halfW} on X, and -${halfL} to ${halfL} on Y). You can also add nice internal dividing walls.
4. Furniture placements: Choose furniture items from the following catalog IDs ONLY: [${catalogIds}].
Place items realistically inside the room bounds. Do not overlap furniture. Set realistic 3D coordinates (x, y, z) where:
- X is left/right (-${halfW} to ${halfW})
- Y is height off the floor (should be 0 for most floor items like sofas, beds, tables. Can be higher for items like painting/artwork hanging on a wall, or a lamp on a bedside table).
- Z is forward/back (-${halfL} to ${halfL})
- Rotation: angle in radians (0 to 6.28) around the vertical Y-axis. E.g. 0 faces east, 1.57 (PI/2) faces north, 3.14 faces west, 4.71 faces south.

Here is the catalog of available items:\n${catalogDetails}

Be creative! If the user asks for a 'Scandinavian living room', select a hardwood floor, light/beige floorColor, white walls, and include sofa_modern, coffee_table_wood, tv_stand_console, rug_area, and plant_house.
Place the TV stand against a wall, the sofa facing it, the coffee table on the rug in between, and plants/lamps in the corners.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Design a room with the following details:\nDescription: "${prompt}"\nTarget Dimensions: ${width}m width by ${length}m length.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: 'A beautiful, stylish name for this generated home layout.',
            },
            floorMaterial: {
              type: Type.STRING,
              description: 'Material type for the floor: hardwood, carpet, marble, tile, or concrete.',
            },
            floorColor: {
              type: Type.STRING,
              description: 'A hex color code representing the floor color.',
            },
            walls: {
              type: Type.ARRAY,
              description: 'Outer walls forming a closed loop, and optional interior walls.',
              items: {
                type: Type.OBJECT,
                properties: {
                  p1: {
                    type: Type.OBJECT,
                    description: 'Start point of the wall on the 2D floor grid (X, Y in meters).',
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                    },
                    required: ['x', 'y'],
                  },
                  p2: {
                    type: Type.OBJECT,
                    description: 'End point of the wall on the 2D floor grid (X, Y in meters).',
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                    },
                    required: ['x', 'y'],
                  },
                  color: {
                    type: Type.STRING,
                    description: 'Hex color code of this wall.',
                  },
                },
                required: ['p1', 'p2'],
              },
            },
            furniture: {
              type: Type.ARRAY,
              description: 'The placed furniture items.',
              items: {
                type: Type.OBJECT,
                properties: {
                  catalogId: {
                    type: Type.STRING,
                    description: 'The ID of the catalog item (must exactly match one of the available items).',
                  },
                  position: {
                    type: Type.OBJECT,
                    description: 'The 3D coordinate position in meters (X, Y, Z).',
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      z: { type: Type.NUMBER },
                    },
                    required: ['x', 'y', 'z'],
                  },
                  rotation: {
                    type: Type.NUMBER,
                    description: 'Rotation around Y-axis in radians (0 to 6.28).',
                  },
                  color: {
                    type: Type.STRING,
                    description: 'Custom hex color code override for this item.',
                  },
                },
                required: ['catalogId', 'position'],
              },
            },
          },
          required: ['projectName', 'floorMaterial', 'floorColor', 'walls', 'furniture'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsedData = JSON.parse(text);
    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error('Error generating layout with Gemini:', error);
    return res.status(500).json({
      error: 'Failed to generate layout.',
      details: error?.message || error,
    });
  }
}
