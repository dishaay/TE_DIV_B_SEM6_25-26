import React from 'react';
import { BookOpen, FileText, MessageSquare, Zap, Sparkles } from 'lucide-react';

function LandingPage({ setCurrentPage }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" size={32} />
          <span className="text-2xl font-bold text-gray-900">ExplainIt</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentPage('login')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Log in
          </button>
          <button
            onClick={() => setCurrentPage('signup')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Sign up
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Powered by Qwen AI
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Turn your documents into
          <span className="text-blue-600"> intelligent conversations</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Upload any document - handwritten notes, PDFs, or text files - and chat with it using AI. Get instant answers, summaries, and insights.
        </p>
        <button
          onClick={() => setCurrentPage('signup')}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium inline-flex items-center gap-2"
        >
          Get Started Free
          <Sparkles size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Any Document Type</h3>
          <p className="text-gray-600">
            Support for PDFs, Word docs, text files, and even handwritten notes through image upload.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <MessageSquare className="text-purple-600" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligent Chat</h3>
          <p className="text-gray-600">
            Ask questions naturally and get accurate answers based on your document's content.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Zap className="text-green-600" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
          <p className="text-gray-600">
            Powered by Qwen AI for instant, accurate responses to all your document questions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;