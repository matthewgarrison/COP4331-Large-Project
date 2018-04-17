// Create the chart
Highcharts.chart('chart-container', {
  chart: {
    type: 'column'
  },
  credits: {
    enabled: false
  },
  title: {
    text: 'Poll Results'
  },
  xAxis: {
    type: 'category'
  },
  yAxis: {
    title: {
      text: 'Percent'
    }

  },
  legend: {
    enabled: false
  },
  plotOptions: {
    series: {
      borderWidth: 0,
      dataLabels: {
        enabled: true,
        format: '{point.y:.1f}%'
      }
    }
  },

  tooltip: {
    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
  },

  "series": [{
    "name": "Answer Choice",
    "colorByPoint": true,
    "data": [{
        "name": "A",
        "y": 62.74,
      },
      {
        "name": "B",
        "y": 10.57,
      },
      {
        "name": "C",
        "y": 7.23,
      },
      {
        "name": "D",
        "y": 5.58,
      },
      {
        "name": "E",
        "y": 4.02,
      }
    ]
  }]
});