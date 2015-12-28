var express = require('express');
var router = express.Router();

var jssdk = require('../api/jssdk');
var config = require('../config/config');
var appid = config.appid;

// 获取文章列表
router.get('/', function(req, res, next) {
  
  var url = req.query.url || 'http://weinre.qiang.it/aotu_wx/list';

  new jssdk( url, function( data ){
    console.log(data,'data');
    res.render('page/list',{ data: data, appid: appid});  
  });
  
});

module.exports = router;
