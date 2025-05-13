"use client";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { FiUpload, FiSettings, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Updated import for App Router

export default function AnalysisPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    setUploadStatus('Uploading...');
    
    setTimeout(() => {
      setUploadStatus(`Successfully uploaded ${selectedFile.name}`);
      processCSV(selectedFile);
    }, 1500);
  };

  const processCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      console.log('CSV content:', content);
    };
    reader.readAsText(file);
  };

  const navigateToPage = (page) => {
    if (!selectedFile) return;
    router.push(`/analysis/${page}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="p-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            
            {/* File Upload Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Upload Sales Data</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  <FiUpload className="mr-2" />
                  Choose CSV File
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
                
                <button 
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedFile 
                      ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Upload
                </button>
                
                {selectedFile && (
                  <span className="text-sm text-gray-600 truncate max-w-xs">
                    Selected: {selectedFile.name}
                  </span>
                )}
              </div>
              
              {uploadStatus && (
                <p className={`mt-2 text-sm ${
                  uploadStatus.includes('Successfully') 
                    ? 'text-green-600' 
                    : uploadStatus.includes('Please') 
                      ? 'text-red-600' 
                      : 'text-blue-600'
                }`}>
                  {uploadStatus}
                </p>
              )}
            </div>

            {/* Analysis Tools Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Analysis Tools</h3>
              <p className="text-gray-600 mb-6">
                Upload pipe sales data to enable these analysis tools:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigateToPage('demand-forecasting')}
                  disabled={!selectedFile}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedFile 
                      ? 'border-gray-200 hover:bg-gray-50 cursor-pointer' 
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <h4 className="font-medium">Demand Forecasting</h4>
                  <p className="text-sm text-gray-500">
                    {selectedFile ? 'Predict future pipe sales' : 'Upload data to enable'}
                  </p>
                </button>
                
                <button 
                  onClick={() => navigateToPage('previous-data')}
                  disabled={!selectedFile}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedFile 
                      ? 'border-gray-200 hover:bg-gray-50 cursor-pointer' 
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <h4 className="font-medium">Previous Data</h4>
                  <p className="text-sm text-gray-500">
                    {selectedFile ? 'Look into previous sales' : 'Upload data to enable'}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}