"use client";
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function PipeContributionPieChart({ data, options, isLoading }) {
     const hasData = data?.datasets?.[0]?.data?.length > 0;

    return (
        <div className="bg-white p-6 rounded-lg ">
            <div className="h-110 relative flex-grow">
                {isLoading && !hasData && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                        <p>Loading Chart Data...</p>
                    </div>
                )}
                 {!isLoading && !hasData && data?.labels?.[0]?.startsWith('Upload File') && (
                     <div className="absolute inset-0 flex items-center justify-center z-5">
                         <p>Upload an Excel file and select a month to view pipe contribution.</p>
                    </div>
                 )}
                 {!isLoading && !hasData && data?.labels?.[0]?.startsWith('No Pipe Data') && (
                     <div className="absolute inset-0 flex items-center justify-center z-5">
                         <p>{data.labels[0]}</p> {/* Display specific no data message */}
                    </div>
                 )}
                 {/* Render chart only if there might be data or it's loading */}
                {(isLoading || hasData) && (
                     <Pie options={options} data={data} />
                 )}
            </div>
        </div>
    );
}