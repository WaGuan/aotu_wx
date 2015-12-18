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
  res.status(200).send('api page');
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

// 获取自定义菜单列表，每次创建都会重新获取一次access_token
// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=xxx&secret=xxx
// method: GET  
router.get('/menu_list', function(req, res, next){
  async.auto({
    // 重新拉取access_token
    get_token: function( callback ){
      var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret;  
      request.get(url, function( error, response, body ){
        if( !error ){          
          callback( null, JSON.parse(body) );
        }else{
          callback( 'get_token_error', body );
        }        
      });
    },
    // 获取菜单
    menu_list: ['get_token',function( callback, results ){

      var access_token = results.get_token && results.get_token.access_token;

      if( !access_token ){
        callback( 'get_token_error', results);
      }

      var url = 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token=' + access_token;

      request.get({
        url: url
      }, function( error, httpResponse, body ){        
        if( !error ){
          callback( null, JSON.parse(body) );
        } else {
          callback( 'menu_list_error', body );
        }
      });
    }]
  }, function( err, results ){
    if( !err ){
      res.status(200).send(results);
    }else{      
      log.error('GET /menu_list error : ' + err + ',results: ' + JSON.stringify(results));
      res.status(500).send('哦哦，好像出错了，更多错误查看日志吧');
    }    
  })  
});

// 创建自定义菜单或个性化菜单，每次创建都会重新获取一次access_token
// https://api.weixin.qq.com/cgi-bin/menu/create?access_token=xxx
// method: POST
// param: key(可传可不传)
router.get('/menu_create', function(req, res, next){
  
  // 若传入key则表示创建【个性化菜单】，匹配key，如传入key为menu_group1，则匹配 menu_group1；若无传入key则使用默认菜单创建
  var key = req.query.key;
  var form = !!key ? config[ key ] : config[ 'menu' ]; // 菜单栏配置
  var url = !!key ? 'https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=' : 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=';

  async.auto({
    // 重新拉取access_token
    get_token: function( callback ){
      var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret;  
      request.get(url, function( error, response, body ){
        if( !error ){
          callback( null, JSON.parse(body) );
        }else{        
          callback( 'get_token_error', body );
        }
      });
    },
    // 创建菜单
    menu_create: ['get_token', function( callback, results ){

      var access_token = results.get_token && results.get_token.access_token;
      if( !access_token ){
        callback('get_token_error', results);
      }      
      console.log( url + access_token );
      request.post({
        url: url + access_token,
        form: form
      }, function( error, httpResponse, body ){
        if( !error ){
          callback( null, JSON.parse(body) );
        } else {
          
          callback( 'menu_create_error', body );
        }
      });
    }]
  }, function( err, results ){
    if( !err ){
      res.status(200).send(results);  
    }else{
      log.error('GET /api/menu_create: ' + error + ' results: ' + JSON.stringify(body));
      res.status(500).send('创建自定义菜单失败，更多请查看日志.')
    }
    
  })  
});

// 删除个性化菜单
router.get('/menu_del', function(req, res, next){
  var menuid = req.query.menuid;
  if( !menuid ){
    res.status(500).send('请传入menuid');
  }
  async.auto({
    // 重新拉取access_token
    get_token: function( callback ){
      var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret;  
      request.get(url, function( error, response, body ){
        if( !error ){
          callback( null, JSON.parse(body) );
        }else{        
          callback( 'get_token_error', body );
        }
      });
    },
    // 删除
    menu_del: ['get_token', function( callback, results ){

      var access_token = results.get_token && results.get_token.access_token;
      if( !access_token ){
        callback('get_token_error', results);
      }      

      var url = 'https://api.weixin.qq.com/cgi-bin/menu/delconditional?access_token=' + access_token;
      var form = {
        "menuid": menuid
      }
      request.post({
        url: url + access_token,
        form: form
      }, function( error, httpResponse, body ){
        if( !error ){
          callback( null, JSON.parse(body) );
        } else {          
          callback( 'menu_del_error', body );
        }
      });
    }]
  }, function( err, results ){
    if( !err ){
      res.status(200).send(results);  
    }else{
      log.error('GET /api/menu_del: ' + error + ' results: ' + JSON.stringify(body));
      res.status(500).send('删除自定义菜单失败，更多请查看日志.')
    }
    
  }) 
});

module.exports = router;
