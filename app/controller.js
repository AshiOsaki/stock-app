module.exports = function (app) {

  var dataModel = require('./models/dataModel');


  exports.getData = function (req, res) {
    dataModel.find(function (err, data) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(200, data);
    });
  };

  exports.postData = function (req, res) {
    var processedData = preprocessData(req);
    res.send(processedData);
  };

  function preprocessData(data) {
    return data.body;
  }

  return exports;
};