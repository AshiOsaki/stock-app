// grab the mongoose module
var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var DataSchema = new Schema({
  Date: { type: Date, default: '' },
  Price: { type: Number, default: '' },
  Volume: { type: Number, default: ''},
  Value : {type: Number, default: ''},
  PE : {type: String, default: ''},
  PBV : {type: String, default: ''},
  MarketCap : {type : String, default: ''},
  DividendYield : {type : String, default: ''},
  Beta : {type : String, default: ''},
  DojiStarPattern : {type : String, default: ''},
  ChillStarPattern : {type : String, default: ''}
});

module.exports = mongoose.model('firstOneData', DataSchema, 'firstOne');
