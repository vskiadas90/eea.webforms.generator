app.config([ '$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode( {
	  enabled: true,
	  requireBase: false
	});
}]);

app.component("lookup",{
	template: '<select ng-model="$ctrl.ngModel" ng-change="$ctrl.updateLookup()" name="$ctrl.name" ng-options="option{{$ctrl.luValue}} as option{{$ctrl.luOption}} for option in $ctrl.data | orderBy:\'{{$ctrl.luOrder}}\'" class="slookup"  style="box-shadow: 0px!imporant;" required><option value="">-----</option></select>',
	bindings: {
		ngModel: '@',
		lookup: '@',
		name: '@',
		luValue : '@' ,
		luOption : '@' ,
		luOrder : '@' ,
		luData: '@',
		autoselect: '@',
		hideonautoselect: '@',
		scp: '='
	},
	controller: function($http, $translate, $location) {
		var parent = this;
		this.$onInit = function() {
			(function() {
				$http.get(parent.lookup).then( function(response) {
					parent.data = response.data[parent.luData];
					if (parent.autoselect) {
						let qs = $location.search()['countrycode'];
						let fdata = parent.data.filter(function (item) {
							if (item[eval(parent.luValue)] == qs) return true;
						});
						if (fdata.length > 0) {
							parent.ngModel = qs;	
							if (parent.hideonautoselect == 1 && $location.search()['countrycode']){
								parent.scp['h_' + parent.name] = 1;
							}
						}
					}
				});
			})();
			this.updateLookup = function() {
			};

		}
	}
});