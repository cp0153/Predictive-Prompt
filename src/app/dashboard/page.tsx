'use client'
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';


const models = [
  { value: 'codegemma:latest', label: 'CodeGemma: Latest' },
  { value: 'reflection:latest', label: 'Reflection: Latest' },
  { value: 'yi-coder:1.5b', label: 'YI-Coder 1.5b' },
  { value: 'yi-coder:latest', label: 'YI-Coder: Latest' },
  { value: 'llama3.1:70b', label: 'Llama 3.1: 70B' },
  { value: 'dolphin-mistral:latest', label: 'Dolphin Mistral: Latest' },
  { value: 'gemma2:9b', label: 'Gemma 2: 9B' },
  { value: 'command-r:latest', label: 'Command-R: Latest' },
  { value: 'phi3:14b', label: 'Phi 3: 14B' },
  { value: 'mistral-nemo:latest', label: 'Mistral-Nemo: Latest' },
  { value: 'dolphin-phi:latest', label: 'Dolphin Phi: Latest' },
  { value: 'dolphin-llama3:8b', label: 'Dolphin Llama 3: 8B' },
  { value: 'llava:34b', label: 'LLaVA: 34B' },
  { value: 'gemma2:27b', label: 'Gemma 2: 27B' },
  { value: 'dolphin-mixtral:8x7b', label: 'Dolphin Mixtral: 8x7B' },
  { value: 'stable-code:3b-code-q4_0', label: 'StableCode: 3B Code Q4_0' },
  { value: 'llama3.1:latest', label: 'Llama 3.1: Latest' }
];

interface PromptProps {
  params: { [key: string]: string };
}

const ollamaLocal = 'http://localhost:11434/api/chat';

export default function App({ params }: PromptProps): JSX.Element {
  const [content, setContent] = useState('');
  const [responseChunks, setResponseChunks] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('yi-coder:1.5b'); // Default model

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseChunks([]); // Clear previous responses

    try {
      const response = await fetch(ollamaLocal, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content }],
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
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');

          lines.forEach((line) => {
            const messageData = JSON.parse(line);
            if (messageData && messageData.message) {
              setResponseChunks((prevChunks) => [...prevChunks, messageData.message.content]);
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error during request:', error);
      setResponseChunks(['An error occurred while generating the response']);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Predictive Prompt</h1>
      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full rounded border bg-white px-3 py-2 text-sm shadow placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 focus:border-blue-600 focus:ring focus:ring-blue-200 dark:focus:border-blue-600"
          >
            {models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Enter a prompt..."
            className="w-full rounded border bg-white px-3 py-2 text-sm shadow placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 focus:border-blue-600 focus:ring focus:ring-blue-200 dark:focus:border-blue-600"
          />
          <button
            type="submit"
            className="block w-full rounded bg-blue-700 px-3 py-2 text-center text-sm font-medium uppercase leading-tight text-white shadow hover:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300 dark:border-gray-600 dark:hover:bg-blue-600 dark:focus:ring-blue-500"
          >
            Generate Response
          </button>
        </form>

        <div className="mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
          {!responseChunks.length ? (
            <div className="mt-12 rounded bg-gray-300 px-4 py-2 text-center dark:bg-gray-700 animate-pulse">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 "></div>
            </div>
          ) : (
            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Response:</h2>
              <Markdown>{responseChunks.join('')}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
