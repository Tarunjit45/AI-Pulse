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
  imageUrl: string | null; // FIX: Allowing null if the image fetch fails
  sources: string[]; // Array of source URLs
}