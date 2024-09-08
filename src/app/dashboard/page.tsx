"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Markdown from "react-markdown";

const models = [
  { value: "codegemma:latest", label: "CodeGemma: Latest" },
  { value: "reflection:latest", label: "Reflection: Latest" },
  { value: "yi-coder:1.5b", label: "YI-Coder 1.5b" },
  { value: "yi-coder:latest", label: "YI-Coder: Latest" },
  { value: "llama3.1:70b", label: "Llama 3.1: 70B" },
  { value: "dolphin-mistral:latest", label: "Dolphin Mistral: Latest" },
  { value: "gemma2:9b", label: "Gemma 2: 9B" },
  { value: "command-r:latest", label: "Command-R: Latest" },
  { value: "phi3:14b", label: "Phi 3: 14B" },
  { value: "mistral-nemo:latest", label: "Mistral-Nemo: Latest" },
  { value: "dolphin-phi:latest", label: "Dolphin Phi: Latest" },
  { value: "dolphin-llama3:8b", label: "Dolphin Llama 3: 8B" },
  { value: "llava:34b", label: "LLaVA: 34B" },
  { value: "gemma2:27b", label: "Gemma 2: 27B" },
  { value: "dolphin-mixtral:8x7b", label: "Dolphin Mixtral: 8x7B" },
  { value: "stable-code:3b-code-q4_0", label: "StableCode: 3B Code Q4_0" },
  { value: "llama3.1:latest", label: "Llama 3.1: Latest" },
];

interface PromptProps {
  params: { [key: string]: string };
}

const ollamaLocal = "http://localhost:11434/api/chat";

export default function App({ params }: PromptProps): JSX.Element {
  const [content, setContent] = useState("");
  const [responseChunks, setResponseChunks] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("yi-coder:1.5b"); // Default model

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseChunks([]); // Clear previous responses

    try {
      const response = await fetch(ollamaLocal, {
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
      }
    } catch (error: any) {
      console.error("Error during request:", error);
      setResponseChunks(["An error occurred while generating the response"]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-200" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between p-2 bg-gray-300 border-b border-gray-400">
        <a className="text-black font-bold text-md">Predictive Prompt</a>
      </header>
  
      {/* Model Selector */}
      <select
        name="model-selector"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="border border-gray-400 bg-white px-2 py-1 text-sm text-black"
        style={{ margin: '10px' }}
      >
        {models.map((model) => (
          <option key={model.value} value={model.value}>
            {model.label}
          </option>
        ))}
      </select>
  
      {/* Main Content Area */}
      <main className="flex-grow px-4 py-4 overflow-y-auto bg-white border-t border-gray-400">
        <div className="mx-auto max-w-3xl bg-gray-100 border border-gray-400 p-4">
          {/* Response Output */}
          <div className="bg-gray-100 p-2 border border-gray-400">
            {!responseChunks.length ? (
              <div className="flex items-center justify-center h-24">
                <div className="h-2 bg-gray-200 w-[100px]"></div>
              </div>
            ) : (
              <div className="border-t border-gray-400 pt-4">
                <h2 className="text-md font-bold text-black">Response:</h2>
                <Markdown>{responseChunks.join("")}</Markdown>
              </div>
            )}
          </div>
  
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2 border border-gray-400 p-2">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Type your message here..."
              className="flex-grow border border-gray-400 p-2 text-sm bg-white text-black resize-none"
              style={{ height: '40px', fontFamily: 'Arial, sans-serif' }}
            />
  
            <button
              type="submit"
              aria-label="Send Message"
              className="px-3 py-1 bg-gray-200 border border-gray-400 text-black hover:bg-gray-300"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
  
}
