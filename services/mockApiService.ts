import { Article, LinkedInPost, MediumArticle } from '../types';
import { MOCK_ARTICLE_DATA, MOCK_LINKEDIN_POST, MOCK_MEDIUM_ARTICLE } from '../data/mockarticle';

/**
 * Simulates the secure API call to generate a single article.
 * Uses a fixed delay to mimic network latency.
 */
export const generateSingleArticleMock = (previousTitles: string[] = []): Promise<Article> => {
    return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
            // Check if the mock article title is already in the list
            if (previousTitles.includes(MOCK_ARTICLE_DATA.title)) {
                // If it is, return a slightly different (second) mock article
                resolve({
                    ...MOCK_ARTICLE_DATA,
                    title: "AI Regulation on the Horizon: EU Passes Historic AI Act",
                    imageUrl: "https://placehold.co/800x450/0d9488/ffffff?text=AI+Regulation",
                    body: "The European Union has officially passed the landmark AI Act, establishing the world's first comprehensive legal framework for artificial intelligence. The regulation categorizes AI systems based on their risk level, with strict rules for high-risk applications like policing and critical infrastructure. The goal is to foster innovation while ensuring ethical use and consumer safety.\n\nThis act sets a precedent globally and is expected to influence legislation in other major economies. Companies deploying AI in the EU will face new compliance burdens, particularly around data transparency and governance, signaling a new era of accountability in the technology sector.",
                });
            } else {
                // Otherwise, return the main mock article
                resolve(MOCK_ARTICLE_DATA);
            }
        }, 1000); // 1 second mock latency
    });
};

/**
 * Simulates the secure API call to generate a social media post.
 * Uses a fixed delay and returns canned mock data.
 */
export const generateSocialPostMock = (
    articleContent: string,
    platform: 'LinkedIn' | 'Medium'
): Promise<LinkedInPost | MediumArticle> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (platform === 'LinkedIn') {
                resolve(MOCK_LINKEDIN_POST);
            } else {
                resolve(MOCK_MEDIUM_ARTICLE);
            }
        }, 1500); // 1.5 seconds mock latency
    });
};