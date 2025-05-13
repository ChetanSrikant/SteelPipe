"use client";
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { FiArrowLeft, FiDownload, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function PreviousData() {
  const router = useRouter();
  
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FiArrowLeft className="text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold">Previous Sales Data</h2>
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FiDownload className="mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}