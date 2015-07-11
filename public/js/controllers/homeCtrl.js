angular.module('stockAppHomeCtrlMD', []).
  controller('stockAppHomeCtrl', [
    '$scope',
    'CoreHttpSV',
    function ($scope, CoreHttpSV) {
      $scope.dummySearchElement = [
        "ABC Company",
        "DEF Company",
        "ADC Company",
        "FINQ Company",
        "Globe Company",
        "BILL Company",
        "PRO Company",
        "STO Company"
      ];

      $scope.fetchStockDetails = function(stockName){
        var _config = {
          url: '',
          method: 'GET'
        };
        CoreSV.httpSV(_config).then(function (data) {
          console.log(data);
        },function (error) {
          console.log('Error while adding customer: ', error);
          $scope.$emit('processIndicator', false);
        })
      }



    }]);