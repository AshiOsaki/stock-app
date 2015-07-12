module.exports = function(app) {
  var multer         = require('multer');
  var Ctrl = require('./controller.js')(app);

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

  app.get('/api/getData', Ctrl.getData) ;

  app.post('/api/postData', [multer({
    dest: './uploads/',
    rename: function (fieldname, filename){
      return 'dataContainer';
    }})], Ctrl.postData);

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('/', function(req, res) {
		res.sendfile('./public/index.html');
	});

};