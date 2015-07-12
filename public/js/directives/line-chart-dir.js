angular.module('stockApp_LineChartDRMD', [])
  .directive('lineChartDir', [
    '$compile',
    '$timeout',

    function ($compile, $timeout) {
      return {
        scope: {
          config: "=config"
        },
        link: function (scope, element) {
          element.highcharts({
            chart: {
              type: 'line'
            },
            title: {
              text: "ABC Corporation Ltd."
            },
            xAxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
              title: {
                text: 'Price'
              }
            },
            tooltip: {
              valueSuffix: '$'
            },
            credits:{
              enabled: false
            },
            plotOptions: {
              line: {dataLabels: {
                enabled: true,
                formatter: function () {
                  if (this.point.x % 2 == 0) return '';
                  return this.y + '$';
                }
              }
              }
            },
            series: [
              {
                name: 'Stock Price',
                data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
              }
            ]
          });

          scope.chart = element.highcharts();

        }
      }
    }]);
