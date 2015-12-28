var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');

// Aotu公众号配置信息
var config = require('../config/config').wx_config.aotu;

// 日志
var log = require('log4js').getLogger('api');

// 工具类
var util = require('../util/util');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('api page');
});

// 获取 access_token 
// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=xxx&secret=xxx
// method: GET
router.get('/token', function(req, res, next){
  util.getToken( config, function( result ){
    if( result.err ){
      res.status(500).send(result.msg);
    } else {
      res.status(200).send( result.data );
    }
  });
});

// 获取自定义菜单列表
// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=xxx&secret=xxx
// method: GET  
router.get('/menu_list', function(req, res, next){
  util.getToken( config, function( result ){
    if( result.err ){
      res.status(500).send(result.msg);
    } else {
      var access_token = result.data.access_token;
      var url = 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token=' + access_token;

      request.get({
        url: url
      }, function( error, httpResponse, body ){        
        if( !error ){
          res.status(200).send( JSON.parse(body) );
        } else {
          log.error('/api/menu_list' + JSON.stringify(body) );
          res.status(500).send('获取menu_list出错，更多错误信息请查看日志');
        }
      });
    }
  });  
});

// 创建自定义菜单或个性化菜单
// https://api.weixin.qq.com/cgi-bin/menu/create?access_token=xxx
// method: POST
// param: key(可传可不传)
router.get('/menu_create', function(req, res, next){
  
  // 若传入key则表示创建【个性化菜单】，匹配key，如传入key为menu_group1，则匹配 menu_group1；若无传入key则使用默认菜单创建
  var key = req.query.key;
  var form = !!key ? config[ key ] : config[ 'menu' ]; // 菜单栏配置
  var url = !!key ? 'https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=' : 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=';

  util.getToken( config, function( result ){
    if( result.err ){
      res.status(500).send(result.msg);
    } else {
      var access_token = result.data.access_token;

      request.post({
        url: url + access_token,
        form: form
      }, function( error, httpResponse, body ){
        if( !error ){
          res.status(200).send( JSON.parse(body) );
        } else {
          log.error('/api/menu_create' + JSON.stringify(body) );
          res.status(500).send( '创建菜单失败，更多错误请看日志' );
        }
      });

    }
  });  
});

// 删除个性化菜单
router.get('/menu_del', function(req, res, next){
  var menuid = req.query.menuid;
  if( !menuid ){
    res.status(500).send('请传入menuid');
  }

  util.getToken( config, function( result ){
    if( result.err ){
      res.status(500).send(result.msg);
    } else {
      var access_token = result.data.access_token;
      var url = 'https://api.weixin.qq.com/cgi-bin/menu/delconditional?access_token=' + access_token;
      var form = {
        "menuid": menuid
      }
      request.post({
        url: url + access_token,
        form: form
      }, function( error, httpResponse, body ){
        if( !error ){
          res.status(200).send( JSON.parse(body) );          
        } else {          
          log.error('/api/menu_del' + JSON.stringify( body ) );
          res.status(500).send('删除菜单失败，更多信息请查看日志');
        }
      });
    }
  }); 
});

module.exports = router;
