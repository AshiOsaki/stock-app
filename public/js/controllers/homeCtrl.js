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

      $scope.fetchStockDetails = function (stockName) {
        var _config = {
          url: '',
          method: 'GET'
        };
        CoreSV.httpSV(_config).then(function (data) {
          console.log(data);
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


    }]);