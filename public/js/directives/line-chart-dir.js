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

          scope.$on('DrawChart', function (e, config) {
            element.highcharts(config);
            scope.chart = element.highcharts();
          });

        }
      }
    }]);
