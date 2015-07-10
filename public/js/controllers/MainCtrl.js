angular.module('stockAppHomeCtrlMD', []).
  controller('stockAppHomeCtrl', [
    '$scope',
    'CoreHttpSV',
    function ($scope, CoreHttpSV) {

    console.log("Core sErvice : ", CoreHttpSV)

      $scope.tagline = 'To the moon and back!';

    }]);