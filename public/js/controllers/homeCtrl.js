angular.module('stockAppHomeCtrlMD', []).
  controller('stockAppHomeCtrl', [
    '$scope',
    'CoreHttpSV',
    function ($scope, CoreHttpSV) {
      $scope.stockList = [
        "ABC Company",
        "DEF Company",
        "ADC Company",
        "FINQ Company",
        "Globe Company",
        "BILL Company",
        "PRO Company",
        "STO Company"
      ];

      $scope.searchListArray = angular.copy($scope.stockList);

      $scope.selectedStockName = "";
      $scope.validStockSelected = false;
      $scope.requestedEndDate = new Date();
      $scope.hideSearchList = false;
      $scope.config = {};

      function fetchStockDetails (stockName) {
        var _config = {
          url: 'http://0.0.0.0:8080/api/getData',
          method: 'GET',
          params: {"title":"AFCL"},
          headers: {
            'Content-Type': "text/plain"
          }
        };
        CoreHttpSV.httpSV(_config).then(function (data) {

          console.log(data[0].Title);
          createChartConfig(data[0]);
          $scope.$broadcast("DrawChart", $scope.config);

        }, function (error) {
          console.log('Error while adding customer: ', error);
          $scope.$emit('processIndicator', false);
        })
      };

      $scope.setStockName = function () {
        $scope.selectedStockName = event.currentTarget.text;
        $scope.validStockSelected = true;
      };

      $scope.getQuote = function () {
        if ($scope.selectedStockName.length > 3 && $scope.validStockSelected) {
          $scope.hideSearchList = true;
          fetchStockDetails($scope.selectedStockName);
        }
      };

      $scope.createSearchList = function () {
        if ($scope.selectedStockName.length > 3) {
          var _stockList = $scope.stockList,
            _length = _stockList.length,
            _stingToCheck = $scope.selectedStockName,
            _newSearchArray = [];
          for (var i = 0; i < _length; i++) {
            if (_stockList[i].substring(0, _stingToCheck.length) === _stingToCheck) {
              _newSearchArray.push(_stockList[i]);
            }
          }
          $scope.searchListArray = _newSearchArray;
          $scope.hideSearchList = false;
        }
        else if ($scope.selectedStockName.length === 0) {
          $scope.searchListArray = [];
        }
      }

      function formatDataForConfig(data){

        return data;

      }

      function createChartConfig(receivedData){

        var formattedData = formatDataForConfig(receivedData);
        $scope.config = {
          chart: {
            type: 'line'
          },
          title: {
            text: receivedData.Title
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
        };
      }




    }]);