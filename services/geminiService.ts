
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from '../types';

// The schema definitions are kept for documentation and clarity, but are not passed to the API call.
const NEWS_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    linkedinPost: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING, description: "A catchy headline for the LinkedIn post." },
        body: { type: Type.STRING, description: "The main content of the LinkedIn post, 3-5 sentences." },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of 3-5 relevant hashtags, starting with #."
        },
      },
      required: ['headline', 'body', 'hashtags'],
    },
    mediumArticle: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A clear and engaging title for the Medium article." },
        body: { type: Type.STRING, description: "The article body, 3-5 short paragraphs (approx. 250-400 words)." },
        takeaway: { type: Type.STRING, description: "A concluding short takeaway or reflection." },
      },
      required: ['title', 'body', 'takeaway'],
    },
    source: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the original news source article." },
            url: { type: Type.STRING, description: "The URL of the original news source." }
        },
        required: ['title', 'url'],
    }
  },
  required: ['linkedinPost', 'mediumArticle', 'source'],
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateContentFromPrompt = async (
  prompt: string,
  setStatus: (message: string) => void
): Promise<NewsItem[]> => {
  const systemInstruction = `
    You are AI Pulse, an intelligent AI news and content automation assistant.
    Your mission is to stay up-to-date with the latest developments in Artificial Intelligence and automatically create engaging, high-quality posts for LinkedIn and Medium.
    Your workflow is as follows:
    1. Use your knowledge and real-time data from Google Search to find the most recent and relevant news based on the user's prompt. For prompts like "today's updates" or "daily digest", find 3-5 trending topics. For "weekly report", analyze trends across several stories.
    2. For each distinct news item found, analyze the content, extract the core innovation, and understand why it matters.
    3. Generate two formatted versions of content for each news item: a LinkedIn Post and a Medium Article.
    4. LinkedIn Post Requirements: A professional, engaging tone. Start with a hook/headline. Summarize the news in 3-5 sentences. End with a question or call-to-action. Include 3-5 relevant hashtags (e.g., #AI, #MachineLearning).
    5. Medium Article Requirements: A clear title. Write 3-5 short paragraphs (approx. 250-400 words total). Use a balanced, human-like tone—informative but not robotic. Conclude with a short "Takeaway" or reflection.
    6. Citation: You MUST find and include the original source URL and title for every single news item. Populate this in the 'source' object in the JSON. This is non-negotiable.
    7. Final Output: Your entire response MUST be a single valid JSON array of news item objects. Do not include any other text, markdown formatting (like \`\`\`json), or introductory commentary outside of the JSON structure. The JSON structure should be: [{"linkedinPost": {"headline": "...", "body": "...", "hashtags": ["..."]}, "mediumArticle": {"title": "...", "body": "...", "takeaway": "..."}, "source": {"title": "...", "url": "..."}}]
  `;

  setStatus('Searching for the latest AI news...');
  
  const model = ai.models.generateContent;

  const response = await model({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 32768 },
          temperature: 0.5,
      },
  });

  setStatus('Analyzing news and drafting posts...');
  const rawText = response.text.trim();
  let jsonText = rawText;

  // Handle cases where the response might be wrapped in markdown
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.substring(7, jsonText.length - 3).trim();
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.substring(3, jsonText.length - 3).trim();
  }
  
  try {
    const parsedResponse: NewsItem[] = JSON.parse(jsonText);
    if (!Array.isArray(parsedResponse)) {
      throw new Error("API response is not an array.");
    }
    // A quick validation of the first item's structure
    if (parsedResponse.length > 0 && (!parsedResponse[0].linkedinPost || !parsedResponse[0].source)) {
       throw new Error("Parsed JSON has an incorrect structure.");
    }
    return parsedResponse;
  } catch(e) {
    console.error("Failed to parse JSON response:", rawText);
    throw new Error(`The AI returned an invalid format. Please try rephrasing your request. Details: ${(e as Error).message}`);
  }
};
