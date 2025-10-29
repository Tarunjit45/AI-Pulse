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

export interface Article {
  title: string;
  body: string; // A concise summary in Markdown
  imageUrl: string; // URL for a relevant image
  sources: string[]; // Array of source URLs
}
