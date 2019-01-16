#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var rootdir = "";

var srcFile = path.join(rootdir, "native/android/build-extras.gradle");
var destFile = path.join(rootdir, "platforms/android/build-extras.gradle");
var dir = path.join(rootdir, "platforms/android/");


if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 7777, function(err) {
        if(err){ 
            console.log(err);
            response.send("ERROR! Can't make the directory! \n");    // echo the result back
        }
    });
}

setTimeout(function(){
    fs.createReadStream(srcFile).pipe(fs.createWriteStream(destFile));
}, 0);