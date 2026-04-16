import React, { useState, useRef } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import Quiz from './Quiz';
import * as mammoth from 'mammoth';

function MainApp({ user, handleLogout }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [quizMode, setQuizMode] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ Updated startQuiz function with debugging
  const startQuiz = async () => {
    if (!selectedDoc) {
      alert("Please select a document first!");
      return;
    }

    // ✅ DEBUG LOGS - Check what content is being sent
    console.log('========== DEBUG START ==========');
    console.log('Selected document:', selectedDoc.name);
    console.log('Document type:', selectedDoc.type);
    console.log('Content length:', selectedDoc.content?.length);
    console.log('First 500 characters of content:');
    console.log(selectedDoc.content?.substring(0, 500));
    console.log('========== DEBUG END ==========');

    // ✅ Check if content is actually extracted text (not placeholder)
    if (!selectedDoc.content || 
        selectedDoc.content.includes('[PDF - will be processed') || 
        selectedDoc.content.includes('[Image document') ||
        selectedDoc.content.includes('[DOCX content - extraction failed]')) {
      alert("⚠️ This document doesn't have extractable text content!\n\nPlease upload:\n- A .txt file with text\n- A .docx file (Word document)\n\nPDFs and images are not supported for quiz generation yet.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: selectedDoc.content,
          documentName: selectedDoc.name
        })
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setQuizData(data);
      setQuizMode(true);
    } catch (err) {
      alert(`Failed to generate quiz: ${err.message}`);
      console.error(err);
    }
  };

  const exitQuiz = () => {
    setQuizMode(false);
    setQuizData(null);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        let content = '';
        let imageData = null;
        let rawFile = null;
        
        if (file.type === 'text/plain') {
          content = event.target.result;
        } else if (file.type === 'application/pdf') {
          const base64Data = btoa(
            new Uint8Array(event.target.result)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          rawFile = base64Data;
          content = '[PDF - will be processed on server]';
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          try {
            const arrayBuffer = event.target.result;
            const result = await mammoth.extractRawText({ arrayBuffer });
            content = result.value;
          } catch (err) {
            content = '[DOCX content - extraction failed]';
          }
        } else if (file.type.startsWith('image/')) {
          const base64Data = event.target.result.split(',')[1];
          imageData = base64Data;
          content = '[Image document - will be analyzed using vision]';
        }
        
        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          content,
          imageData,
          rawFile,
          type: file.type,
          uploadDate: new Date().toLocaleDateString()
        };
        
        setDocuments(prev => [...prev, newDoc]);
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
    
    e.target.value = '';
  };

  const handleDeleteDoc = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
      setMessages([]);
    }
  };

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    setMessages([]);
  };

  return (
    <div className="flex h-screen 50">
      {quizMode ? (
        <div className="flex-1 relative">
          <Quiz quizData={quizData} />
          <button
            onClick={exitQuiz}
            className="absolute top-4 right-4 z-50 px-4 py-2 bg-white-700 text-black rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Exit Quiz
          </button>
        </div>
      ) : (
        <>
          <Sidebar
            user={user}
            documents={documents}
            selectedDoc={selectedDoc}
            handleLogout={handleLogout}
            startQuiz={startQuiz}
            handleSelectDoc={handleSelectDoc}
            handleDeleteDoc={handleDeleteDoc}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
          />
          
          <ChatArea
            selectedDoc={selectedDoc}
            messages={messages}
            setMessages={setMessages}
            startQuiz={startQuiz} 
          />
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.pdf,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            onChange={handleFileUpload}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}

export default MainApp;