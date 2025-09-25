import { GoogleGenAI, Type } from "@google/genai";
import type { CourseOutline } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const courseOutlineSchema = {
    type: Type.OBJECT,
    properties: {
        courseTitle: {
            type: Type.STRING,
            description: "A compelling and SEO-friendly title for the course."
        },
        courseDescription: {
            type: Type.STRING,
            description: "A brief, one-paragraph summary of what the course covers and who it's for."
        },
        modules: {
            type: Type.ARRAY,
            description: "An array of modules, representing the main sections of the course.",
            items: {
                type: Type.OBJECT,
                properties: {
                    moduleTitle: {
                        type: Type.STRING,
                        description: "The title of a single module."
                    },
                    lessons: {
                        type: Type.ARRAY,
                        description: "An array of lesson titles within this module.",
                        items: {
                            type: Type.STRING,
                        }
                    }
                },
                required: ["moduleTitle", "lessons"]
            }
        }
    },
    required: ["courseTitle", "courseDescription", "modules"]
};

// Define a function type to avoid ambiguous syntax that might be parsed as JSX
type GenerateCourseOutlineFn = (topic: string) => Promise<CourseOutline>;

export const generateCourseOutline: GenerateCourseOutlineFn = async (topic) => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a detailed course outline for a course on the topic: "${topic}". The outline should include a course title, a brief description, and several modules, each with a list of lesson titles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: courseOutlineSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson;

  } catch (error) {
    console.error("Error generating course outline from Gemini:", error);
    throw new Error("Failed to generate course outline. Please check the topic or try again later.");
  }
};