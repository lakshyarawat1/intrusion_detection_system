import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

const RamUtilization = (props) => {
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
            width: 3
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
        if (!isNaN(parseFloat(props.data.ram))) {
            setSeries((prevSeries) => {
                const updatedData = [...prevSeries[0].data, { x: new Date().getTime(), y: parseFloat(props.data.ram) }];

                if (updatedData.length > 20) {
                    updatedData.shift(); // Remove the first element to maintain the maximum length
                }

                return [{ data: updatedData }];
            });
        }
    }, [props.data.ram]);

    return (
        <div id="chart">
            <Chart options={options} series={series} type="line" height={100} />
        </div>
    );
};

export default RamUtilization;
