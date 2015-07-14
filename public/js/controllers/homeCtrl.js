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
        dojiStar: '',
        chillStar: ''
      };
      $scope.sellCardSelections = {
        parameter: 'Volume',
        operator: '<',
        value: '',
        dojiStar: '',
        chillStar: ''
      };

      $scope.buyFilterListData = {
      };

      getTitles();

      function getTitles() {

        var _config = {
          url: 'http://128.199.114.191:8080/api/getTitles',
          method: 'GET',
          headers: {
            'Content-Type': "text/plain"
          }
        };
        CoreHttpSV.httpSV(_config).then(function (data) {

          for (var i = 0; i < data.length; i++) {
            $scope.stockList[i] = data[i].Title;
          }

        }, function (error) {
          console.log('Error while getting titles: ', error);
          $scope.$emit('processIndicator', false);
        })

      }

      function fetchMinMaxValues (stockName) {
        var _config = {
          url: 'http://128.199.114.191:8080/api/getMinMaxValues',
          method: 'GET',
          params: {"title":stockName},
          headers: {
            'Content-Type': "text/plain"
          }
        };
        CoreHttpSV.httpSV(_config).then(function (data) {

          $scope.minMaxValues = data;
          $scope.buyMinMaxPlaceholder = $scope.minMaxValues.Volume;
          $scope.sellMinMaxPlaceholder = $scope.minMaxValues.Volume;

        }, function (error) {
          console.log('Error while fetching min max values: ', error);
          $scope.$emit('processIndicator', false);
        })
      }

      $scope.searchListArray = angular.copy($scope.stockList);

      function fetchStockDetails(stockName) {
        var _config = {
          url: 'http://128.199.114.191:8080/api/getData',
          method: 'GET',
          params: {"title": stockName},
          headers: {
            'Content-Type': "text/plain"
          },
          timeout: 180000
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
        fetchMinMaxValues($scope.selectedStockName);
        fetchStockDetails($scope.selectedStockName);
        $scope.validStockSelected = false;
      };

      $scope.changePlaceholder = function () {
        return;
//        $scope.sellCardSelections.value = "";
//        $scope.buyCardSelections.value = "";

        $scope.buyMinMaxPlaceholder = $scope.minMaxValues[$scope.buyCardSelections.parameter];
        $scope.sellMinMaxPlaceholder = $scope.minMaxValues[$scope.sellCardSelections.parameter];
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
        var min = parseInt($scope.minMaxValues[$scope.buyCardSelections.parameter].split('-')[0]);
        var max = parseInt($scope.minMaxValues[$scope.buyCardSelections.parameter].split('-')[1]);

        if(typeof($scope.buyCardSelections.value) != 'number'){
          alert("Please enter number only")
        }
        else if($scope.buyCardSelections.value > max || $scope.buyCardSelections.value < min) {
          alert("The value of this field should be more than " + min + " and less than " + max);
        }
        else {
          var _filter = {
            parameter: $scope.buyCardSelections.parameter,
            operator: $scope.buyCardSelections.operator,
            value: $scope.buyCardSelections.value
          };
          $scope.buyFilterList.push(_filter);
          $scope.buyFilterListData[_filter.parameter] = _getValues(_filter);
          $scope.reDrawChart();
        }
      };

      $scope.editBuyFilter = function (index){
        var _selectedFilter = angular.copy($scope.buyFilterList[index]);
        $scope.buyCardSelections = {
          parameter: _selectedFilter.parameter,
          operator: _selectedFilter.operator,
          value: _selectedFilter.value
        };
        delete $scope.buyFilterListData[$scope.buyFilterList[index].parameter];
        $scope.buyFilterList.splice(index, 1);
        $scope.reDrawChart();
      };

      $scope.removeFromBuyFilter = function (index){
        delete $scope.buyFilterListData[$scope.buyFilterList[index].parameter];
        $scope.buyFilterList.splice(index, 1);
        $scope.reDrawChart();
      };

      $scope.addToSellFilter = function (){
        var min = parseInt($scope.minMaxValues[$scope.sellCardSelections.parameter].split('-')[0]);
        var max = parseInt($scope.minMaxValues[$scope.sellCardSelections.parameter].split('-')[1]);

        if(typeof($scope.sellCardSelections.value) != 'number'){
          alert("Please enter number only")
        }
        else if($scope.sellCardSelections.value > max || $scope.sellCardSelections.value < min) {
          alert("The value of this field should be more than " + min + " and less than " + max);
        }
        else {
          var _filter = {
            parameter: $scope.sellCardSelections.parameter,
            operator: $scope.sellCardSelections.operator,
            value: $scope.sellCardSelections.value
          };
          $scope.sellFilterList.push(_filter);
        }
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
            line: {
              dataLabels: {
                enabled: false,
                formatter: function () {
//                  if (this.point.x % 2 == 0) return '';
//                  return this.y + '$';
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

      $scope.reDrawChart = function () {

        var _newDataLabels = _createBuyDataLabels();

        var _options = $scope.chart.series[0].options;
        _options.dataLabels.enabled = !_options.dataLabels.enabled;
        _options.dataLabels.formatter = function () {
          var _index = this.point.index;
          if(_newDataLabels.indexOf(_index) == -1){
            return ''
          }
          else{
            return 'Buy';
          }
        };
        $scope.chart.series[0].update(_options);
      };

      var _getValues = function (filter) {
        var _data = $scope.data[filter.parameter].value,
         _dataArray = [];
        switch (filter.operator) {
          case '<':
            _data.forEach(function(value, index){
              parseInt(value) < filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
          case '>':
            _data.forEach(function(value, index){
              parseInt(value) > filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
          case '=':
            _data.forEach(function(value, index){
              parseInt(value) == filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
          case '<=':
            _data.forEach(function(value, index){
              parseInt(value) <= filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
          case '>=':
            _data.forEach(function(value, index){
              parseInt(value) >= filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
        }
      };

      var _createBuyDataLabels = function () {
        var _dataLabels = [],
          _buyFilterListData = $scope.buyFilterListData,
          _keys = Object.keys(_buyFilterListData);

        _keys.forEach(function (key, index) {
//          _dataLabels.push(_buyFilterListData[key])
          if(index == 0){
            _dataLabels = _buyFilterListData[key];
          }
          else {
            _dataLabels = _.intersection(_dataLabels, _buyFilterListData[key]);
          }
        });

        return _dataLabels;

//        return _.intersection(_dataLabels);

      }

    }]);