'use strict';

/**
/ EEA Core
*/
var eea = {
	Loader  : {
		getAllJS : function(scripts) {
			scripts.forEach(function(script) {
				eea.Loader.getJS(script);
			})
		},
		getJS : function(script) {
			var oXmlHttp = new XMLHttpRequest();
			oXmlHttp.onreadystatechange = function() {
				if (oXmlHttp.readyState == 4) {
					if (oXmlHttp.status == 200 || oXmlHttp.status == 304)
						eea.Loader.includeJS(script, oXmlHttp.responseText);
				}
			}
			oXmlHttp.open('GET', script, false);
			oXmlHttp.send(null);
		},
		includeJS : function (fileUrl, source) {
			var script = document.createElement("script");
			script.language = "javascript";
			script.type = "text/javascript";
			script.defer = true;
			script.text = source;
			document.getElementsByTagName('HEAD').item(0).appendChild(script);
		}
	}
}