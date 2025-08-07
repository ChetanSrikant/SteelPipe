'use client';
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/navigation';
import DataTable from '@/app/components/DataTable';

const API_BASE_URL = process.env.REACT_APP_ANALYSIS_API_BASE_URL;

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
  const [showSizeDropdown, setShowSizeDropdown] = useState(false); // State for pipe size dropdown

  // Ref for the pipe size dropdown container
  const pipeSizeDropdownRef = useRef(null);

  const [forecastSettings, setForecastSettings] = useState({
    aggregation: 'Monthly',
    pipeType: '',
    num_months: 4,
    pipesize: [],
  });

  const [availableSizes, setAvailableSizes] = useState([]);
  const [forecastTableData, setForecastTableData] = useState(null);
  const [displayTables, setDisplayTables] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(['All']); // Array for multi-select
  const [showMonthFilter, setShowMonthFilter] = useState(false); // State for month filter dropdown

  // Ref for the month filter dropdown container
  const monthFilterDropdownRef = useRef(null);


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

  // Effect to close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pipeSizeDropdownRef.current && !pipeSizeDropdownRef.current.contains(event.target)) {
        setShowSizeDropdown(false);
      }
      if (monthFilterDropdownRef.current && !monthFilterDropdownRef.current.contains(event.target)) {
        setShowMonthFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount


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
        const allSelected = availableSizes.every(s => prevSettings.pipesize.includes(s));
        newSizes = allSelected ? [] : [...availableSizes];
      } else {
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
    setForecastTableData(null);
    setDisplayTables([]);
    setAvailableMonths([]);
    setSelectedMonths(['All']);

    try {
      const formData = new FormData();
      formData.append('aggregation', forecastSettings.aggregation);
      formData.append('pipeType', forecastSettings.pipeType);
      formData.append('num_months', forecastSettings.num_months.toString());
      formData.append('pipesize', forecastSettings.pipesize.join(','));

      const data = await apiClient.generateForecast(formData);
      const { forecast_dict } = data;

      setForecastTableData(forecast_dict);

      if (forecast_dict) {
        // Extract unique months from the forecast data and sort them chronologically
        const uniqueMonthYears = new Set();
        Object.values(forecast_dict).forEach(tableData => {
          tableData.forEach(row => {
            // Assuming row.Date is in a format like "YYYY-MM-DD" or "MM/DD/YYYY"
            const date = new Date(row.Date);
            // Create a sortable string: YYYY-MM (e.g., "2024-01", "2024-02")
            const sortableMonthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            // Create the display string: "January 2024"
            const displayMonthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

            // Store both for sorting, then display
            uniqueMonthYears.add({ sortable: sortableMonthYear, display: displayMonthYear });
          });
        });

        // Convert Set to Array, sort by the 'sortable' property, then extract only display names
        const sortedDisplayMonths = Array.from(uniqueMonthYears)
          .sort((a, b) => a.sortable.localeCompare(b.sortable)) // Sorts by "YYYY-MM"
          .map(item => item.display); // Maps back to "Month Year" for display

        setAvailableMonths(['All', ...sortedDisplayMonths]);

        const preparedTables = Object.keys(forecast_dict).map(pipeName => ({
          title: `Forecast for: ${pipeName}`,
          data: forecast_dict[pipeName],
        }));
        setDisplayTables(preparedTables);
      } else {
        setDisplayTables([]);
      }

    } catch (err) {
      setError(`Error generating forecast: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle month selection
  const toggleMonthSelection = (month) => {
    setSelectedMonths(prev => {
      if (month === 'All') {
        return prev.includes('All') ? [] : ['All'];
      }
      let newSelection = [...prev];
      if (newSelection.includes('All')) {
        newSelection = newSelection.filter(m => m !== 'All');
      }
      if (newSelection.includes(month)) {
        newSelection = newSelection.filter(m => m !== month);
        if (newSelection.length === 0) {
          newSelection = ['All'];
        }
      } else {
        newSelection.push(month);
      }
      return newSelection;
    });
  };

  // Apply month filter
  const applyMonthFilter = () => {
    if (selectedMonths.includes('All') || selectedMonths.length === 0) {
      const preparedTables = Object.keys(forecastTableData).map(pipeName => ({
        title: `Forecast for: ${pipeName}`,
        data: forecastTableData[pipeName],
      }));
      setDisplayTables(preparedTables);
    } else {
      const filteredTables = Object.keys(forecastTableData).map(pipeName => {
        const filteredData = forecastTableData[pipeName].filter(row => {
          const date = new Date(row.Date);
          const rowMonthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
          return selectedMonths.includes(rowMonthYear);
        });
        return {
          title: `Forecast for: ${pipeName} (${selectedMonths.join(', ')})`,
          data: filteredData,
        };
      });
      setDisplayTables(filteredTables);
    }
    setShowMonthFilter(false); // Close the filter dropdown after applying
  };

  // Download all results as CSV
  const downloadResults = () => {
    if (!displayTables || displayTables.length === 0) {
      console.warn("No data available to download.");
      return;
    }

    let csvContent = '';
    displayTables.forEach(table => {
      const pipeName = table.title.replace('Forecast for: ', '').replace(/\s\(.*\)/, '');
      const tableData = table.data;

      if (tableData.length === 0) return;

      csvContent += `Forecast for: ${pipeName}\n`;

      const headers = Object.keys(tableData[0]);

      const csvHeaderRow = headers.map(header => `"${header.replace(/_/g, ' ')}"`).join(',');
      csvContent += csvHeaderRow + '\n';

      tableData.forEach(row => {
        const rowValues = headers.map(header => {
          const cell = row[header];
          const value =
            typeof cell === 'object' && cell !== null
              ? JSON.stringify(cell)
              : cell;
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvContent += rowValues.join(',') + '\n';
      });
      csvContent += '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `filtered_forecast_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset everything
  const resetAll = () => {
    setForecastSettings({
      aggregation: 'Monthly',
      pipeType: '',
      num_months: 4,
      pipesize: [],
    });
    setForecastTableData(null);
    setDisplayTables([]);
    setAvailableMonths([]);
    setSelectedMonths(['All']);
    setError(null);
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
                        {option === 'Weekly' ? 'Weeks' : 'Months'}
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
                    Forecast Period (max {getMaxForecastPeriod()}{' '}
                    {forecastSettings.aggregation === 'Weekly' ? 'weeks' : 'months'})
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
                      {forecastSettings.num_months}{' '}
                      {forecastSettings.aggregation === 'Weekly' ? 'week' : 'month'}
                      {forecastSettings.num_months !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Pipe Size (Custom Dropdown with Checkboxes) */}
                <div className="space-y-4 relative" ref={pipeSizeDropdownRef}> {/* Add ref here */}
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
                          : forecastSettings.pipesize.length === availableSizes.length && availableSizes.length > 0
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
                  <div className="w-full space-y-2">
                    <label
                      htmlFor="generate-forecast-btn"
                      className="block text-base font-medium text-gray-700 mb-2"
                    >
                      Click here to Forecast Results
                    </label>
                    <button
                      id="generate-forecast-btn"
                      type="button"
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

              {/* Results Section */}
              {displayTables.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 space-y-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Forecast Results</h2>

                  {/* New Action Buttons */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    {/* Month Filter Dropdown with Checkboxes */}
                    <div className="relative" ref={monthFilterDropdownRef}> {/* Add ref here */}
                      <button
                        onClick={() => setShowMonthFilter(!showMonthFilter)}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:ring-blue-500 focus:border-blue-500 flex items-center"
                      >
                        Filter by Month
                        <svg className={`ml-2 h-4 w-4 ${showMonthFilter ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showMonthFilter && (
                        <div className="absolute z-10 mt-1 w-56 bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none max-h-60">
                          <div className="px-4 py-2 border-b border-gray-200">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 rounded"
                                checked={selectedMonths.includes('All')}
                                onChange={() => toggleMonthSelection('All')}
                              />
                              <label className="ml-2 text-gray-700">All Months</label>
                            </div>
                          </div>
                          {availableMonths.filter(m => m !== 'All').map(month => (
                            <div key={month} className="px-4 py-2 hover:bg-gray-100">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 rounded"
                                  checked={selectedMonths.includes(month)}
                                  onChange={() => toggleMonthSelection(month)}
                                />
                                <label className="ml-2 text-gray-700">{month}</label>
                              </div>
                            </div>
                          ))}
                          <div className="px-4 py-2 border-t border-gray-200">
                            <button
                              onClick={applyMonthFilter}
                              className="w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Apply Filter
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={downloadResults}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Download Results
                    </button>

                    {/* Reset Button */}
                    <button
                      onClick={resetAll}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Display Tables */}
                  {displayTables.map((table, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <DataTable title={table.title} data={table.data} />
                    </div>
                  ))}
                </div>
              )}
              {displayTables.length === 0 && loading === false && forecastTableData && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-gray-600">No forecast data generated for the selected parameters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}