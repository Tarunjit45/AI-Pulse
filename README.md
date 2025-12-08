# AI Pulse 2.0

**AI Pulse** is a futuristic **News Intelligence Engine** designed to cut through the noise of modern media. It uses Google's Gemini 2.5 Flash model to curate, analyze, and visualize global and local news in real-time.

Unlike standard aggregators, AI Pulse doesn't just show you headlines—it quantifies their significance with **Hype vs. Impact scores**, allows you to **chat with articles** to understand deeper context, and instantly converts stories into viral social media content.

## 🚀 Key Features

### 1. 🌍 Active Intelligence Engine
*   **Global & Local Modes:** Seamlessly toggle between **Global Geopolitics** and **Indian Context** (Politics, Cricket, Startups).
*   **Multi-Category Support:** Covers Politics, Geopolitics, Tech, AI, Sports, Business, and Entertainment.
*   **The "Pulse" Metric:** Every article is analyzed for:
    *   **Hype Score:** Is this just marketing fluff?
    *   **Impact Score:** Will this change the world?
    *   **Prediction:** AI forecasts the immediate consequences.

### 2. 💬 Interactive News (RAG)
*   **Ask Question:** Don't just read—interact. Chat directly with any news story.
*   *Examples:* "How does this affect the stock market?" or "Explain this like I'm 5."

### 3. ✍️ Creator Tools
*   **One-Click Publishing:** Instantly turn any news summary into a:
    *   **LinkedIn Post:** Professional, with headlines and hashtags.
    *   **Medium Blog:** Structured takeaways and analysis.

### 4. 🎨 Immersive Experience
*   **Holographic UI:** "Deep Void" dark mode with neon glassmorphism.
*   **Generative Art:** Unique, AI-generated editorial imagery for every story (powered by Pollinations.ai).
*   **Audio Briefing:** Text-to-Speech integration for listening on the go.

---

## 🛠️ Local Setup Guide

Follow these steps to run the application on your local machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   A **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ai-pulse.git
    cd ai-pulse
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your API key:
    ```env
    API_KEY=your_actual_api_key_here
    ```

4.  **Run the App**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## 🏗️ Tech Stack

*   **Framework:** React (TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (Custom Animations, Glassmorphism)
*   **Intelligence:** Google Gemini API (`gemini-2.5-flash`) + Google Search Grounding
*   **Image Gen:** Pollinations.ai (Flux Model)

## 🤝 Contributing

1.  Fork the repo.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

*Engineered by Tarunjit Biswas*
