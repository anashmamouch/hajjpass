#!/usr/bin/env node
'use strict';

var fs = require('fs');
var iosHelper = require("./lib/ios-helper");
var utilities = require("./lib/utilities");

module.exports = function(context){
  
  var platforms = context.opts.cordova.platforms;
  var config = fs.readFileSync("config.xml").toString()
  var name = utilities.getValue(config, "name")

  if (utilities.directoryExists("platforms/ios")) {
    var paths = ["GoogleService-Info.plist"];

    for (var i = 0; i < paths.length; i++) {
      if (utilities.fileExists(paths[i])) {
        try {
          var contents = fs.readFileSync(paths[i]).toString();
          fs.writeFileSync("platforms/ios/" + name + "/Resources/GoogleService-Info.plist", contents)
          if (platforms.indexOf("ios") !== -1) {

            var xcodeProjectPath = utilities.getXcodeProjectPath(context, name);

            iosHelper.removeShellScriptBuildPhase(context, xcodeProjectPath);
            iosHelper.addShellScriptBuildPhase(context, xcodeProjectPath, name);
          }
        } catch(err) {
          process.stdout.write(err);
        }

        break;
      }
    }
  }

  if (utilities.directoryExists("platforms/android")) {
    var paths = ["google-services.json"];

    for (var i = 0; i < paths.length; i++) {
      if (utilities.fileExists(paths[i])) {
        try {
          var contents = fs.readFileSync(paths[i]).toString();
          fs.writeFileSync("platforms/android/google-services.json", contents);

          var json = JSON.parse(contents);
          var strings = fs.readFileSync("platforms/android/res/values/strings.xml").toString();

          // strip non-default value
          strings = strings.replace(new RegExp('<string name="google_app_id">([^\@<]+?)<\/string>', "i"), '')

          // strip non-default value
          strings = strings.replace(new RegExp('<string name="google_api_key">([^\@<]+?)<\/string>', "i"), '')

          // strip empty lines
          strings = strings.replace(new RegExp('(\r\n|\n|\r)[ \t]*(\r\n|\n|\r)', "gm"), '$1')

          // replace the default value
          strings = strings.replace(new RegExp('<string name="google_app_id">([^<]+?)<\/string>', "i"), '<string name="google_app_id">' + json.client[0].client_info.mobilesdk_app_id + '</string>')

          // replace the default value
          strings = strings.replace(new RegExp('<string name="google_api_key">([^<]+?)<\/string>', "i"), '<string name="google_api_key">' + json.client[0].api_key[0].current_key + '</string>')

          fs.writeFileSync("platforms/android/res/values/strings.xml", strings);

        } catch(err) {
          process.stdout.write(err);
        }

        break;
      }
    }
  }
}