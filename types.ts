
export interface LinkedInPost {
  headline: string;
  body: string;
  hashtags: string[];
}

export interface MediumArticle {
  title: string;
  body: string;
  takeaway: string;
}

export interface ArticleAnalysis {
  hypeScore: number; // 1-100
  impactScore: number; // 1-100
  prediction: string; // What happens next?
  technicalTerm: string; // A complex term from the article
  simpleDefinition: string; // ELI5 definition
}

export interface Article {
  title: string;
  date: string; // The date of the incident/article
  body: string; // A concise summary in Markdown
  imageUrl: string; // URL for a relevant image
  fallbackImageUrl: string; // Fast backup image from Unsplash
  sources: string[]; // Array of source URLs
  analysis: ArticleAnalysis;
  category: string; // The category of the news (e.g., Models, Policy)
}
