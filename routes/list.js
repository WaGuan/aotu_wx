var express = require('express');
var router = express.Router();
var request = require('superagent');

var jssdk = require('../api/jssdk');
var config = require('../config/config');
var appid = config.appid;

// 获取文章列表
router.get('/', function(req, res, next) {

    var key = req.query.key;
    var searchUrl = config.search_url;

    request
        .get( searchUrl + key )
        .end( function(err, resp){
            var result = JSON.parse(resp.text);
            if( result.rtn === 0 ){
                res.render('page/list',{ searchurl: config.search_url + key, result: result,data: {noncestr:'111',timestamp:'222',sinature:'333'}, appid: '1234567890'});                
            }
        });
  
  // var url = req.query.url || 'http://weinre.qiang.it/aotu_wx/list';

  // new jssdk( url, function( data ){
  //   console.log(data,'data');
  //   res.render('page/list',{ data: data, appid: appid});  
  // });
  
});

module.exports = router;
