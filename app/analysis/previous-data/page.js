"use client";
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Removed: import DataTable from '@/app/components/DataTable'; // No longer needed

const API_BASE_URL = 'https://03615f876e54.ngrok-free.app';

const apiClient = {
  getPipeOptions: async () => {
    const response = await fetch(`${API_BASE_URL}/generate_forecast_MPL`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
      },
    });

    if (!response.ok) {
      const errorContent = await response.text();
      console.error("Backend error response (getPipeOptions):", errorContent);
      throw new Error(`Failed to fetch pipe options: Server responded with status ${response.status}. Content: ${errorContent.substring(0, 200)}...`);
    }

    try {
      return await response.json();
    } catch (jsonError) {
      const rawContent = await response.text();
      console.error("Failed to parse JSON for getPipeOptions. Raw content:", rawContent);
      throw new Error(`Invalid JSON response for pipe options. Raw content starts with: "${rawContent.substring(0, 100)}..."`);
    }
  },
  generateForecast: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/forecast`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': '69420',
      },
    });

    if (!response.ok) {
      const errorContent = await response.text();
      console.error("Backend error response (generateForecast):", errorContent);
      try {
        const errorData = JSON.parse(errorContent);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      } catch (e) {
        throw new Error(`Server responded with status ${response.status}. Content: ${errorContent.substring(0, 200)}...`);
      }
    }

    try {
      return await response.json();
    } catch (jsonError) {
      const rawContent = await response.text();
      console.error("Failed to parse JSON for generateForecast. Raw content:", rawContent);
      throw new Error(`Invalid JSON response for forecast. Raw content starts with: "${rawContent.substring(0, 100)}..."`);
    }
  },
};

export default function AnalysisPage() {
  const router = useRouter();
  const [pipeOptions, setPipeOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  const [forecastSettings, setForecastSettings] = useState({
    aggregation: 'Monthly',
    pipeType: '',
    num_months: 4,
    pipesize: [],
  });

  const [availableSizes, setAvailableSizes] = useState([]);
  const [fig1Data, setFig1Data] = useState(null);
  const [fig2Data, setFig2Data] = useState(null);
  const [forecastTableData, setForecastTableData] = useState(null);
  // Removed: const [displayTables, setDisplayTables] = useState([]); // No longer needed

  useEffect(() => {
    const loadPipeOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getPipeOptions();
        setPipeOptions(data);
      } catch (err) {
        setError(`Error loading pipe options: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadPipeOptions();
  }, []);

  useEffect(() => {
    if (pipeOptions && forecastSettings.pipeType) {
      const sizes = pipeOptions.pipe_type_to_sizes[forecastSettings.pipeType] || [];
      setAvailableSizes(sizes);
      setForecastSettings(prev => ({ ...prev, pipesize: [] }));
    } else {
      setAvailableSizes([]);
      setForecastSettings(prev => ({ ...prev, pipesize: [] }));
    }
  }, [forecastSettings.pipeType, pipeOptions]);

  const handleSettingChange = useCallback((setting, value) => {
    setForecastSettings(prevSettings => {
      const newSettings = { ...prevSettings, [setting]: value };

      if (setting === 'aggregation') {
        const maxPeriod = value === 'Weekly' ? 16 : 4;
        newSettings.num_months = Math.min(newSettings.num_months, maxPeriod);
      }
      return newSettings;
    });
  }, []);

  const handleSizeSelection = useCallback((size) => {
    setForecastSettings(prevSettings => {
      let newSizes;
      if (size === 'All') {
        // If "All" is selected and all sizes are already selected, deselect all
        // Otherwise select all available sizes
        const allSelected = availableSizes.every(s => prevSettings.pipesize.includes(s));
        newSizes = allSelected ? [] : [...availableSizes];
      } else {
        // Toggle the selected size
        if (prevSettings.pipesize.includes(size)) {
          newSizes = prevSettings.pipesize.filter(s => s !== size);
        } else {
          newSizes = [...prevSettings.pipesize, size];
        }
      }
      return { ...prevSettings, pipesize: newSizes };
    });
  }, [availableSizes]);

  const getMaxForecastPeriod = useCallback(() => {
    return forecastSettings.aggregation === 'Weekly' ? 16 : 4;
  }, [forecastSettings.aggregation]);

  const generateForecast = async () => {
    if (!forecastSettings.pipeType || forecastSettings.pipesize.length === 0) {
      setError('Please select both pipe type and at least one pipe size before generating a forecast.');
      return;
    }

    setLoading(true);
    setError(null);
    setFig1Data(null);
    setFig2Data(null);
    setForecastTableData(null);
    // Removed: setDisplayTables([]); // No longer needed

    try {
      const formData = new FormData();
      formData.append('aggregation', forecastSettings.aggregation);
      formData.append('pipeType', forecastSettings.pipeType);
      formData.append('num_months', forecastSettings.num_months.toString());
      formData.append('pipesize', forecastSettings.pipesize.join(','));

      const data = await apiClient.generateForecast(formData);

      const { fig1_dict, fig2_dict, forecast_dict } = data;

      setFig1Data(fig1_dict);
      setFig2Data(fig2_dict);
      setForecastTableData(forecast_dict);

      // Removed DataTable preparation and setting displayTables state
      // if (forecast_dict) {
      //   const preparedTables = Object.keys(forecast_dict).map(pipeName => ({
      //     title: `Forecast for: ${pipeName}`,
      //     data: forecast_dict[pipeName],
      //   }));
      //   setDisplayTables(preparedTables);
      // } else {
      //   setDisplayTables([]);
      // }

    } catch (err) {
      setError(`Error generating forecast: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header />

        <div className="p-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">AI-Powered Demand Forecasting</h1>
            <p className="text-gray-500 mb-8">Configure your forecast parameters below</p>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="w-full space-y-8">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Aggregation Frequency */}
                <div className="space-y-4">
                  <label className="block text-base font-medium text-gray-700">Aggregation</label>
                  <div className="flex space-x-4">
                    {['Weekly', 'Monthly'].map(option => (
                      <button
                        key={option}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          forecastSettings.aggregation === option
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleSettingChange('aggregation', option)}
                        disabled={loading}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pipe Type */}
                <div className="space-y-4">
                  <label className="block text-base font-medium text-gray-700">Pipe Type</label>
                  <select
                    value={forecastSettings.pipeType}
                    onChange={(e) => handleSettingChange('pipeType', e.target.value)}
                    className="w-full px-6 py-3 bg-white border border-gray-300 rounded-lg text-base focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading || !pipeOptions}
                  >
                    <option value="">Select pipe type</option>
                    {pipeOptions?.pipe_types?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {!pipeOptions && !loading && !error && (
                    <p className="text-sm text-gray-500">Loading pipe types...</p>
                  )}
                </div>

                {/* Forecast Period */}
                <div className="space-y-4">
                  <label className="block text-base font-medium text-gray-700">
                    Forecast Period (max {getMaxForecastPeriod()} {forecastSettings.aggregation === 'Weekly' ? 'weeks' : 'months'})
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={forecastSettings.num_months}
                      onChange={(e) => handleSettingChange(
                        'num_months',
                        Math.min(Math.max(1, Number(e.target.value)), getMaxForecastPeriod())
                      )}
                      className="w-24 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-base focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max={getMaxForecastPeriod()}
                      disabled={loading}
                    />
                    <span className="text-gray-500 text-base">
                      {forecastSettings.num_months} {forecastSettings.aggregation.toLowerCase()}
                      {forecastSettings.num_months !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Pipe Size (Custom Dropdown with Checkboxes) */}
                <div className="space-y-4 relative">
                  <label className="block text-base font-medium text-gray-700">Pipe Size(s)</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full px-6 py-3 bg-white border border-gray-300 rounded-lg text-base text-left focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center"
                      onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                      disabled={loading || !forecastSettings.pipeType || availableSizes.length === 0}
                    >
                      <span>
                        {forecastSettings.pipesize.length === 0 
                          ? "Select pipe size(s)" 
                          : forecastSettings.pipesize.length === availableSizes.length
                            ? "All Sizes Selected"
                            : `${forecastSettings.pipesize.length} size(s) selected`}
                      </span>
                      <svg className={`h-5 w-5 text-gray-400 transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {showSizeDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-blue-600 rounded"
                              checked={forecastSettings.pipesize.length === availableSizes.length && availableSizes.length > 0}
                              onChange={() => handleSizeSelection('All')}
                            />
                            <span className="text-gray-700">All Sizes</span>
                          </label>
                        </div>
                        {availableSizes.map(size => (
                          <div key={size} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                checked={forecastSettings.pipesize.includes(size)}
                                onChange={() => handleSizeSelection(size)}
                              />
                              <span className="text-gray-700">{size}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {forecastSettings.pipeType && availableSizes.length === 0 && !loading && (
                    <p className="text-sm text-gray-500">No sizes available for selected pipe type.</p>
                  )}
                </div>

                {/* Generate Forecast Button */}
                <div className="flex items-end col-span-1 md:col-span-2">
                  <button
                    onClick={generateForecast}
                    disabled={loading || !forecastSettings.pipeType || forecastSettings.pipesize.length === 0}
                    className={`w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-base shadow-lg transition-all ${
                      loading || !forecastSettings.pipeType || forecastSettings.pipesize.length === 0
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {loading ? 'Generating Forecast...' : 'Generate Forecast'}
                  </button>
                </div>
              </div>
            </div>

            {/* Display Raw JSON Response (for demonstration/debugging) */}
            {forecastTableData && (
              <div className="mt-12 pt-8 border-t border-gray-200 space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Raw Forecast Data (JSON)</h2>
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(forecastTableData, null, 2)}
                  </pre>
                </div>
                {/* You can add similar blocks for fig1Data and fig2Data if needed */}
                {fig1Data && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-800 mt-6">Raw Fig1 Data (JSON)</h2>
                    <div className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(fig1Data, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
                {fig2Data && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-800 mt-6">Raw Fig2 Data (JSON)</h2>
                    <div className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(fig2Data, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            )}
            {!forecastTableData && !loading && !error && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-gray-600">No forecast data generated yet. Configure parameters and click "Generate Forecast".</p>
              </div>
            )}
            {/* Removed the original displayTables rendering logic */}
            
          </div>
        </div>
      </div>
    </div>
  );
}