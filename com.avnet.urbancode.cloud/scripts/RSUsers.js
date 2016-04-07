function RSUsers(httpClient) {
	this.httpClient = httpClient;
}

RSUsers.prototype = {
		create : function(firstName, lastName, email, company, phone, password) {
			var parms = [];
			var i = 0;
			parms[i++] = "user[first_name]=" + firstName;
			parms[i++] = "user[last_name]=" + lastName;
			parms[i++] = "user[email]=" + email;
			parms[i++] = "user[company]=" + company;
			parms[i++] = "user[phone]=" + phone;
			if (password)
				parms[i++] = "user[password]=" + password;
			var jparms = RSUtils.convertParms(parms);
			var ok = this.httpClient.doPost(RSUtils.HOST + "/api/users.json", jparms);
			if (ok.trim() == "") {
				return "ok";
			} else {
				return "Failed";
			};
				
		},
		
		list : function(firstName, lastName) {
			var parms = [];
			var i = 0;
			parms[i++] = "filter[]=first_name==" + firstName;
			parms[i++] = "filter[]=last_name==" + lastName;
			
			var jparms = RSUtils.convertParms(parms);
			var ok = "var items = " + this.httpClient.doGet(RSUtils.HOST + "/api/users.json", jparms);
			eval(ok);
			return items;
		},
		
		id : function(firstName, lastName)	{
			var items = this.list(firstName, lastName);
			
			for (var i = 0; i < items.length; i++) {
				var user = items[i];
				if (user.first_name == firstName && user.last_name == lastName) {
					return RSUtils.findHrefId(user.links, "self");
				}
			}
			
			return "";
			
		}
	};

function RSPermissions(httpClient) {
	this.httpClient = httpClient;
}

RSPermissions.prototype = {
	create : function(user_id, permissionTitle) {
		var parms = [];
		var i = 0;
		parms[i++] = "permission[user_href]=/api/users/" + user_id;
		parms[i++] = "permission[role_title]=" + permissionTitle;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/permissions.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		};
		
	},
	
	list : function(user_id, permissionTitle) {
		var parms = [];
		var i = 0;
		parms[i++] = "filter[]=user_href==/api/users/" + user_id;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/permissions.json", jparms);
		if (ok.startsWith("[")) {
			ok = "var items = " + ok;
		} else {
			var items = [];
			return items;
		}
		eval(ok);
		if (permissionTitle) {
			var outItems = [];
			var j = 0;
			for (var i = 0; i < items.length; i++) {
				
				if (permissionTitle == items[i].role_title) {
					outItems[j] = items[i];
					j++;
				}
			}
			return outItems;
		}
		return items;
		
	},
	
	destroy : function(user_id, permissionTitle) {
		var items = this.list(user_id, permissionTitle);
		var ok = RSUtils.deleteItems(items, this.httpClient);
		return ok;
	}
		
};
