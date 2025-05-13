"use client";
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { FiArrowLeft, FiDownload, FiFilter, FiRefreshCw, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function DemandForecasting() {
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiArrowLeft className="text-gray-600" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">Demand Forecasting</h2>
                  <p className="text-sm text-gray-500">Predict future product demand based on historical data</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FiDownload className="mr-2" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
              
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Forecast Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium flex items-center">
                      <FiBarChart2 className="mr-2 text-blue-500" />
                      Demand Forecast
                    </h4>
                    <select className="text-sm p-1 border border-gray-200 rounded">
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                    </select>
                  </div>
                  <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                    <p className="text-gray-400">[graph 1 here]</p>
                  </div>
                </div>
                
                {/* Comparison Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium flex items-center">
                      <FiBarChart2 className="mr-2 text-green-500" />
                      Actual vs Forecast
                    </h4>
                    <select className="text-sm p-1 border border-gray-200 rounded">
                      <option>Months</option>
                      <option>Weeks</option>
                    </select>
                  </div>
                  <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                    <p className="text-gray-400">[graph 2 here]</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Detailed Forecast Data</h3>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}