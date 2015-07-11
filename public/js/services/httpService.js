angular.module('stockAppHttpSVMD', []).
  factory('CoreHttpSV', [
    '$http',
    '$q',
    '$timeout',
    function ($http, $q, $timeout) {
      this.httpSV = function (config, scope) {
        var canceler;

        if (config.data) {
          config = angular.copy(config); //angular.copy used to remove $$hashKey s
        }
        config.timeout = config.timeout ? config.timeout : 45000;

        if (scope && typeof config.timeout === "number") {
          canceler = $q.defer();
          $timeout(function () {
            canceler.resolve();
          }, config.timeout);

          scope.$on("$destroy", function () {
            canceler.resolve();
          });

          config.timeout = canceler.promise;
        }


        return $http(config).then(function (response) {
          return response.data;
        }, function (error) {
          var deferred = $q.defer();
          console.log('Error while communicating with the server', error);
          deferred.reject(error);
          return deferred.promise;
        });
      };

      this.getData = function (config) {
        return $http(config);
      };

      return this;


    
}]);