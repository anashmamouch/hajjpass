// Generic constants

var serialNumber = null;
var serialType = null;
var imeiNumber = null;
var uuid = null;
var storageDir = null;
var profilePicture = "Profile.jpg";
var isOnline = true;
var isReady = false;
var isRegister = false;
var isLogged = false;
var devicePlatform = null;
var travel_mode = "walking";
var project = 'colmar';
var appLanguage;
var adminLogin = 'admin_otipass';
var adminPassword = 'd815da6e6920c9c7b657bb76d75cf288';
var adminSalt = 'null';
var syncTime = 3600000; // in millisecond - Default : 1 hour = 3600000 ms
var supportedLanguages = ['en', 'de', 'fr'];
var version = '1.2.0';
var thumbDimension = "-700x400";


//HCE constants

var SAMPLE_LOYALTY_CARD_AID = '4F5449504153532D303031';
var SELECT_APDU_HEADER = '00A40400';
var SELECT_OK_SW = '9000';
var UNKNOWN_CMD_SW = '0000';

// SQLite status
var cOK = 'ok';
var cErr = 'error';

// Provider Categories
var CAT_ISSUER = 1;
var CAT_SUPPLIER = 2;
var CAT_PROVIDER = 3;
var CAT_POINTOFSALE = 4;
var CAT_PROVIDER_POS = 5;
var CAT_PICKUP = 8;
var CAT_RETAILER = 9;

// Pass status
var PASS_CREATED = 1;
var PASS_INACTIVE = 2;
var PASS_ACTIVE = 3;
var PASS_EXPIRED = 4;
var PASS_INVALID = 5;
var PASS_UNDEFINED = 6;

// Pass package
var PASS_P1 = 'P1';
var PASS_P2 = 'P2';

// Near Provider distance
var nearProviderDistance = 50000; // en metres

// User
var USR_PROFILE = 2;

// Webshop
var WEBSHOP_URL = 'https://www.otipass.net/wordpress/';

// Images directory
var IMAGE_PATH = 'Pictures/colmarUser/';

// Google Map API key
var GOOGLE_MAP_API_KEY = 'AIzaSyBaTMgOKLf7InuAUbyqzq0BTllU9wavjSw';

// Test URLs
var test = {
    serverUrl: 'https://test.otipass.net/mobile/',
    urlLogin: project + '/login/userlogin',
    urlAdminLogin: project + '/login/login',
    urlLogout: project + '/login/logout',
    urlInit: project + '/init/user',
    urlUser: project + '/user/user',
    urlGetAccount: project + '/user/getaccount',
    urlUploadAddress: project + '/holder/setaddress',
    urlUploadUser: project + '/holder/setuser',
    urlUploadPerson: project + '/holder/setperson',
    urlGetOtipass: project + '/otipass/get',
    urlHolder: project + '/holder/get',
    urlDownloadImage: project + '/download',
    urlPages: project + '/page/get',
    urlAdvertisement: project + '/advertisement/get',
    imgServerUrl: 'https://test.otipass.net/ot/user/' + project + '/img/ws/',


    urlAssociatePass: '/otipass/associate',
    providerListUrl: project + '/provider/getlist',

    urlProviders: project + '/provider/get',
    urlOpenings: project + '/provider/opening',
    urlEvent: project + '/event/get',
    urlGetDiscount: project + '/discount/get',
    urlGetEventByProvider: project + '/event/get'

}

// Production URLs
var prod = {
    serverUrl: 'https://www.otipass.net/mobile/',
    urlLogin: project + '/login/userlogin',
    urlAdminLogin: project + '/login/login',
    urlLogout: project + '/login/logout',
    urlInit: project + '/init/user',
    urlUser: project + '/user/user',
    urlGetAccount: project + '/user/getaccount',
    urlUploadAddress: project + '/holder/setaddress',
    urlUploadUser: project + '/holder/setuser',
    urlUploadPerson: project + '/holder/setperson',
    urlGetOtipass: project + '/otipass/get',
    urlHolder: project + '/holder/get',
    urlDownloadImage: project + '/download',
    urlPages: project + '/page/get',
    urlAdvertisement: project + '/advertisement/get',
    imgServerUrl: 'https://www.otipass.net/ot/user/' + project + '/img/ws/',

    providerListUrl: project + '/provider/getlist',
    urlAssociatePass: '/otipass/associate',


    urlProviders: project + '/provider/get',
    urlOpenings: project + '/provider/opening',
    urlEvent: project + '/event/get',
    urlGetDiscount: project + '/discount/get',
    urlGetEventByProvider: project + '/event/get'
}
