var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var config = require('../config/config');
var appid = config.appid;
var secret = config.secret;
var log = require('log4js').getLogger('api');

/* GET home page. */
router.get('/', function(req, res, next) {
  
});

// 获取 access_token 
// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=xxx&secret=xxx
// method: GET
router.get('/token', function(req, res, next){
  if( !appid || !secret ){
    res.status(200).send('appid或者secret为空！请填写config/config.js的相关字段');    
  }
  var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret;  
  request.get(url, function( error, response, body ){
    if( !error && response.statusCode == 200 ){
      config['access_token'] = JSON.parse(body).access_token;
      res.status(200).send(body);
    }else{
      log.error('/api/token: ' + error + ' body: ' + body);
      res.status(500).send('拉取access_token失败');
    }
  });
});

// 创建自定义菜单，每次创建都会重新获取一次access_token
// https://api.weixin.qq.com/cgi-bin/menu/create?access_token=xxx
// method: POST
router.get('/menu_create', function(req, res, next){
  async.auto({
    // 重新拉取access_token
    getToken: function( callback ){
      var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret;  
      request.get(url, function( error, response, body ){
        if( !error && response.statusCode == 200 ){
          callback( JSON.parse(body).access_token );
        }else{
          log.error('/api/token: ' + error + ' body: ' + body);
          callback('error');
        }
      });
    },
    // 创建菜单
    menuCreate: ['getToken',function( callback, results ){
      log.info('创建菜单token: ' +results);
      var access_token = results.getToken;

      if( access_token == 'error' ){
        callback('error');
      }

      var url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + access_token;
      var form = config.menu; //菜单栏配置        

      request.post({
        url: url,
        form: form
      }, function( error, httpResponse, body ){
        if( !error ){
          callback( body );
        } else {
          log.error('/api/menu_create: ' + error + ' body: ' + body);
          callback('error');
        }
      });
    }]
  }, function( err, results ){
    res.status(200).send(results);
  })  
});

module.exports = router;
