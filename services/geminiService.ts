
import { GoogleGenAI, Type } from "@google/genai";
import { Article, LinkedInPost, MediumArticle } from '../types';
import { withRetry } from './retryUtils';
import { getRandomMockArticle } from '../data/mock-articles';

const FALLBACK_IMAGES: Record<string, string> = {
  'Politics': 'https://images.unsplash.com/photo-1541872703-74c5963631df?auto=format&fit=crop&w=1024&q=80',
  'Geopolitics': 'https://images.unsplash.com/photo-1529101091760-6149d4c87b77?auto=format&fit=crop&w=1024&q=80',
  'Tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1024&q=80',
  'AI': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1024&q=80',
  'Business': 'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&w=1024&q=80',
  'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1024&q=80',
  'Entertainment': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1024&q=80',
  'India': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1024&q=80',
  'General': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1024&q=80'
};

/**
 * Helper to initialize AI client and validate API Key.
 * Throws a clear error if the key is missing from Vercel env vars.
 */
const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("Missing API Key. Please add 'API_KEY' to your Vercel Environment Variables and redeploy.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Core function to call API - Wrapped in retry logic elsewhere
 */
const fetchArticleFromApi = async (previousTitles: string[], region: string, category: string): Promise<Article> => {
    const regionInstruction = region === 'India' 
    ? "FOCUS STRICTLY ON NEWS FROM INDIA. Look for updates on Indian politics, cricket/sports, economy, technology startups, or major local events. If no major breaking Indian news exists today, find the most significant recent Indian story." 
    : "Focus on major GLOBAL news stories (US, Europe, Asia, etc).";

  const categoryInstruction = category !== 'All' 
    ? `FOCUS STRICTLY ON THE CATEGORY: "${category}".` 
    : "Select the most significant breaking news story across any category (Politics, War, Tech, Sports, etc).";

  const systemInstruction = `
    You are Pulse, an Elite Global News Analyst.
    Your mission is not just to summarize, but to ANALYZE the significance of global events.
    
    FILTERS:
    1. Region: ${region} (${regionInstruction})
    2. Category: ${category} (${categoryInstruction})

    Workflow:
    1.  Find a BREAKING or SIGNIFICANT news story from the last 24 hours fitting the filters. Avoid these titles if possible: ${JSON.stringify(previousTitles)}.
    2.  Summarize it concisely.
    3.  EXTRACT the exact DATE when the event occurred from the search results (e.g., "October 27, 2025"). Do not default to today unless it happened today.
    4.  ANALYZE it:
        - Determine a "Hype Score" (0 = Total Fluff, 100 = Historic/Viral).
        - Determine an "Impact Score" (0 = Niche, 100 = Global Change).
        - Predict the immediate future consequence.
        - "technicalTerm": Select the most important person, organization, place, or concept in the story.
        - "simpleDefinition": Explain who or what they are and why they are central to this story (Context).
    5.  Create a visual image description (max 5-7 words) for the story (e.g., "crowded parliament debate dramatic lighting", "cricket stadium packed night match", "futuristic AI robot neon").
    6.  List sources.
    7.  Assign the Category.

    Output MUST be a raw JSON object (no markdown formatting) matching this structure:
    {
      "title": "Headline",
      "date": "Month Day, Year", 
      "body": "2 paragraphs markdown summary.",
      "imagePrompt": "visual description for generative AI image",
      "sources": ["url1", "url2"],
      "category": "The Category",
      "analysis": {
        "hypeScore": 50,
        "impactScore": 80,
        "prediction": "One sentence prediction of what happens next.",
        "technicalTerm": "Key Entity/Term",
        "simpleDefinition": "Contextual explanation..."
      }
    }

    CRITICAL JSON FORMATTING RULES:
    1. Return ONLY the JSON object. Do not include Markdown code blocks (like \`\`\`json).
    2. Ensure the JSON is strictly valid.
    3. DO NOT use double quotes (") inside the content strings. Use single quotes (') instead for emphasis or direct speech. For example, write 'critical damage' instead of "critical damage".
    4. Escape all newlines in strings as \\n.
  `;
  
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', 
    contents: `Find the most important ${category} news story in ${region} right now and analyze it.`,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.7,
    },
  });

  // Fix: Handle potential undefined text response
  let jsonText = response.text ? response.text.trim() : '';
  
  // Clean markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(json)?\s*/, '').replace(/\s*```$/, '');
  }

  // Robust extraction: Find the first '{' and last '}'
  const startIndex = jsonText.indexOf('{');
  const endIndex = jsonText.lastIndexOf('}');
  
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    jsonText = jsonText.substring(startIndex, endIndex + 1);
  }

  let rawData;
  try {
    rawData = JSON.parse(jsonText);
  } catch (e) {
    throw new Error("Failed to parse AI response");
  }
  
  // Validate critical fields to prevent "Empty Card" crashes
  if (!rawData || !rawData.title || !rawData.body) {
      throw new Error("Received incomplete data from AI analyst.");
  }

  // Construct a reliable generative image URL
  // Clean the prompt to remove any stray characters or newlines
  const cleanPrompt = (rawData.imagePrompt || rawData.title).replace(/['"\n]/g, '').trim();
  const encodedPrompt = encodeURIComponent(`${cleanPrompt} editorial news photography 4k`);
  
  // Use a random seed to prevent caching issues
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true&seed=${Math.floor(Math.random() * 1000)}&model=flux`;

  // Determine fallback image based on category
  let fallbackCategory = rawData.category || category;
  if (region === 'India' && !FALLBACK_IMAGES[fallbackCategory]) fallbackCategory = 'India';
  const fallbackUrl = FALLBACK_IMAGES[fallbackCategory] || FALLBACK_IMAGES['General'];

  const article: Article = {
      ...rawData,
      imageUrl: imageUrl,
      fallbackImageUrl: fallbackUrl,
      date: rawData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      sources: rawData.sources || [],
      category: rawData.category || category || 'General'
  };
  
  // Extract grounding chunks for citations
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    const groundingUrls = groundingChunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string | undefined): uri is string => !!uri);
      
    if (groundingUrls.length > 0) {
      article.sources = Array.from(new Set([...(article.sources || []), ...groundingUrls]));
    }
  }
  
  return article;
}

/**
 * Generates a single summary article about the latest trends with Deep Analysis.
 * Uses retry logic, but catches Resource Exhausted errors to serve mock data.
 */
export const generateSingleArticle = async (
  previousTitles: string[] = [], 
  region: 'Global' | 'India' = 'Global',
  category: string = 'All'
): Promise<Article> => {
    try {
        // Decreased retries to 1 to avoid hammering a limited quota
        return await withRetry(() => fetchArticleFromApi(previousTitles, region, category), 1);
    } catch (error: any) {
        // Detect 429 Resource Exhausted or generic Quota errors
        const isQuotaError = 
            error.message?.includes('429') || 
            error.message?.includes('Quota') || 
            error.message?.includes('RESOURCE_EXHAUSTED') ||
            error.status === 429;
            
        if (isQuotaError) {
            console.warn("API Quota Exceeded. Switching to Backup Data Layer.");
            return getRandomMockArticle(category);
        }
        throw error;
    }
};

/**
 * Allows the user to chat with the specific news article.
 */
export const chatWithArticle = async (article: Article, userMessage: string, history: {role: string, content: string}[]): Promise<string> => {
    const systemInstruction = `
        You are an expert News Analyst discussing a specific story.
        
        The Article:
        Title: ${article.title}
        Date: ${article.date}
        Summary: ${article.body}
        Analysis: Hype ${article.analysis.hypeScore}/100, Impact ${article.analysis.impactScore}/100.
        Prediction: ${article.analysis.prediction}

        Your Goal: Answer the user's question about THIS article. Be insightful, critical, and concise.
        If the user asks "How does this affect me?", give a practical answer based on the news.
    `;
    
    const chatHistoryStr = history.map(h => `${h.role}: ${h.content}`).join('\n');
    
    const prompt = `
        ${chatHistoryStr}
        User: ${userMessage}
        Model:
    `;

    return withRetry(async () => {
        try {
            const ai = getAIClient();
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { systemInstruction }
            });
            // Fix: Handle undefined text response
            return response.text || '';
        } catch (error: any) {
             if (error.message?.includes('429') || error.status === 429) {
                 return "I'm currently offline due to high traffic (Quota Exceeded). Please try again tomorrow.";
             }
             throw error;
        }
    }, 1);
}

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
      headline: { type: Type.STRING, description: "A professional, engaging headline (max 150 chars)." },
      body: { type: Type.STRING, description: "Key points in 3-5 sentences." },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 relevant hashtags." },
    },
    required: ['headline', 'body', 'hashtags'],
  };

  const MEDIUM_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Compelling title." },
      body: { type: Type.STRING, description: "Full article body (3-5 paragraphs)." },
      takeaway: { type: Type.STRING, description: "A short concluding reflection." },
    },
    required: ['title', 'body', 'takeaway'],
  };

  const systemInstruction = `
    You are a professional social media content creator.
    Create a viral, high-value ${platform} post based on this news.
  `;

  const prompt = `
    Article: ${articleContent}
    Generate the ${platform} post.
  `;

  return withRetry(async () => {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: isLinkedIn ? LINKEDIN_SCHEMA : MEDIUM_SCHEMA,
        },
      });
      
      // Fix: Handle undefined text response
      const jsonText = response.text ? response.text.trim() : '';
      if (!jsonText) throw new Error("Empty response from AI");
      return JSON.parse(jsonText);
  }, 1);
};
