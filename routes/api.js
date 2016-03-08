var express = require('express');
var router = express.Router();
var request = require('request');
var superagent = require('superagent');
var async = require('async');
var path = require('path');

// Aotu公众号配置信息
var config = require('../config/config');
var aotuConfig = require('../config/config').wx_config.aotu;

// 存放爬虫文章列表
var article = [];

// 日志
var log = require('log4js').getLogger('api');

// 工具类
var util = require('../util/util');

// JSSDK
var jssdk = require('../api/jssdk');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('api page');
});

router.get('/rule', function(req, res, next){
  var rule = [
    {
      name: 'aotu.io blog',
      start_url: 'http://aotu.io/notes',
      regex: '\/notes\/\\d+\/\\d+\/\\d+\/.*',
    },
    {
      name: 'aotu.io mac',
      start_url: 'http://aotu.io/mac/docs/',
      regex: '\/mac\/docs\/.*'
    }
  ];
  console.log(JSON.stringify(rule));
  res.status(200).json(rule);
});

// 获取爬取博客文章列表
router.get('/articles', function(req, res, next){
  request.get({
    url: config.article_url
  }, function( error, httpResponse, body ){        
    if( !error ){
      article = JSON.parse(body);
      res.send(article);
    } else {
      //log.error('/api/menu_list' + JSON.stringify(body) );
      res.status(500).send('获取爬取博客文章列表失败');
    }
  });
});

// 获取 access_token 
// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=xxx&secret=xxx
// method: GET
router.get('/token', function(req, res, next){
  util.getToken( aotuConfig, function( result ){
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
  util.getToken( aotuConfig, function( result ){
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
  var form = !!key ? aotuConfig[ key ] : aotuConfig[ 'menu' ]; // 菜单栏配置
  var url = !!key ? 'https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=' : 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=';

  util.getToken( aotuConfig, function( result ){
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

  util.getToken( aotuConfig, function( result ){
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

/**
 * 微信高级群发接口
 */

// 上传缩略图
// https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE
router.get('/media/upload', function(req, res, next){  
  util.getToken( aotuConfig, function( result ){
    if( result.err ){
      res.status(500).send(result.msg);
    } else {
      var access_token = result.data.access_token;
      var type = 'thumb';
      var url = 'http://file.api.weixin.qq.com/cgi-bin/media/upload?access_token=' + access_token + '&type=' + type;      
      var thumb = path.resolve(__dirname,'../public/thumb','css3_200x200.jpg');      
      var formData = {
        filename: thumb,
        name: 'media',
        'content-type': 'image/jpeg'
      }
      superagent
        .post(url)
        .send(formData)
        .end(function(err, httpResponse){
          if( !err ){
            res.send(httpResponse)
          }
        })

      // request({
      //   method: 'POST',
      //   url: url,
      //   postData: {
      //     params: formData
      //   }
      // }, function( error, httpResponse, body ){
      //   if( !error ){
      //     //res.status(200).send( JSON.parse(body) );          
      //     res.status(200).send( httpResponse );
      //   } else {          
      //     //log.error('/api/menu_del' + JSON.stringify( body ) );
      //     console.log(error,httpResponse,body);
      //     //res.status(500).send('删除菜单失败，更多信息请查看日志');
      //   }
      // });      
    }
  });
});

// 上传图文消息素材
// https://api.weixin.qq.com/cgi-bin/media/uploadnews?access_token=ACCESS_TOKEN
router.get('/uploadnews', function(req, res, next){
  util.getToken( aotuConfig, function( result ){
    if( result.err ){
      res.status(500).send(result.msg);
    } else {
      var access_token = result.data.access_token;
      var url = 'https://api.weixin.qq.com/cgi-bin/media/uploadnews?access_token=' + access_token;
      if( !article.length ){
        res.send('请先执行/api/articles');
      }
      var formData = {
         "articles": [
           {
              "thumb_media_id":"IKff0DMih4aS5VTMH_NhuKNusTAl3MJ1Kzzhmx_-tRk0X0CXLpZ8aIk2qDn6OL-b",
              "author":article[0].author,
              "title":article[0].title,
              "content_source_url":article[0].href,
              "content":article[0].content,
              "digest":article[0].title,
              "show_cover_pic":"0"
           }
         ]
      }; 
      request.post({
        url: url,
        formData: formData
      }, function( error, httpResponse, body ){
        if( !error ){
          res.status(200).send( JSON.parse(body) );          
        } else {          
          //log.error('/api/menu_del' + JSON.stringify( body ) );
          res.status(500).send('删除菜单失败，更多信息请查看日志');
        }
      });
    }
  });
});

// JSSDK
router.get('/jssdk', function(req, res, next){
  var url = req.query.url || '';
  if( !!url ){
    new jssdk( url, function( data ){
      res.status(200).send({
        url: data.url,
        noncestr: data.noncestr,
        timestamp: data.timestamp,
        sinature: data.sinature,
        appid: config.wx_config.aotu.appid
      });
    });
  }else{
    res.status(200).send('请传入url');
  }
});

module.exports = router;
