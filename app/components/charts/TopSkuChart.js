import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TopSkuChart({ data, options, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-64 bg-gray-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return <Bar data={data} options={options} />;
}