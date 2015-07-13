// grab the mongoose module
var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var DataSchema = new Schema({
  Title: {type: String, default: ''},
  Date: { type: Object, default: '' },
  Price: { type: Object, default: '' },
  Volume: { type: Object, default: ''},
  Value : {type: Object, default: ''},
  PE : {type: Object, default: ''},
  PBV : {type: Object, default: ''},
  MarketCap : {type : Object, default: ''},
  DividendYield : {type : Object, default: ''},
  Beta : {type : Object, default: ''},
  DojiStarPattern : {type : Object, default: ''},
  ChillStarPattern : {type : Object, default: ''}
});

module.exports = mongoose.model('firstOneData', DataSchema, 'sixthFiles');
