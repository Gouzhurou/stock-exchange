import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import "../css/Chart.css"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const HistoricalData = ({ historicalData }) => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if (historicalData && historicalData.length > 0) {
            const labels = historicalData.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('ru-RU');
            });

            const data = historicalData.map(item => item.open);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Цена открытия',
                        data: data,
                        borderColor: 'rgb(255, 213, 0)',
                        backgroundColor: 'rgba(255, 213, 0, 0.2)',
                        tension: 0.1,
                        pointRadius: 1,
                        pointHoverRadius: 6,
                    },
                ],
            });
        }
    }, [historicalData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Исторические котировки',
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Цена',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Дата',
                },
                ticks: {
                    display: false,
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    if (!historicalData || historicalData.length === 0) {
        return <div>Нет исторических данных</div>;
    }

    return (
        <div>
            {chartData ? (
                <div className="chart">
                    <Line data={chartData} options={chartOptions} />
                </div>
            ) : (
                <div>Ошибка загрузки графика...</div>
            )}
        </div>
    );
};

export default HistoricalData;