"use client";
import React, { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import rehypeHighlightCodeLines from "rehype-highlight-code-lines";
import "highlight.js/styles/obsidian.css";

interface PromptProps {
  params: { [key: string]: string };
}

const ollamaLocalChatEndpoint = "http://localhost:11434/api/chat";

export default function App({ params }: PromptProps): JSX.Element {
  const [content, setContent] = useState("");
  const [responseChunks, setResponseChunks] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("yi-coder:1.5b"); // Default model
  const [loading, setLoading] = useState(false);

  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch("http://localhost:11434/api/tags")
      .then((response) => response.json())
      .then((data) => setModels(data.models))
      .catch((error) => console.error(error));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseChunks([]); // Clear previous responses
    setLoading(true);

    try {
      const response = await fetch(ollamaLocalChatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content }],
          stream: true,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          lines.forEach((line) => {
            const messageData = JSON.parse(line);
            if (messageData && messageData.message) {
              setResponseChunks((prevChunks) => [
                ...prevChunks,
                messageData.message.content,
              ]);
            }
          });
        }
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error during request:", error);
      setResponseChunks(["An error occurred while generating the response"]);
    }
  };

  const output = `${responseChunks.join("")}`;
  return (
    <div
      className="h-screen flex flex-col bg-gray-200"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between p-2 bg-gray-300 border-b border-gray-400">
        <a className="text-black font-bold text-md">Predictive Prompt</a>
      </header>

      <div className="flex flex-row">
        <div className="w-1/4 bg-gray-100 border border-gray-400p-4">
          <select
            name="model-selector"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border border-gray-400 bg-white px-2 py-1 text-sm text-black border-transparent focus:border-gray-600 focus:outline-none focus:ring-0"
            style={{ margin: "10px" }}
          >
            {models.map((model: any) => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <main className="flex-grow px-4 py-4 overflow-y-auto bg-white border-t border-gray-400">
          <div className="mx-auto max-w-3xl bg-gray-100 border border-gray-400 p-4">
            {/* Response Output */}
            {loading && (
              <div className="bg-gray-100 flex flex-col w-full">
                <span className="text-orange-400 font-mono text-xl tracking-widest animate-pulse">
                  LOADING...
                </span>
                <div className="w-64 h-6 bg-red-700 border-2 border-red-500 relative overflow-hidden w-full">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 animate-retro-loading"></div>
                </div>
              </div>
            )}
            {
              <div className="bg-gray-100 p-2 border border-gray-400">
                {!responseChunks.length ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="h-2 bg-gray-200 w-[100px]"></div>
                  </div>
                ) : (
                  <div className="border-t border-gray-400 pt-4">
                    <h2 className="text-md font-bold text-black">Response:</h2>
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[
                        rehypeHighlight,
                        rehypeHighlightCodeLines,
                      ]}
                    >
                      {output}
                    </Markdown>
                  </div>
                )}
              </div>
            }

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-4 flex items-center space-x-2 border border-gray-400 p-2"
            >
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Type your message here..."
                className="flex-grow border border-gray-400 p-2 text-sm bg-white text-black resize-none border-transparent focus:border-gray-600 focus:outline-none focus:ring-0"
                style={{ height: "40px", fontFamily: "Arial, sans-serif" }}
              />

              <button
                type="submit"
                aria-label="Send Message"
                className="px-3 py-1 bg-gray-200 border border-gray-400 text-black hover:bg-gray-300"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                Send
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
