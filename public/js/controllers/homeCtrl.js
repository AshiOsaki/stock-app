angular.module('stockAppHomeCtrlMD', []).
  controller('stockAppHomeCtrl', [
    '$scope',
    'CoreHttpSV',
    function ($scope, CoreHttpSV) {

      $scope.stockList = [];
      $scope.selectedStockName = "";
      $scope.validStockSelected = false;
      $scope.requestedEndDate = new Date();
      $scope.hideSearchList = false;
      $scope.config = {};
      $scope.dataIndex = 0;
      $scope.dataPoints = 0;
      $scope.buyFilterList = [];
      $scope.sellFilterList = [];
      $scope.buyCardSelections = {
        parameter: 'Volume',
        operator: '<',
        value: '',
        dojiStar : '',
        chillStar : ''
      };
      $scope.sellCardSelections = {
        parameter: 'Volume',
        operator: '<',
        value: '',
        dojiStar : '',
        chillStar : ''
      };

      getTitles();

      function getTitles() {

        var _config = {
          url: 'http://0.0.0.0:8080/api/getTitles',
          method: 'GET',
          headers: {
            'Content-Type': "text/plain"
          }
        };
        CoreHttpSV.httpSV(_config).then(function (data) {

          for(var i=0; i<data.length; i++ ){
            $scope.stockList[i] = data[i].Title;
          }

        }, function (error) {
          console.log('Error while getting titles: ', error);
          $scope.$emit('processIndicator', false);
        })

      }

      $scope.searchListArray = angular.copy($scope.stockList);

      function fetchStockDetails (stockName) {
        var _config = {
        url: 'http://0.0.0.0:8080/api/getData',
        method: 'GET',
        params: {"title":stockName},
        headers: {
          'Content-Type': "text/plain"
        }
      };
      CoreHttpSV.httpSV(_config).then(function (data) {

        $scope.data = data[0];
        $scope.createChartConfig(-365,365);

      }, function (error) {
        console.log('Error while fetching stock details: ', error);
        $scope.$emit('processIndicator', false);
      })
    };

      $scope.setStockName = function () {
        $scope.selectedStockName = event.currentTarget.text;
        $scope.validStockSelected = true;
      };

      $scope.getQuote = function () {
        $scope.hideSearchList = true;
        fetchStockDetails($scope.selectedStockName);
        $scope.validStockSelected = false;
      };

      $scope.createSearchList = function () {
        if ($scope.selectedStockName.length > 0) {
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
      };

      $scope.addToBuyFilter = function (){
        var _filter = {
          parameter : $scope.buyCardSelections.parameter,
          operator : $scope.buyCardSelections.operator,
          value : $scope.buyCardSelections.value
        }
        $scope.buyFilterList.push(_filter);
      };

      $scope.editBuyFilter = function (index){
        var _selectedFilter = angular.copy($scope.buyFilterList[index]);
        $scope.buyCardSelections = {
          parameter: _selectedFilter.parameter,
          operator: _selectedFilter.operator,
          value: _selectedFilter.value
        };
        $scope.buyFilterList.splice(index, 1);
      };

      $scope.removeFromBuyFilter = function (index){
        $scope.buyFilterList.splice(index, 1);
      };

      $scope.addToSellFilter = function (){
        var _filter = {
          parameter : $scope.sellCardSelections.parameter,
          operator : $scope.sellCardSelections.operator,
          value : $scope.sellCardSelections.value
        }
        $scope.sellFilterList.push(_filter);
      };

      $scope.editSellFilter = function (index){
        var _selectedFilter = angular.copy($scope.sellFilterList[index]);
        $scope.sellCardSelections = {
          parameter: _selectedFilter.parameter,
          operator: _selectedFilter.operator,
          value: _selectedFilter.value
        };
        $scope.sellFilterList.splice(index, 1);
      };

      $scope.removeFromSellFilter = function (index){
        $scope.sellFilterList.splice(index, 1);
      };

      function formatDataForConfig(indexToStartFrom, totalDataPoints){

        $scope.dataIndex = indexToStartFrom;
        $scope.dataPoints = totalDataPoints;

        var dates = $scope.data.Date.value.splice($scope.dataIndex, $scope.dataPoints);
        var prices = $scope.data.Price.value.splice($scope.dataIndex, $scope.dataPoints);

        var usefulData = {
          "dates":dates,
          "prices":prices
        };

        return usefulData;

      }

      $scope.createChartConfig = function (indexToStartFrom, totalDataPoints){

        var formattedData = formatDataForConfig(indexToStartFrom, totalDataPoints);

        $scope.config = {
          chart: {
            type: 'line'
          },
          title: {
            text: $scope.data.Title
          },
          xAxis: {
            categories: formattedData.dates
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
              data: formattedData.prices
            }
          ]
        };

        $scope.$broadcast("DrawChart", $scope.config);

      };

    }]);