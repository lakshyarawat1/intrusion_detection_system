import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

const RealTimeChart = (props) => {
    const [series, setSeries] = useState([{ data: [] }]);

    const options = {
        colors: ["#00baff"] ,
        chart: {
            id: 'realtime',
            height: 100,
            type: 'line',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000,
                },
            },
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        stroke: {
            width: 3,
        },
        markers: {
            size: 0,
        },
        xaxis: {
            labels: {
                show: false,
            }
        },
        yaxis: {
            labels: {
                show: false,
            }
        },
        legend: {
            show: false,
        },
        grid: {
            show: false,
        },
    };

    useEffect(() => {
        if (!isNaN(parseInt(props.data.frequency))) {
            setSeries((prevSeries) => {
                const updatedData = [...prevSeries[0].data, { x: new Date().getTime(), y: parseInt(props.data.frequency) }];

                if (updatedData.length > 20) {
                    updatedData.shift(); // Remove the first element to maintain the maximum length
                }

                return [{ data: updatedData }];
            });
        }
    }, [props.data.frequency]);

    return (
        <div id="chart">
            <Chart options={options} series={series} type="line" height={100} />
        </div>
    );
};

export default RealTimeChart;
