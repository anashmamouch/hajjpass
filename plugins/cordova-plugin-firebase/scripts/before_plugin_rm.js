var iosHelper = require("./lib/ios-helper");
var utilities = require("./lib/utilities");
var fs = require("fs");
module.exports = function(context) {
  	var config = fs.readFileSync("config.xml").toString()
	var name = utilities.getValue(config, "name")

    var platforms = context.opts.cordova.platforms;
    // Remove the build script that was added when the plugin was installed.
    if (platforms.indexOf("ios") !== -1) {
        var xcodeProjectPath = utilities.getXcodeProjectPath(context, name);
        iosHelper.removeShellScriptBuildPhase(context, xcodeProjectPath);
    }
};
