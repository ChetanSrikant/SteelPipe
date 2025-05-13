import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

ChartJS.register(BarElement, LineElement, PointElement, LinearScale, CategoryScale);

export default function SkuCustomerChart({ data, options, isLoading }) {
  return (
    <div className="w-full h-full">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">Loading...</div>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
}