/**
 * 工具类
 * author: SkyCai
 */

var request = require('request');

// token过期时间
var expireTime = 7200;

var Util = {
    getToken: getToken,
    createTimeStamp: createTimeStamp,
    isExpireTimeOut: isExpireTimeOut
}

// 获取token函数，优先从缓存中获取，若无缓存或缓存过期则重新拉去token
function getToken( config, _callback ){
  var obj = {};

  if( !config.appid || !config.secret ){
    obj = {
      err: true,
      msg: 'appid或者secret为空！请填写config/config.js的相关字段'
    };
    _callback( obj );
  }

  var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.appid + '&secret=' + config.secret;  
  var _requestToken = function( config, callback ){
    request.get(url, function( error, response, body ){
      if( !error && response.statusCode == 200 ){        
        config.cached = JSON.parse(body);
        config.cached.timestamp = createTimeStamp();
        callback({
          err: false,
          data: config.cached
        });
      }else{
        log.error('/api/token: ' + error + ' body: ' + body);
        callback({
          err: true,
          msg: '拉取access_token失败'
        });
      }
    });
  }
  if( config.cached && config.cached.timestamp ){
    var ts = createTimeStamp();
    if( isExpireTimeOut( ts ) ){
      _requestToken( config, function( result ){
        _callback( result );
      });
    } else {
      obj = {
        err: false,
        data: config.cached
      }
      console.log('从缓存中获取token');
      _callback( obj );
    }
  } else {
    _requestToken( config, function( result ){
        _callback( result );
    });
  }  
}

// 时间戳
function createTimeStamp(){
  return '' + parseInt( new Date().getTime() / 1000 );
}

// 判断时间戳是否过期
// 返回值： true为过期，false为不过期
function isExpireTimeOut( ts ){
  if( !ts ){
    throw '请传入参数ts';
  }
  return !!( createTimeStamp() - ts > expireTime )
}

module.exports = Util;