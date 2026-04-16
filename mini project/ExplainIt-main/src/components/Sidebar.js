import React from 'react';
import { BookOpen, Upload, FileText, Trash2 } from 'lucide-react';

function Sidebar({
  user,
  documents,
  selectedDoc,
  handleLogout,
  handleSelectDoc,
  handleDeleteDoc,
  fileInputRef
}) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={24} />
            <h1 className="text-xl font-semibold text-gray-900">ExplainIt</h1>
          </div>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          style={{ border: 'none' }}
        >
          <Upload size={18} />
          Upload Documents
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-3">Your Sources</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8">
            No documents uploaded yet
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div
                key={doc.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id
                    ? 'bg-blue-50 border border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => handleSelectDoc(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <FileText size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">{doc.uploadDate}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDoc(doc.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;