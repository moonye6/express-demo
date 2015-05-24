var http = require('http');
var path = require('path');
var express = require('express');
var app = express();

app.use(require('./route/cgi'));

//public是静态资源目录
app.use(express.static(path.join(__dirname, 'public')));
app.listen(80)

//启动程序时可自动打开网页
require('child_process').exec('start http://www.example.com')
