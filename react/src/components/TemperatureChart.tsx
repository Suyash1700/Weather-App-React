import React from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import HighchartsMore from 'highcharts/highcharts-more';
HighchartsMore(Highcharts);

interface TemperatureChartProps {
  data: Array<[number, number, number]>;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  const options = {
    chart: {
      type: 'arearange',
    },
    title: {
      text: 'Temperature Ranges (Min, Max)',
    },
    xAxis: {
      type: 'datetime',
      labels: {
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          return Highcharts.dateFormat('%e %b', this.value as number);
        },
      },
    },
    yAxis: {
      title: {
        text: null,
      },
    },
    tooltip: {
      shared: true,
      valueSuffix: '°F',
      xDateFormat: '%A, %b %e',
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: 'Temperatures',
        data: data,
        type: 'arearange',
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, 'rgba(255, 165, 0,0.95)'],
            [1, 'rgba(0,121,199,0.4)'],
          ],
        },
        lineColor: '#ff8000',
        lineWidth: 1.5,
        marker: {
          fillColor: '#1E90FF',
          radius: 4,
        },
      },
    ],
  };

  return (
    <div id="chart-1-container">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default TemperatureChart;
