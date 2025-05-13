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

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Note: Props now include selectedMonth and allMonthlyCustomerSales for the specific no-data check
export default function MonthlyCustomerBarChart({ data, options, isLoading, selectedMonth, allMonthlyCustomerSales }) {
    const hasData = data?.datasets?.[0]?.data?.length > 0;
    const noDataForMonth = selectedMonth && allMonthlyCustomerSales && (!allMonthlyCustomerSales[selectedMonth] || Object.keys(allMonthlyCustomerSales[selectedMonth]).length === 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Adjusted height slightly, can be tuned */}
            <div className="h-96 md:h-[450px] relative flex-grow">
                {/* Use hasData for the initial loading check based on processed 'data' prop */}
                {isLoading && !hasData && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                        <p>Loading Chart Data...</p>
                    </div>
                )}
                 {!isLoading && !hasData && data?.labels?.[0]?.startsWith('Upload File') && (
                     <div className="absolute inset-0 flex items-center justify-center z-5">
                         <p>Upload an Excel file and select a month to view top customers.</p>
                    </div>
                 )}
                {/* Specific check for when a month is selected but no data exists for it */}
                {!isLoading && selectedMonth && noDataForMonth && (
                    <div className="absolute inset-0 flex items-center justify-center z-5">
                        <p>No Customer Data Found for {selectedMonth}.</p>
                    </div>
                )}
                {/* Render chart only if it's loading, has data, or doesn't fall into the specific no-data-for-month case */}
                {(isLoading || hasData || (!isLoading && selectedMonth && !noDataForMonth)) && (
                    <Bar options={options} data={data} />
                 )}
            </div>
        </div>
    );
}