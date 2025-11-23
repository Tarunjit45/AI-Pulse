<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Pulse

AI Pulse is an intelligent assistant that automatically summarizes the latest AI trends and generates ready-to-publish posts for LinkedIn and Medium using the Google Gemini API.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/).

## Installation

1.  **Clone the repository** (or download the files) to your local machine.

2.  **Install dependencies**:
    Open your terminal in the project root directory and run:
    ```bash
    npm install
    ```

## Configuration

1.  Create a file named `.env` in the root directory.
2.  Add your Google Gemini API Key to this file:

    ```env
    API_KEY=your_actual_api_key_here
    ```

    > **Note:** Do not share your `.env` file or commit it to version control if you are using a public repository.

## Running the App

To start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

## Project Structure

- **`App.tsx`**: The main application component containing the state and layout logic.
- **`services/geminiService.ts`**: Handles interactions with the Google Gemini API (fetching news, generating posts).
- **`components/`**: Contains UI components like `ArticleCard`, `PostCard`, and `Modal`.
- **`types.ts`**: TypeScript definitions for articles and social posts.

## How to Update

### Modifying the UI
*   To change the styling, edit the Tailwind classes in the TSX files.
*   To change the layout, modify `App.tsx` or the specific component in the `components/` folder.

### Modifying the AI Behavior
*   To change how articles are found or summarized, edit the `systemInstruction` or prompts in `services/geminiService.ts`.
*   To change the output format of social posts, update the JSON schemas in `services/geminiService.ts` and the interfaces in `types.ts`.

## Technologies

- React 19
- TypeScript
- Tailwind CSS
- Google Gemini API (`@google/genai`)
- Vite (Build tool)
