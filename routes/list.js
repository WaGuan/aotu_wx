var express = require('express');
var router = express.Router();

// 获取文章列表
router.get('/', function(req, res, next) {
  res.render('list', { title: 'page list' });
});

module.exports = router;
