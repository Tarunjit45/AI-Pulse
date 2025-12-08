
import { GoogleGenAI, Type } from "@google/genai";
import { Article, LinkedInPost, MediumArticle } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a single summary article about the latest AI trends with Deep Analysis.
 */
export const generateSingleArticle = async (
  previousTitles: string[] = [], 
  region: 'Global' | 'India' = 'Global',
  category: string = 'All'
): Promise<Article> => {
  
  const regionInstruction = region === 'India' 
    ? "FOCUS STRICTLY ON AI NEWS FROM INDIA. Look for updates from Indian startups (like Sarvam AI, Krutrim, Hanooman), Indian government policies (MeitY, AI Mission), or major AI deployments by Indian enterprises (Infosys, TCS, Reliance). If no major breaking Indian news exists today, find the most significant recent Indian AI story." 
    : "Focus on major GLOBAL AI news.";

  const categoryInstruction = category !== 'All' 
    ? `FOCUS STRICTLY ON THE CATEGORY: "${category}". Find news related to ${category} (e.g., if 'Policy', look for regulation/laws; if 'Hardware', look for chips/GPUs).` 
    : "Select the most significant story across any category.";

  const systemInstruction = `
    You are AI Pulse, the world's most advanced AI trend analyst.
    Your mission is not just to summarize, but to ANALYZE the significance of AI news.
    
    FILTERS:
    1. Region: ${region} (${regionInstruction})
    2. Category: ${category} (${categoryInstruction})

    Workflow:
    1.  Find a BREAKING or SIGNIFICANT AI news story from the last 24-48 hours fitting the filters. Avoid: ${JSON.stringify(previousTitles)}.
    2.  Summarize it concisely.
    3.  ANALYZE it:
        - Determine a "Hype Score" (0 = Total Fluff, 100 = Earth Shattering).
        - Determine an "Impact Score" (0 = Niche, 100 = Global Change).
        - Predict the immediate future consequence.
        - Pick one technical term from the story and define it simply (ELI5).
    4.  Create a visual image description (max 5-7 words) for the story (e.g., "cyberpunk robot reading newspaper neon city").
    5.  List sources.
    6.  Assign a generic Category (e.g., 'Models', 'Business', 'Policy', 'Hardware', 'Science').

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
        "technicalTerm": "Transformer",
        "simpleDefinition": "A type of neural network that learns context..."
      }
    }

    CRITICAL JSON FORMATTING RULES:
    1. Return ONLY the JSON object. Do not include Markdown code blocks (like \`\`\`json).
    2. Ensure the JSON is strictly valid.
    3. ESCAPE ALL DOUBLE QUOTES inside string values. For example, use \\"text\\" instead of "text".
    4. Escape all newlines in strings as \\n.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', 
    contents: `Find the most important ${category} AI news story in ${region} right now and analyze it.`,
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

  try {
    const rawData = JSON.parse(jsonText);
    
    // Construct a reliable generative image URL
    // We add 'cinematic lighting, hyperrealistic, 8k' to ensure high quality aesthetics
    // If region is India, we add visual context for that too
    const regionContext = region === 'India' ? 'Indian context futuristic ' : '';
    const encodedPrompt = encodeURIComponent(`${regionContext}${rawData.imagePrompt || rawData.title} cinematic tech futuristic`);
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
        You are an expert AI Analyst discussing a specific news article.
        
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
