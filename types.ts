
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

export interface Source {
  title: string;
  url: string;
}

export interface NewsItem {
  linkedinPost: LinkedInPost;
  mediumArticle: MediumArticle;
  source: Source;
}
