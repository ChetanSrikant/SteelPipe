import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const TopSkuChart = ({ data, options, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading SKU data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.labels.length === 0 ||
      (data.datasets[0].data.length === 0 && data.datasets[1].data.length === 0)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No SKU data available</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload and select a sheet to view top SKUs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Chart
        type='bar'
        data={data}
        options={options}
      />
    </div>
  );
};

export default TopSkuChart;