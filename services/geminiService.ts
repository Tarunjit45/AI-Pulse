
import { GoogleGenAI, Type } from "@google/genai";
import { Article, LinkedInPost, MediumArticle } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a single summary article about the latest trends with Deep Analysis.
 */
export const generateSingleArticle = async (
  previousTitles: string[] = [], 
  region: 'Global' | 'India' = 'Global',
  category: string = 'All'
): Promise<Article> => {
  
  const regionInstruction = region === 'India' 
    ? "FOCUS STRICTLY ON NEWS FROM INDIA. Look for updates on Indian politics, cricket/sports, economy, technology startups, or major local events. If no major breaking Indian news exists today, find the most significant recent Indian story." 
    : "Focus on major GLOBAL news stories (US, Europe, Asia, etc).";

  const categoryInstruction = category !== 'All' 
    ? `FOCUS STRICTLY ON THE CATEGORY: "${category}".` 
    : "Select the most significant breaking news story across any category (Politics, War, Tech, Sports, etc).";

  const systemInstruction = `
    You are Pulse, the world's most advanced AI News Analyst.
    Your mission is not just to summarize, but to ANALYZE the significance of global events.
    
    FILTERS:
    1. Region: ${region} (${regionInstruction})
    2. Category: ${category} (${categoryInstruction})

    Workflow:
    1.  Find a BREAKING or SIGNIFICANT news story from the last 24 hours fitting the filters. Avoid: ${JSON.stringify(previousTitles)}.
    2.  Summarize it concisely.
    3.  ANALYZE it:
        - Determine a "Hype Score" (0 = Total Fluff, 100 = Historic/Viral).
        - Determine an "Impact Score" (0 = Niche, 100 = Global Change).
        - Predict the immediate future consequence.
        - "technicalTerm": Select the most important person, organization, place, or concept in the story.
        - "simpleDefinition": Explain who or what they are and why they are central to this story (Context).
    4.  Create a visual image description (max 5-7 words) for the story (e.g., "crowded parliament debate dramatic lighting", "cricket stadium packed night match", "futuristic AI robot neon").
    5.  List sources.
    6.  Assign the Category.

    Output MUST be a raw JSON object (no markdown formatting) matching this structure:
    {
      "title": "Headline",
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
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', 
    contents: `Find the most important ${category} news story in ${region} right now and analyze it.`,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.7,
    },
  });

  let jsonText = response.text.trim();
  
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

  try {
    const rawData = JSON.parse(jsonText);
    
    // Construct a reliable generative image URL
    // We add 'cinematic, 4k' to ensure high quality aesthetics
    // Use the raw image prompt from the AI for best variety
    const encodedPrompt = encodeURIComponent(`${rawData.imagePrompt || rawData.title} cinematic photography 4k`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true&seed=${Math.floor(Math.random() * 1000)}&model=flux`;

    const article: Article = {
        ...rawData,
        imageUrl: imageUrl,
        sources: rawData.sources || [],
        category: rawData.category || category || 'General'
    };
    
    // Extract grounding chunks
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
  } catch (e) {
    console.error("Failed to parse article JSON:", jsonText);
    // Fallback logic
    throw new Error(`The AI returned an invalid format for the article feed.`);
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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction }
    });

    return response.text;
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
