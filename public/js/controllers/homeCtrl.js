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
        value: ''
      };
      $scope.sellCardSelections = {
        parameter: 'Volume',
        operator: '<',
        value: ''
      };

      $scope.buyDojiStarPattern =  {
        isPressed : false,
        value: 0
      };
      $scope.buyChillStarPattern = {
        isPressed : false,
        value: 0
      };
      $scope.sellDojiStarPattern =  {
        isPressed : false,
        value : 0
      };
      $scope.sellChillStarPattern = {
        isPressed : false,
        value: 0
      };

      $scope.buyFilterListData = {
      };

      $scope.sellFilterListData = {
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

      function fetchMinMaxValues(stockName) {
        var _config = {
          url: 'http://128.199.114.191:8080/api/getMinMaxValues',
          method: 'GET',
          params: {"title": stockName},
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
          $scope.createChartConfig(-365, 365);

        }, function (error) {
          console.log('Error while fetching stock details: ', error);
          $scope.$emit('processIndicator', false);
        })
      }

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

      $scope.addToBuyFilter = function () {
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
          value: $scope.buyCardSelections.value,
          isInEditMode: false
        };
        $scope.buyFilterList.push(_filter);
        $scope.buyFilterListData[_filter.parameter] = _getValues(_filter);
        $scope.reDrawChart();
        }
      };

      $scope.editBuyFilter = function (index) {
        $scope.buyFilterList[index].isInEditMode = true;
      };

      $scope.saveBuyFilter = function (index) {
        $scope.buyFilterList[index].isInEditMode = false;
        var _filter = $scope.buyFilterList[index];
        $scope.buyFilterListData[_filter.parameter] = _getValues(_filter);
        $scope.reDrawChart();
      };

      $scope.removeFromBuyFilter = function (index) {
        delete $scope.buyFilterListData[$scope.buyFilterList[index].parameter];
        $scope.buyFilterList.splice(index, 1);
        $scope.reDrawChart();
      };

      $scope.addToSellFilter = function () {
        var min = parseInt($scope.minMaxValues[$scope.sellCardSelections.parameter].split('-')[0]);
        var max = parseInt($scope.minMaxValues[$scope.sellCardSelections.parameter].split('-')[1]);

        if (typeof($scope.sellCardSelections.value) != 'number') {
          alert("Please enter number only")
        }
        else if ($scope.sellCardSelections.value > max || $scope.sellCardSelections.value < min) {
          alert("The value of this field should be more than " + min + " and less than " + max);
        }
        else {
          var _filter = {
            parameter: $scope.sellCardSelections.parameter,
            operator: $scope.sellCardSelections.operator,
            value: $scope.sellCardSelections.value,
            isInEditMode: false
          };
          $scope.sellFilterList.push(_filter);

          $scope.sellFilterListData[_filter.parameter] = _getValues(_filter);
          $scope.reDrawChart();
        }
      };

      $scope.editSellFilter = function (index) {
        $scope.sellFilterList[index].isInEditMode = true;
      };


      $scope.saveSellFilter = function (index) {
        $scope.sellFilterList[index].isInEditMode = false;
        var _filter = $scope.sellFilterList[index];
        $scope.sellFilterListData[_filter.parameter] = _getValues(_filter);
        $scope.reDrawChart();
      };

      $scope.removeFromSellFilter = function (index) {
        delete $scope.sellFilterListData[$scope.sellFilterList[index].parameter];
        $scope.sellFilterList.splice(index, 1);
        $scope.reDrawChart();
      };

      function formatDataForConfig(indexToStartFrom, totalDataPoints) {

        $scope.dataIndex = indexToStartFrom;
        $scope.dataPoints = totalDataPoints;

        var dates = $scope.data.Date.value.splice($scope.dataIndex, $scope.dataPoints);
        var prices = $scope.data.Price.value.splice($scope.dataIndex, $scope.dataPoints);

        var usefulData = {
          "dates": dates,
          "prices": prices
        };

        return usefulData;

      }

      $scope.createChartConfig = function (indexToStartFrom, totalDataPoints) {

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
          credits: {
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

        var _buyDataLabels = _createDataLabels($scope.buyFilterListData);
        var _sellDataLabels = _createDataLabels($scope.sellFilterListData);

        var _options = $scope.chart.series[0].options;
        _options.dataLabels.enabled = true;
        _options.dataLabels.formatter = function () {
          var _index = this.point.index;
          if (_buyDataLabels.indexOf(_index) == -1) {
            if (_sellDataLabels.indexOf(_index) == -1) {
              return ''
            }
            else {
              return 'Sell';
            }
          }
          else {
            return 'Buy';
          }
        };
        $scope.chart.series[0].update(_options);
        $scope.chart.redraw();
      };

      var _getValues = function (filter) {
        var _data = $scope.data[filter.parameter].value,
          _dataArray = [];
        switch (filter.operator) {
          case '<':
            _data.forEach(function (value, index) {
              parseInt(value) < filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
          case '>':
            _data.forEach(function (value, index) {
              parseInt(value) > filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
          case '=':
            _data.forEach(function (value, index) {
              parseInt(value) == filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
          case '<=':
            _data.forEach(function (value, index) {
              parseInt(value) <= filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
          case '>=':
            _data.forEach(function (value, index) {
              parseInt(value) >= filter.value ? _dataArray.push(index) : ''
            });
            return _dataArray;
            break;
        }
      };

      var _createDataLabels = function (filterList) {
        var _dataLabels = [],
          _filterListData = filterList,
          _keys = Object.keys(_filterListData);

        _keys.forEach(function (key, index) {
          if (index == 0) {
            _dataLabels = _filterListData[key];
          }
          else {
            _dataLabels = _.intersection(_dataLabels, _filterListData[key]);
          }
        });

        return _dataLabels;
      };

      $scope.toggleDojiStar = function(card){
        var _filter;
        if(card === 'buy'){
          $scope.buyDojiStarPattern.isPressed = true;
          $scope.buyDojiStarPattern.value = $scope.buyDojiStarPattern.value == 0 ? 100 : 0;

          _filter = {
            parameter: 'DojiStarPattern',
            operator: '=',
            value: $scope.buyDojiStarPattern.value
          };
          $scope.buyFilterListData[_filter.parameter] = _getValues(_filter);
          $scope.reDrawChart();
        }
        if(card === 'sell'){
          $scope.sellDojiStarPattern.isPressed = true;
          $scope.sellDojiStarPattern.value = $scope.sellDojiStarPattern.value == 0 ? -100 : 0;

          _filter = {
            parameter: 'DojiStarPattern',
            operator: '=',
            value: $scope.sellDojiStarPattern.value
          };
          $scope.sellFilterListData[_filter.parameter] = _getValues(_filter);
          $scope.reDrawChart();
        }
      };

      $scope.toggleChillStar = function(card){
        var _filter;
        if(card === 'buy'){
          $scope.buyChillStarPattern.isPressed = true;
          $scope.buyChillStarPattern.value = $scope.buyChillStarPattern.value == 0 ? 100 : 0;

          _filter = {
            parameter: 'ChillStarPattern',
            operator: '=',
            value: $scope.buyChillStarPattern.value
          };
          $scope.buyFilterListData[_filter.parameter] = _getValues(_filter);
          $scope.reDrawChart();
        }
        if(card === 'sell'){
          $scope.sellChillStarPattern.isPressed = true;
          $scope.sellChillStarPattern.value = $scope.sellChillStarPattern.value == 0 ? -100 : 0;

          _filter = {
            parameter: 'ChillStarPattern',
            operator: '=',
            value: $scope.sellChillStarPattern.value
          };
          $scope.sellFilterListData[_filter.parameter] = _getValues(_filter);
          $scope.reDrawChart();
        }
      };


    }]);