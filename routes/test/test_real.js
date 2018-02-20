var express = require('express')
var app = express()
var router = express.Router()


router.get('/', function(req, res){
  console.log("test.js GET")
  // res.redirect('/test');
  res.render('test_real', {'testValue' : "안드로이드 통신테스트"})
});


module.exports = router;
