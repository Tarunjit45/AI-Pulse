import { GoogleGenAI, Type } from "@google/genai";
import { Article, LinkedInPost, MediumArticle } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a single summary article about the latest AI trends.
 */
export const generateSingleArticle = async (previousTitles: string[] = []): Promise<Article> => {
  const systemInstruction = `
    You are AI Pulse, an expert AI journalist and content curator.
    Your mission is to find the single most important, groundbreaking, and recent news article in the world of Artificial Intelligence using Google Search.
    
    Your workflow:
    1.  Find a significant, distinct AI news story from the last 24-48 hours. If possible, do not use any of the following topics/titles: ${JSON.stringify(previousTitles)}.
    2.  Write a clear, compelling title for the story.
    3.  Write a concise, 2-paragraph summary of the news in Markdown format.
    4.  Find a URL for a high-quality, relevant, free-to-use stock image (e.g., from Unsplash, Pexels, Pixabay) that relates to the article's content.
    5.  List the original source URLs you used for your research.

    Your final output MUST be a single, valid JSON object. Do not include any other text, commentary, or markdown formatting around the JSON object.
    Each object must follow this exact structure:
    {
      "title": "The article title",
      "body": "The 2-paragraph summary in Markdown format.",
      "imageUrl": "The URL of the stock image.",
      "sources": ["http://source-url-1.com", "http://source-url-2.com"]
    }
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Use flash for faster generation in the swipe-based UI
    contents: "Find and summarize one important AI news story from the last couple of days.",
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.8,
    },
  });

  const jsonText = response.text.trim().replace(/```json|```/g, '');

  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse article JSON:", jsonText);
    throw new Error(`The AI returned an invalid format for the article feed.`);
  }
};

/**
 * Generates a social media post based on the main article content.
 */
export const generateSocialPost = async (
  articleContent: string,
  platform: 'LinkedIn' | 'Medium'
): Promise<LinkedInPost | MediumArticle> => {
  const isLinkedIn = platform === 'LinkedIn';

  const LINKEDIN_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING, description: "A professional, engaging headline for the post (max 150 characters)." },
      body: { type: Type.STRING, description: "The main content of the post, summarizing the key points in 3-5 sentences." },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 relevant hashtags (e.g., '#AI')." },
    },
    required: ['headline', 'body', 'hashtags'],
  };

  const MEDIUM_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A clear and compelling title for the Medium article." },
      body: { type: Type.STRING, description: "The full article body, written in an informative, human-like tone (3-5 short paragraphs)." },
      takeaway: { type: Type.STRING, description: "A short, concluding 'Takeaway' or reflection." },
    },
    required: ['title', 'body', 'takeaway'],
  };

  const systemInstruction = `
    You are a professional social media content creator.
    Based on the provided article text, create a perfectly formatted ${platform} post.
    Adhere strictly to the provided JSON schema for your response.
    Your entire response MUST be a single valid JSON object matching the schema. Do not include any other text or markdown.
  `;

  const prompt = `
    Here is the article to base your post on:
    ---
    ${articleContent}
    ---
    Now, generate the ${platform} post content.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: isLinkedIn ? LINKEDIN_SCHEMA : MEDIUM_SCHEMA,
    },
  });
  
  const jsonText = response.text.trim();
  
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse social post JSON:", jsonText);
    throw new Error(`The AI returned an invalid format for the ${platform} post.`);
  }
};
