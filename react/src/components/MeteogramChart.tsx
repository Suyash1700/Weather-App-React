import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import windbarb from 'highcharts/modules/windbarb';

windbarb(Highcharts);

interface MeteogramChartProps {
  intervals: Array<{
    startTime: string;
    values: {
      humidity: number;
      temperature: number;
      pressureSeaLevel: number;
      windSpeed: number;
      windDirection: number;
    };
  }>;
}

const MeteogramChart: React.FC<MeteogramChartProps> = ({ intervals }) => {
  const humidityData: Array<[number, number]> = [];
  const temperatureData: Array<[number, number]> = [];
  const pressureData: Array<[number, number]> = [];
  const windData: Array<{ x: number; value: number; direction: number }> = [];
  const humidityError: Array<[number, number]> = [];
  console.log(intervals.slice(0,3));

  intervals.forEach((item, index) => {
    const timestamp = new Date(item.startTime).getTime();
    humidityData.push([timestamp, item.values.humidity]);
    temperatureData.push([timestamp, item.values.temperature]);
    pressureData.push([timestamp, item.values.pressureSeaLevel]);
  
    if (index % 2 === 0) {
      windData.push({
        x: timestamp,
        value: item.values.windSpeed,
        direction: item.values.windDirection,
      });
    }
  });
  

  const chartOptions: Highcharts.Options = {
    chart: {
        marginBottom: 70,
        marginRight: 40,
        marginTop: 50,
        plotBorderWidth: 1,
        height: 400,
        alignTicks: false,
        scrollablePlotArea: {
          minWidth: 720,
        },
    },

    title: {
        text: 'Hourly Weather (For Next 5 Days)',
        align: 'center',
        style: {
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        },
    },

    credits: {
    text: 'Forecast',
    position: {
        align: 'right',
        x: -40,
    },
    },

    tooltip: {
    shared: true,
    useHTML: true,
    headerFormat:
        '<small>{point.x:%A, %b %e, %H:%M} - {point.point.to:%H:%M}</small><br>' +
        '<b>{point.point.symbolName}</b><br>',
    },

    xAxis: [
        {
          type: 'datetime',
          tickInterval: 2 * 36e5,
          minorTickInterval: 36e5,
          tickLength: 0,
          gridLineWidth: 1,
          gridLineColor: 'rgba(128, 128, 128, 0.1)',
          startOnTick: false,
          endOnTick: false,
          minPadding: 0,
          maxPadding: 0,
          offset: 30,
          showLastLabel: true,
          labels: {
            format: '{value:%H}',
          },
          crosshair: true,
        },
        {
          linkedTo: 0,
          type: 'datetime',
          tickInterval: 24 * 3600 * 1000,
          labels: {
            format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
            align: 'left',
            x: 3,
            y: 8,
            useHTML: true,
          },
          opposite: true,
          tickLength: 20,
          gridLineWidth: 1,
        },
      ],

      yAxis: [
        {
          title: {
            text: null,
          },
          labels: {
            format: '{value}°',
            style: {
              fontSize: '10px',
            },
            x: -3,
          },
          plotLines: [
            {
              value: 0,
              color: '#BBBBBB',
              width: 1,
              zIndex: 2,
            },
          ],
          maxPadding: 0.3,
          minRange: 8,
          tickInterval: 10,
          gridLineColor: 'rgba(128, 128, 128, 0.1)',
        },
        {
          title: {
            text: null,
          },
          labels: {
            enabled: false,
          },
          gridLineWidth: 0,
          tickLength: 0,
          minRange: 10,
          min: 0,
        },
        {
          allowDecimals: false,
          title: {
            text: 'inHg',
            offset: 0,
            align: 'high',
            rotation: 0,
            style: {
              fontSize: '10px',
              color: (Highcharts.getOptions()?.colors?.[2] as string) || 'black',
            },
            textAlign: 'left',
            x: 3,
          },
          labels: {
            style: {
              fontSize: '8px',
              color: (Highcharts.getOptions()?.colors?.[2] as string) || 'black',
            },
            y: 2,
            x: 3,
          },
          gridLineWidth: 0,
          opposite: true,
          showLastLabel: false,
        },
      ],

      legend: {
        enabled: false,
      },
      plotOptions: {
        series: {
          pointPlacement: 'between' as any,
        },
      },


      series: [
        {
          name: 'Temperature',
          data: temperatureData,
          type: 'spline',
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true,
              },
            },
          },
          tooltip: {
            pointFormat:
              '<span style="color:{point.color}">\u25CF</span> ' +
              '{series.name}: <b>{point.y}°F</b><br/>',
          },
          zIndex: 1,
          color: '#FF3333',
          negativeColor: '#48AFE8',
        },
        {
          name: 'Humidity',
          data: humidityError,
          type: 'column',
          color: {
            pattern: {
              path: {
                d: 'M 10 0 L 0 0 L 0 10 Z',
                fill: '#68CFE8',
              },
            },
          },
          yAxis: 1,
          groupPadding: 0,
          pointPadding: 0,
          tooltip: {
            valueSuffix: ' mm',
            pointFormat:
              '<span style="color:{point.color}">\u25CF</span> ' +
              '{series.name}: <b>{point.minvalue} mm - {point.maxvalue} mm</b><br/>',
          },
          grouping: false,
          dataLabels: {
            enabled: false,
            filter: {
              operator: '>',
              property: 'maxValue',
              value: 0,
            },
            style: {
              fontSize: '8px',
              color: 'gray',
            },
          },
        },
        {
            name: 'Humidity',
            data: humidityData,
            type: 'column',
            color: '#68CFE8',
            yAxis: 1,
            groupPadding: 0,
            pointPadding: 0,
            grouping: false,
            dataLabels: {
              enabled: true,
              filter: {
                operator: '>',
                property: 'y',
                value: 0,
              },
              style: {
                fontSize: '8px',
                color: '#666',
              },
            },
            tooltip: {
              valueSuffix: ' %',
            },
          },           
          {
            name: 'Air pressure',
            color: Highcharts.getOptions().colors?.[2] || '#AA4643',
            data: pressureData,
            type: 'spline',
            marker: {
              enabled: false,
            },
            shadow: false,
            tooltip: {
              valueSuffix: ' inHg',
            },
            dashStyle: 'ShortDot',
            yAxis: 2,
          },
          {
            name: 'Wind',
            type: 'windbarb',
            id: 'windbarbs',
            color: '#ff3333',
            lineWidth: 1.5,
            data: windData,
            vectorLength: 12,
            yOffset: -15,
            tooltip: {
              valueSuffix: ' mph',
            },
          }]
};

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
    />
  );
};

export default MeteogramChart;