import { Article } from '../types';

/**
 * Provides static, mocked data for development and testing environments.
 */
export const MOCK_ARTICLE_DATA: Article = {
    title: "Google Unveils Gemini 3.0: A Quantum Leap in Multimodal Reasoning",
    body: 
        "The recent launch of the Gemini 3.0 model marks a pivotal moment in AI development. This iteration features enhanced cross-modal integration, allowing it to seamlessly understand and reason across text, code, image, and video data with unprecedented coherence. The breakthrough lies in its new attention mechanism, which significantly improves the model's ability to maintain context over long, complex interactions. \n\n" +
        "Experts suggest this advance will redefine application development, particularly in fields requiring nuanced understanding, such as complex scientific research and large-scale data analysis. Initial benchmarks show Gemini 3.0 surpassing competitors in zero-shot reasoning tasks, setting a new industry standard for intelligence and flexibility.",
    imageUrl: "https://placehold.co/800x450/06b6d4/ffffff?text=AI+Quantum+Leap",
    sources: [
        "http://mocksource.com/gemini-3-unveil",
        "http://expertanalysis.com/next-gen-ai",
    ]
};

export const MOCK_LINKEDIN_POST = {
    headline: "🚀 Gemini 3.0 just dropped! Multimodal AI gets a serious upgrade.",
    body: "The new Gemini 3.0 model from Google is changing the game. Its unified attention mechanism enables seamless reasoning across text, code, images, and video. This isn't just an update; it's a paradigm shift for anyone working in complex data analysis and AI application development. Expect to see new, powerful tools very soon.",
    hashtags: ["#AI", "#Gemini3", "#MachineLearning", "#GoogleAI"]
};

export const MOCK_MEDIUM_ARTICLE = {
    title: "Decoding the Power of Gemini 3.0: What the Unified Attention Model Means for Developers",
    body: "The AI community is buzzing about Gemini 3.0, and for good reason. Its core innovation—the unified attention model—addresses one of the biggest challenges in AI: fragmented understanding. Instead of processing data types separately, Gemini 3.0 sees them as one continuous stream, leading to deeply coherent reasoning. \n\nThis means a developer can feed the model a screenshot of code, ask it to explain a related data visualization, and request a summary in plain language, all in one prompt. This level of cross-modal fluency opens up a universe of possibilities for enterprise solutions and specialized research tools.\n\nFor the average user, the impact will be seen in vastly improved, more reliable, and more 'human' conversational interfaces. The days of siloed AI capabilities are rapidly ending.",
    takeaway: "Gemini 3.0's multimodal reasoning is a game-changer. Developers must start experimenting with unified prompts now to stay ahead of the curve."
};