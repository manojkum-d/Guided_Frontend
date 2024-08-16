import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const Ai = () => {
  const location = useLocation();
  const message = location.state?.message || "";
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const MODEL_NAME = "gemini-1.0-pro";
  const API_KEY = "AIzaSyCz8-Id1qzaF6JIhCoC3zPv2p7lMh6IqPQ"; // Replace with your actual API key

  useEffect(() => {
    const runChat = async () => {
      if (!message || !API_KEY) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        };

        const safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ];

        const chat = model.startChat({
          generationConfig,
          safetySettings,
          history: [],
        });

        const result = await chat.sendMessage(message);
        const generatedResponse = result.response.text();
        const cleanedResponse = generatedResponse.replace(/\*+/g, ""); // Remove stars
        setResponse(cleanedResponse);
      } catch (err) {
        console.error("Error generating response:", err);
        setError("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    runChat();
  }, [message, API_KEY, MODEL_NAME]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">AI Component</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="mb-4 text-gray-800">Your Message: {message}</p>
        <p className="mb-4 text-gray-800">AI Response:</p>
        <div className="bg-white p-4 rounded-lg shadow-md">
          {loading ? (
            <p className="text-blue-500">Generating response...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : response ? (
            <div className="chat-response">
              <p style={{ color: "black" }}>{response}</p>
            </div>
          ) : (
            <p className="text-gray-500">Enter a message to get a response.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ai;
