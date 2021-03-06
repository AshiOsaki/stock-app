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

      $scope.buyDojiStarPattern = {
        isPressed: false,
        value: 0
      };
      $scope.buyChillStarPattern = {
        isPressed: false,
        value: 0
      };
      $scope.sellDojiStarPattern = {
        isPressed: false,
        value: 0
      };
      $scope.sellChillStarPattern = {
        isPressed: false,
        value: 0
      };

      $scope.buyFilterListData = {
      };

      $scope.sellFilterListData = {
      };

      $scope.buyParameterList = {
        "Volume": "Volume",
        "Value": "Value",
        "P/E": "PE",
        "P/BV": "PBV",
        "Market Cap": "MarketCap",
        "Dividend Yield": "DividendYield",
        "Beta": "Beta"
      };

      $scope.sellParameterList = {
        "Volume": "Volume",
        "Value": "Value",
        "P/E": "PE",
        "P/BV": "PBV",
        "Market Cap": "MarketCap",
        "Dividend Yield": "DividendYield",
        "Beta": "Beta"
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

          $scope.dateTime = angular.copy($scope.data.Date.value);
          $scope.prices = angular.copy($scope.data.Price.value);

          $scope.createChartConfig();

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
            if (_stockList[i].substring(0, _stingToCheck.length).toLowerCase() === _stingToCheck.toLowerCase() || _stockList[i].substring(0, _stingToCheck.length).toUpperCase() === _stingToCheck.toUpperCase()) {
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
        var min = parseFloat($scope.minMaxValues[$scope.buyCardSelections.parameter].split('-')[0]);
        var max = parseFloat($scope.minMaxValues[$scope.buyCardSelections.parameter].split('-')[1]);


        if (typeof($scope.buyCardSelections.value) != 'number') {
          alert("Please enter number only")
        }
        else if ($scope.buyCardSelections.value > max || $scope.buyCardSelections.value < min) {
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
          deleteParametersFromList($scope.buyParameterList, 'Buy');

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
        addParametersToList($scope.buyFilterList[index].parameter, 'Buy');
        $scope.buyFilterList.splice(index, 1);

        $scope.reDrawChart();
      };

      $scope.addToSellFilter = function () {
        var min = parseFloat($scope.minMaxValues[$scope.sellCardSelections.parameter].split('-')[0]);
        var max = parseFloat($scope.minMaxValues[$scope.sellCardSelections.parameter].split('-')[1]);

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
          deleteParametersFromList($scope.sellParameterList, 'Sell');

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
        addParametersToList($scope.sellFilterList[index].parameter, 'Sell');
        $scope.sellFilterList.splice(index, 1);


        $scope.reDrawChart();
      };

      function formatDataForConfig() {

        var usefulData = [], arr=[];

        for (var i=0; i<$scope.dateTime.length; i++){
          arr.push($scope.dateTime[i]);
          arr.push($scope.prices[i]);
          usefulData.push(arr);
          arr=[];
        }

        return usefulData;

      }

      $scope.createChartConfig = function () {

        var data = formatDataForConfig();

        $scope.config = {
          chart: {
            type: 'line',
            zoomType: 'x'
          },
          navigator : {
            enabled: true,
            adaptToUpdatedData: false,
            series : {
              data : data
            }
          },
          scrollbar: {
            liveRedraw: false
          },
          rangeSelector : {
            buttons: [{
              type: 'month',
              count: 3,
              text: '3m'
            }, {
              type: 'month',
              count: 6,
              text: '6m'
            }, {
              type: 'year',
              count: 1,
              text: '1y'
            }, {
              type: 'year',
              count: 3,
              text: '3y'
            }, {
              type: 'year',
              count: 5,
              text: '5y'
            }, {
              type: 'all',
              text: 'All'
            }],
            inputEnabled: true, // it supports only days
            selected : 2 // all
          },
          title: {
            text: $scope.data.Title
          },
          tooltip:{
            shared: true
          },
          yAxis: [{
            title:{
              text: "Price in USD"
            },
            floor: 0
          },{
            title:{
              text: "Profit"
            },
            floor: -100,
            opposite: false
          }],
          credits: {
            enabled: false
          },
          plotOptions: {
            line: {
              dataLabels: {
                enabled: false,
                formatter: function () {
                }
              }
            }

          },
          series : [{
            name: "Price",
            data : data,
            dataGrouping: {
              enabled: false
            },
            tooltip: {
              valueSuffix: '$'
            },
            id: 'dataseries'
          },{}]
        };

        $scope.$broadcast("DrawChart", $scope.config);

      };

      $scope.reDrawChart = function () {

        var _buyDataObj = _createDataLabels($scope.buyFilterListData, "Buy");
        var _sellDataObj = _createDataLabels($scope.sellFilterListData, "Sell");
        var _flagList = _createDataFlagList(_buyDataObj.dataFlagList, _sellDataObj.dataFlagList);

        var criticalData = criticalDataLabels(_buyDataObj.dataLabels, _sellDataObj.dataLabels);

        var totalProfit = calculateProfitLoss(criticalData);

        $scope.chart.series[1].update({
          name: 'Profit',
          data: totalProfit,
          color: 'orange',
          yAxis:1,
          tooltip: {
            valueSuffix: '%'
          }
        });

        $scope.chart.get('flagList') ? $scope.chart.get('flagList').remove() : null;
        $scope.chart.addSeries(_flagList);
        $scope.chart.redraw();
      };

      var criticalDataLabels = function (_buyDataLabels, _sellDataLabels) {

        var totalLabelsLength = _.union(_buyDataLabels, _sellDataLabels).length;
        var mainDataLabels = [],
          mainDataIndex = [];

        var bLength = _buyDataLabels.length;
        var sLength = _sellDataLabels.length;

        _buyDataLabels[_buyDataLabels.length] = 99999;
        _sellDataLabels[_sellDataLabels.length] = 99999;

        for (var m = 0, b = 0, s = 0; m < totalLabelsLength; m++) {
          if (_buyDataLabels[b] < _sellDataLabels[s]) {
            mainDataLabels[m] = _buyDataLabels[b];
            mainDataIndex[m] = 1;
            if (b < bLength)
              b++;
          } else if (_buyDataLabels[b] > _sellDataLabels[s]) {
            mainDataLabels[m] = _sellDataLabels[s];
            mainDataIndex[m] = -1;
            if (s < sLength)
              s++;
          } else {
            mainDataLabels[m] = _buyDataLabels[b];
            mainDataIndex[m] = 1;
            if (b < bLength && m < sLength) {
              b++;
              s++;
            }
          }
        }
        _buyDataLabels.splice(_buyDataLabels.length - 1, 1);
        _sellDataLabels.splice(_sellDataLabels.length - 1, 1);

        return {
          "mainDataLabels": mainDataLabels,
          "mainDataIndex": mainDataIndex
        }
      };

      var calculateProfitLoss = function (criticalData) {
        var dataPoints = criticalData.mainDataLabels,
          sellBuy = criticalData.mainDataIndex,
          profitSeries = [],
          timestamp;

        $scope.buyCount=0;
        $scope.sellCount=0;
        $scope.holdCount=0;
        $scope.logs1 = [];
        $scope.logs2 = [];
        $scope.logs3 = [];
        $scope.backtestingSummary = '';
        $scope.backtestingPerc = 0;


        var prev, curr, sellValue, profitPerc,
          buyValue = $scope.prices[criticalData.mainDataLabels[0]];

        var lastSell,
          initialBuy = angular.copy(buyValue);

        $scope.logs1[0] = "1 is " + buyValue +"$ (Buy Point)                  Status: Buy";

        for (var i = 0, p = 0, l = 1; i < dataPoints.length-1; i++) {
          prev = sellBuy[i];
          curr = sellBuy[i + 1];

          if (prev == 1 && curr == -1) {
            sellValue = $scope.prices[criticalData.mainDataLabels[i + 1]];
            timestamp = $scope.dateTime[criticalData.mainDataLabels[i + 1]];
            profitPerc = (((sellValue - buyValue) * 100) / buyValue);
            profitSeries[p] = [timestamp, profitPerc] ;
            $scope.logs1[l] = (l+1) +" is " + sellValue +"$ (Sell Point) : Profit ("+
              sellValue +"-"+buyValue+")/"+buyValue+" = "+(((sellValue - buyValue)* 100)/buyValue).toFixed(2)+"%   ------->   Status: Sell";
            lastSell = sellValue;
            l++;
            p++;
            $scope.sellCount++;

            if($scope.backtestingSummary)
              $scope.backtestingSummary = $scope.backtestingSummary.concat(" + ");
            $scope.backtestingSummary = $scope.backtestingSummary.concat(profitPerc.toFixed(2));

            if(!$scope.backtestingPerc)
              $scope.backtestingPerc = parseFloat((profitPerc).toFixed(2));
            else
              $scope.backtestingPerc += parseFloat((profitPerc).toFixed(2));
          }
          else if (prev == -1 && curr == 1) {
            buyValue = $scope.prices[criticalData.mainDataLabels[i + 1]];
            $scope.logs1[l] = (l+1) +" is " + buyValue +"$ (Buy Point) Status: Buy";
            l++;
            $scope.buyCount++;
          }
          else if (prev == 1 && curr == 1) {
            $scope.logs1[l] = (l+1) +" is " + $scope.prices[criticalData.mainDataLabels[i + 1]] +"$ (Buy Point) Status: Hold";
            l++;
            $scope.holdCount++;
          }
          else {
            $scope.logs1[l] = (l+1) +" is " + $scope.prices[criticalData.mainDataLabels[i + 1]] +"$ (Sell Point) Status: Invalid";
            l++;
          }
        }

        var stockPerc = (((lastSell - initialBuy)*100)/initialBuy).toFixed(2);
        $scope.stockSummary = "("+lastSell+" - "+initialBuy+") / "+initialBuy+" = "
          + stockPerc +"%";

        $scope.backtestingGain =  $scope.backtestingPerc +" - "+ stockPerc+" = "+($scope.backtestingPerc - stockPerc)+"%";

        return profitSeries;
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

      var _createDataLabels = function (filterList, filterListType) {
        var _dataLabels = [],
          _filterListData = filterList,
          _keys = Object.keys(_filterListData),
          _dates = $scope.data.Date.value,
          _dataFlagList = [],
          _tempObj ={};

          _keys.forEach(function (key, index) {
            if (index == 0) {
              _dataLabels = _filterListData[key];
            }
            else {
              _dataLabels = _.intersection(_dataLabels, _filterListData[key]);
            }
          });

          _dataLabels.forEach(function (dataPointIndex) {
            _tempObj = {
              x: _dates[dataPointIndex],
              title: filterListType,
              color: filterListType === 'Buy' ? 'green' : 'red'
            };
            _dataFlagList.push(_tempObj);
          });

          return {
            dataLabels: _dataLabels,
            dataFlagList: _dataFlagList
          };

      };

      function _createDataFlagList(buyDataFlagList, sellDataFlagList){
        var _dataFlagList = {
          type : 'flags',
          data : buyDataFlagList.concat(sellDataFlagList),
          onSeries : 'dataseries',
          shape : 'circlepin',
          width : 16,
          id: "flagList"
        };
        return _dataFlagList;
      }

      $scope.toggleDojiStar = function (card) {
        var _filter;
        if (card === 'buy') {
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
        if (card === 'sell') {
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

      $scope.toggleChillStar = function (card) {
        var _filter;
        if (card === 'buy') {
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
        if (card === 'sell') {
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

      function deleteParametersFromList(list, hint){
        var param;
        if(hint == 'Buy')
          param = $scope.buyCardSelections.parameter;
        else if (hint == 'Sell')
          param = $scope.sellCardSelections.parameter;

        switch(param){
          case 'PE': delete list['P/E'];
            break;
          case 'PBV': delete list['P/BV'];
            break;
          case 'MarketCap': delete list['Market Cap'];
            break;
          case 'DividendYield': delete list['Dividend Yield'];
            break;
          default: delete list[param];
            break;
        }

        if(hint == 'Buy'){
          $scope.buyCardSelections.parameter = list[Object.keys(list)[0]];
        console.log(Object.keys(list)[0]);}
        else if (hint == 'Sell')
          $scope.sellCardSelections.parameter = list[Object.keys(list)[0]];
      }

      function addParametersToList(param, hint) {
        var list;
        if(hint == 'Buy')
          list = $scope.buyParameterList;
        else if (hint == 'Sell')
          list = $scope.sellParameterList;

        switch(param){
          case 'Volume': angular.extend(list, {"Volume": "Volume"});
            break;
          case 'Value': angular.extend(list, {"Value": "Value"});
            break;
          case 'PE': angular.extend(list, {"P/E": "PE"});
            break;
          case 'PBV': angular.extend(list, {"P/BV": "PBV"});
            break;
          case 'MarketCap': angular.extend(list, {"P/BV": "PBV"});
            break;
          case 'DividendYield': angular.extend(list, {"Dividend Yield": "DividendYield"});
            break;
          case 'Beta': angular.extend(list, {"Beta": "Beta"});
            break;
          default: break;
        }

        if(hint == 'Buy')
          $scope.buyCardSelections.parameter = list[Object.keys(list)[0]];
        else if (hint == 'Sell')
          $scope.sellCardSelections.parameter = list[Object.keys(list)[0]];
      }
    }]);