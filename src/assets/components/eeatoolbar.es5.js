'use strict';

app.component("eeaToolbar", {
	template: '<style></style><div id="pagefoot" class="row">\n        <div class="col-sm-4">\n            <div class="switch round tiny">\n                <span>{{$ctrl.validation}}</span>\n                <span ng-show="$ctrl.scp.ValidationDisabled" class="ng-hide">{{$ctrl.off}}</span>\n                <span ng-show="!$ctrl.scp.ValidationDisabled">{{$ctrl.on}}</span>\n                <div id="switch">\n\t                <label  for="validationSwitch" class="vswitch">\n\t  \t\t<input type="checkbox"  id="validationSwitch" class="switch-input" checked ng-click="$ctrl.toggleValidation()" type="checkbox" data-toggle="toggle">\n\t  \t\t<div class="slider round"></div>\n\t\t</label>\n\t</div>\n            </div> \n        </div>\n        <div class="col-md-8 text-right buttons">\n            <button ng-click="save()">{{$ctrl.save}}</button>\n            <button ng-click="printPreview()">{{$ctrl.printpreview}}</button>\n            <button ng-click="close()">{{$ctrl.close}}</button>\n        </div>\n    </div>',
	bindings: {
		validation: '@',
		on: '@',
		off: '@',
		save: '@',
		printpreview: '@',
		close: '@',
		scp: '='
	},
	controller: function controller() {
		var parent = this;
		this.$onInit = function () {

			this.toggleValidation = function () {
				parent.scp.ValidationDisabled = !parent.scp.ValidationDisabled;
			};

			this.printPreview = function () {
				var conversionLink = [formApplicationUrl("/download/convert", urlProperties.baseURI, urlProperties.sessionID, urlProperties.fileID), "&conversionId=", HTMLconversionNumber].join("");
				$window.open(conversionLink, '_blank');
			};

			this.save = function () {
				dataRepository.saveInstance($scope.Webform);
			};

			this.close = function () {
				if (urlProperties.baseURI == '') {
					urlProperties.baseURI = "/";
				};
				var windowLocation = urlProperties.envelope && urlProperties.envelope.length > 0 ? urlProperties.envelope : urlProperties.baseURI;
				if (parent.scp.Webform.$dirty) {
					if ($window.confirm('You have made changes in the questionnaire! \\n\\n Do you want to leave without saving the data?')) {
						window.location = windowLocation;
					}
				} else {
					window.location = windowLocation;
				}
			};
		};
	}
});
