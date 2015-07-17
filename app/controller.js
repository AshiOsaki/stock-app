module.exports = function (app) {

  var dataModel = require('./models/dataModel');
  var parse = require('csv-parse');
  var fs = require('fs');
  var q = require('q');
  var path = require('path');
  var _ = require('underscore');
  var moment = require('moment');

  var message,
    filePath = path.join(__dirname, '../uploads/dataContainer.csv');


  exports.getTitles = function (req, res) {

    dataModel.find({}, {"Title": true}, function (err, data) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(200, data);
    });
  };

  exports.getMinMaxValues = function (req, res) {

    var title = req.query.title;

    dataModel.find({"Title": title}, function (err, data) {
      if (err) {
        return handleError(res, err);
      }

      var minMaxValues = {
        "Volume" : _.min(data[0].Volume.value) + ' - ' + _.max(data[0].Volume.value),
        "Value" : _.min(data[0].Value.value) + ' - ' + _.max(data[0].Value.value),
        "PE" : _.min(data[0].PE.value) + ' - ' + _.max(data[0].PE.value),
        "PBV" : _.min(data[0].PBV.value) + ' - ' + _.max(data[0].PBV.value),
        "MarketCap" : _.min(data[0].MarketCap.value) + ' - ' + _.max(data[0].MarketCap.value),
        "DividendYield" : _.min(data[0].DividendYield.value) + ' - ' + _.max(data[0].DividendYield.value),
        "Beta" : _.min(data[0].Beta.value) + ' - ' + _.max(data[0].Beta.value)
      };

      return res.send(200, minMaxValues);
    });
  };

  exports.getData = function (req, res) {

    var title = req.query.title;

    dataModel.find({"Title": title}, function (err, data) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(200, data);
    });
  };

  exports.postData = function (req, res) {

    message = "File received. ";

    var fileName = req.files.file.originalname.split(".")[0];

    //Check whether the record exist or not
    dataModel.find({"Title": fileName}, function (err, data) {
      if (err) {
        return handleError(res, err);
      }
      if (data.length) {
        message += "Record already exists ... removing. ";
        console.log(message);

        dataModel.remove({"Title": fileName}, function (err, data) {
          if (err) {
            return handleError(res, err);
          }
          if (data) {
            message += "Removed. ";
            console.log(message);

            preprocessAndSaveData(fileName).then(function(message){
              console.log("Sending back response after removing.");
              return res.send(200, {"File": fileName, "Status":message});
            });
          }
        });
      }else {
        preprocessAndSaveData(fileName).then(function(message){
          console.log("Sending back response after inserting.");
          return res.send(200, {"File": fileName, "Status":message});
        });
      }
    });
  };

  function preprocessAndSaveData(fileName) {
    var deferred = q.defer();

    var jsonData,
      dateValue = [],
      priceValue = [],
      volumeValue = [],
      valueValue = [],
      peValue = [],
      pbvValue = [],
      marketCapValue = [],
      dividendYieldValue = [],
      betaValue = [],
      dojiStarPatternValue = [],
      chillStarPatternValue = [];

    var parser = parse({delimiter: ','}, function(err, output){

      var fileLength = output.length;

      for(var i= 1, j=0; i<fileLength; i++,j++) {
        dateValue[j] = moment(output[i][0],"DD-MM-YYYY");
        priceValue[j] = parseInt(output[i][1]);
        volumeValue[j] = output[i][2];
        valueValue[j] = output[i][3];
        peValue[j] = output[i][4];
        pbvValue[j] = output[i][5];
        marketCapValue[j] = output[i][6];
        dividendYieldValue[j] = output[i][7];
        betaValue[j] = output[i][8];
        dojiStarPatternValue[j] = output[i][9];
        chillStarPatternValue[j] = output[i][10];
      }

      var dateObj = {
          "name": "Date",
          "value": dateValue
        },
        priceObj = {
          "name": "Price",
          "value": priceValue
        },
        volumeObj = {
          "name": "Volume",
          "value": volumeValue
        },
        valueObj = {
          "name": "Value",
          "value": valueValue
        },
        peObj = {
          "name": "PE",
          "value": peValue
        },
        pbvObj = {
          "name": "PBV",
          "value": pbvValue
        },
        marketCapObj = {
          "name": "MarketCap",
          "value": marketCapValue
        },
        dividendYieldObj = {
          "name": "DividendYield",
          "value": dividendYieldValue
        },
        betaObj = {
          "name": "Beta",
          "value": betaValue
        },
        dojiStarPatternObj = {
          "name": "DojiStarPattern",
          "value": dojiStarPatternValue
        },
        chillStarPatternObj = {
          "name": "ChillStarPattern",
          "value": chillStarPatternValue
        };

      jsonData = {
        "Title": fileName,
        "Date": dateObj,
        "Price": priceObj,
        "Volume": volumeObj,
        "Value": valueObj,
        "PE": peObj,
        "PBV": pbvObj,
        "MarketCap": marketCapObj,
        "DividendYield": dividendYieldObj,
        "Beta": betaObj,
        "DojiStarPattern": dojiStarPatternObj,
        "ChillStarPattern": chillStarPatternObj
      };

      var record = new dataModel(jsonData);

      record.save(function (err, record) {
        if (err) {
          console.log(err);
          deferred.reject(err);
        }
        if(record){
          message += "Saved. ";
          console.log(message);

          deferred.resolve(message);
        }
      });
    });

    var input = fs.createReadStream(filePath);

    input.pipe(parser);

    return deferred.promise;

  }

  return exports;
};