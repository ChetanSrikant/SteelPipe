'use client';
import { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DataTable({ title, data }) {
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const HEADERS_ORDER = [
    'Date',
    'Pipe',
    'Final Forecast',
    'Lower Bound',
    'Upper Bound'
  ];

  if (!data || !Array.isArray(data) || data.length === 0) {
    // console.log("DataTable: No data or empty data received, returning null."); // Added for debugging
    return null;
  }

  const headers = HEADERS_ORDER.filter(header => data[0].hasOwnProperty(header));

  // Helper function to clean and parse numbers
  const cleanAndParseNumber = (value) => {
    if (typeof value === 'number') {
      return value; // Already a number
    }
    if (typeof value === 'string') {
      // Remove any characters that are not a digit, a period (for decimals), or a minus sign.
      // This is a common pattern to handle currency symbols, commas, or other text.
      // E.g., "$1,234.56" becomes "1234.56"
      // E.g., "500,00" becomes "50000" (if comma is a thousands separator) - BE CAREFUL with comma as decimal!
      // If your numbers use comma as decimal, you'll need to replace comma with dot:
      // const cleanedValue = value.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
      const cleanedValue = value.replace(/[^0-9.-]/g, '');

      const parsed = Number(cleanedValue);
      // Optional: Log if parsing fails to help identify bad data
      // if (isNaN(parsed)) {
      //   console.warn(`Failed to parse number from '${value}' (cleaned: '${cleanedValue}'). Resulted in NaN.`);
      // }
      return parsed;
    }
    return NaN; // Return NaN for null, undefined, or other unexpected types
  };

  // Prepare data for the chart using the new helper
  const labels = data.map(item => item.Date);
  const forecastData = data.map(item => cleanAndParseNumber(item['Final Forecast']));
  const lowerBoundData = data.map(item => cleanAndParseNumber(item['Lower Bound']));
  const upperBoundData = data.map(item => cleanAndParseNumber(item['Upper Bound']));

  // Debugging: Log the parsed data arrays to confirm they contain numbers
  // console.log("Parsed Forecast Data:", forecastData);
  // console.log("Parsed Lower Bound Data:", lowerBoundData);
  // console.log("Parsed Upper Bound Data:", upperBoundData);


  // Get pipe name from the first row
  const pipeName = data[0]?.Pipe || 'Unknown Pipe';

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Final Forecast',
        data: forecastData,
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
        borderWidth: 2,
        fill: false, // Ensures line chart doesn't fill area by default
      },
      {
        label: 'Lower Bound',
        data: lowerBoundData,
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderDash: [5, 5],
        borderWidth: 1.5,
        fill: false,
      },
      {
        label: 'Upper Bound',
        data: upperBoundData,
        borderColor: 'rgb(16, 185, 129)', // green-500
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderDash: [5, 5],
        borderWidth: 1.5,
        fill: false,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Forecast for ${pipeName}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false // Important for forecast data not starting at 0
      },
      x: {
        // Ensure category scale for dates if they are strings
        type: 'category'
      }
    },
    maintainAspectRatio: false
  };

  const toggleChartType = () => {
    setChartType(prev => prev === 'line' ? 'bar' : 'line');
  };

  const convertToCSV = () => {
    const csvHeaderRow = headers.map(header => `"${header.replace(/_/g, ' ')}"`).join(',');
    const csvDataRows = data.map(row =>
      headers
        .map(header => {
          const cell = row[header];
          const value =
            typeof cell === 'object' && cell !== null
              ? JSON.stringify(cell)
              : cell;
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    return [csvHeaderRow, ...csvDataRows].join('\n');
  };

  const handleDownload = () => {
    const csvContent = convertToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title || 'data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mb-8">
      <div className="flex items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <button
          onClick={handleDownload}
          className="ml-auto px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 cursor-pointer"
        >
          Download CSV
        </button>
      </div>
      {/* Table Section */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l"
                >
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 border-l">
                    {typeof row[header] === 'object' && row[header] !== null
                      ? JSON.stringify(row[header])
                      : row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">{data.length} rows</p>

      {/* Graph Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-gray-700">Forecast Visualization: {pipeName}</h3>
          <button
            onClick={toggleChartType}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          >
            Switch to {chartType === 'line' ? 'Bar Chart' : 'Line Chart'}
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg h-[400px]">
          {chartType === 'line' ? (
            <Line data={chartData} options={options} />
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </div>
    </div>
  );
}