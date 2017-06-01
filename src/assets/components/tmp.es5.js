'use strict';

app.component("eeaFormTesting", {
	template: '\n<script src="./assets/js/test/mocha.min.js"></script>\n<script src="./assets/js/test/chai.min.js"></script>\n<link rel="stylesheet" type="text/css" href="./assets/js/test/mocha.min.css"/>\n<style>\n#mocha-stats {\n    position: absolute;\n    top: 2px;;\n    right: 10px;\n}\n</style>\n<div style="width: 30%; min-width: 300px; z-index: 999; position: fixed;bottom: 0; padding: 10px; margin: 4px; border: solid 1px #ccc;background-color: rgba(255, 255, 255, 0.98); box-shadow: 5px 5px 5px #888888;">\t\n<b>Testing Module</b><BR>\n<div style="font-size:11px;">Remove &lt;eea-form-testing&gt;<BR>component to disable.</div>\n <div id="mocha"></div>\n</div>\n',
	bindings: {
		scp: '='
	},
	controller: function controller() {
		var parent = this;
		this.$onInit = function () {
			mocha.setup('bdd');
			var expect = chai.expect;

			describe("Testing eea form js library", function () {
				it('selected langauge should be "en"', function (done) {
					expect(parent.scp.selectedLanguage).to.equal("en");
					done();
				});
			});

			describe("Testing angular", function () {
				it('should have a $scope', function (done) {
					expect(parent.scp).to.not.be.undefined;
					done();
				});
			});

			describe("Testing jquery", function () {
				it('should acknowledge the variable $', function (done) {
					expect($).to.not.be.undefined;
					done();
				});
			});

			mocha.run();
		};
	}
});