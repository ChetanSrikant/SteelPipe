"use client";
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

// Register ChartJS components (can be done here or in the main page if preferred)
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function DailySalesBarChart({ data, options, isLoading }) {
    const hasData = data?.datasets?.[0]?.data?.length > 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col lg:col-span-2">
            <div className="h-96 relative flex-grow">
                {isLoading && !hasData && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                        <p>Loading Chart Data...</p>
                    </div>
                )}
                 {!isLoading && !hasData && data?.labels?.[0]?.startsWith('Upload File') && (
                     <div className="absolute inset-0 flex items-center justify-center z-5">
                         <p>Upload an Excel file and select a month to view daily sales.</p>
                    </div>
                 )}
                 {!isLoading && !hasData && data?.labels?.[0]?.startsWith('No Daily Data') && (
                     <div className="absolute inset-0 flex items-center justify-center z-5">
                         <p>{data.labels[0]}</p> {/* Display specific no data message */}
                    </div>
                 )}
                {/* Render chart only if there might be data or it's loading */}
                {(isLoading || hasData) && (
                     <Bar options={options} data={data} />
                 )}
            </div>
        </div>
    );
}