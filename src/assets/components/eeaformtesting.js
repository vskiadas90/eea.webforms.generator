'use strict';

app.component("eeaFormTesting",{
	template: `
<script src="./assets/js/test/mocha.min.js"></script>
<script src="./assets/js/test/chai.min.js"></script>
<link rel="stylesheet" type="text/css" href="./assets/js/test/mocha.min.css"/>
<style>
#mocha {
	margin: 20px;
}
#mocha-stats {
	position: absolute;
	top: 4px;
	right: 4px;
	border-radius: 5px;
	padding: 5px;
}
</style>
<div id="testd" style="height: 50%;overflow-y: auto;width: 30%;min-width: 350px; z-index: 999;position: fixed;bottom: 0; padding: 10px; margin: 4px; border: solid 1px #ccc;background-color: rgba(255, 255, 255, 0.99); box-shadow: 5px 5px 5px #888888;">	
 <div onclick="$('#testd').hide();" style="border: 1px solid #333;user-select: none;background-color: #333;width: 30px; height: 30px;line-height: 24px;border-radius: 50%;color: #fff;position: fixed;font-size: 16px; font-weight: 900; text-align: center; left: 2px; bottom: 20px;cursor: pointer;">x</div>
<b>Testing Module</b><BR>
<div style="font-size:9px;padding: 5px 0;border-radius:5px;width: 150px;">Remove <b>&lt;eea-form-testing&gt;</b> component rom page source to disable.</div>
 <div id="mocha"></div>
</div>
`,
	bindings: {
		scp: '='
	},
	controller: function() {
		var parent = this;
		this.$onInit = function() {
			$(function() {
			setTimeout( function() {
				mocha.setup('bdd');
				var expect = chai.expect;
				
				describe("Testing eea form js library", function() {
					it('selected langauge should be "en"', function(done) {
						expect(parent.scp.selectedLanguage).to.equal("en");
						done();
					});
				});

				describe("Testing angular", function() {
					it('document should have a $scope', function(done) {
						expect(parent.scp).to.not.be.undefined;
						done();
					});
				});
				
				describe("Testing jquery", function() {
					it('document should acknowledge the variable $', function(done) {
						expect($).to.not.be.undefined;
						done();
					});
				});

				describe("Testing form. performing autofill...", function() {
					$("form").each(function(){
						$(this).find(':input').each(function(index, item){
							var itype = item.type;
							if (!itype) return;
							
							item = $(item);
							
							var iname = item.attr("name");
							if (!iname) return;
							if (iname.indexOf('$')  > -1) {
								iname = iname.split('$')[0];
							}

							var valToEnter;
							switch(itype) {
							case "text" :
								valToEnter = "eea-form-testing : autofilled";
								item.val(valToEnter);
								break;
							case "number" :
								valToEnter = item.attr("min") || item.attr("max") || 1;
								item.val(valToEnter);
								break;
							case "date" :
								valToEnter = (function() {
										var today = new Date();
										var dd = today.getDate();
										var mm = today.getMonth()+1; 
										var yyyy = today.getFullYear();
										if(dd < 10)  dd = '0' + dd;
										if(mm < 10) mm = '0' + mm;
										return  yyyy +'-' + mm + '-' + dd;
									})();
								item.val(valToEnter);
								break;
							case "select-one":
								var options = item.find('option');
								var sopt = options[Math.floor(Math.random() * options.length)];
								sopt.selected = true
								valToEnter = $(sopt).text();
								break;
							case "checkbox":
								valToEnter = "on";
								item.prop("checked", true);
								break;
							default:
								
							}

							it(iname + '  should be "' +  valToEnter + '"', function(done) {
								item.trigger("input"); 
								item.trigger("change"); 
								var itemv
								if (itype === 'select-one')
									itemv = $(item).find("option:selected").text();
								else
									itemv = item.val();	
								expect(itemv).to.equal(valToEnter);
								done();
							});
						});
					});
				});

				if ($('#Row').attr("multi") == 1) {
					describe("Multirow detected... Testing new row", function() {
						it('form should have two rows', function(done) {
							var fnc = parent.scp.addRow('form1', 'Row');
							expect(parent.scp.groups.form1.Row.length).to.equal(2);
							done();
						});
					});
				}

				describe("Performing form submition emulation", function() {
					it('should log form elements below', function(done) {
						var fnc = parent.scp.submit(null, true);
						var objs = parent.scp.field;
						var objsStr = "<b>Form submition emulation data:</b><BR><BR>";
						for (var form in objs) {
							var frmObj = objs[form];
							for (var element in frmObj) {
								var elname = element;
								if (elname.indexOf('$')  > -1) {
									elname = elname.split('$')[0];
								}
								objsStr += elname + " = " + frmObj[element] + "<BR>";
							}
						};
						var pdiv = $("<div style=\"position:relative;background-color:gold;color:#333;padding:20px;font-size:10px;\">" + objsStr + "</div>").appendTo('#mocha');
						expect(fnc).to.equal(false);
						done();
					});
				});

				

				mocha.run();
			}, 1500);
			});
		}
	}
});