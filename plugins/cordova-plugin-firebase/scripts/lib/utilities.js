
/**
 * Utilities and shared functionality for the build hooks.
 */

 var path = require("path");
 var fs = require("fs");

/**
 * Used to get the path to the build.gradle file for the Android project.
 *
 * @returns {string} The path to the build.gradle file.
 */
 function getBuildGradlePath() {
    return path.join("platforms", "android", "build.gradle");
}

module.exports = {

    getValue: function(config, name) {
        var value = config.match(new RegExp('<' + name + '>(.*?)</' + name + '>', "i"));
        if(value && value[1]) {
            return value[1];
        } else {
            return null;
        }
    },

    fileExists: function(path) {
        try  {
            return fs.statSync(path).isFile();
        }
        catch (e) {
            return false;
        }
    },

    directoryExists: function(path) {
        try  
        {
            return fs.statSync(path).isDirectory();
        }
        catch (e) {
            return false;
        }
    },

    /**
     * Used to get the name of the application as defined in the config.xml.
     *
     * @param {object} context - The Cordova context.
     * @returns {string} The value of the name element in config.xml.
     */
     getAppName: function(context) {
        var ConfigParser = context.requireCordovaModule("cordova-lib").configparser;
        var config = new ConfigParser("config.xml");
        return config.name();
    },

    /**
     * The ID of the plugin; this should match the ID in plugin.xml.
     */
     getPluginId: function () {
        return "cordova-plugin-firebase";
    },


    /**
     * Used to get the path to the XCode project's .pbxproj file.
     *
     * @param {object} context - The Cordova context.
     * @returns The path to the XCode project's .pbxproj file.
     */
     getXcodeProjectPath: function(context, appName) {

        return path.join("platforms", "ios", appName + ".xcodeproj", "project.pbxproj");
    },

    /**
     * Used to read the contents of the Android project's build.gradle file.
     *
     * @returns {string} The contents of the Android project's build.gradle file.
     */
     readBuildGradle: function() {
        return fs.readFileSync(getBuildGradlePath(), "utf-8");
    },

    /**
     * Used to write the given build.gradle contents to the Android project's
     * build.gradle file.
     *
     * @param {string} buildGradle The body of the build.gradle file to write.
     */
     writeBuildGradle: function(buildGradle) {
        fs.writeFileSync(getBuildGradlePath(), buildGradle);
    }
};
