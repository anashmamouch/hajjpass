userpaApp.factory('xml2jsonFactory', ['x2js',function(x2js) {
	return {
		convertData : function(xmlData) {
			return x2js.xml_str2json(xmlData);
		},
		convertJsonToXml: function(jsonData) {
			return x2js.json2xml_str(jsonData);
		}
	};
}]);