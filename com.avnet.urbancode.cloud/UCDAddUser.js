/**
 * 
 */
importPackage(com.avnet.urbancode.cloud.http);
importPackage(java.io);
var System = java.lang.System;
var args = arguments;
var pd = args[2];
load(pd + "/scripts/RSOAuth.js", pd + "/scripts/RSUtils.js", pd + "/scripts/RSNetworks.js", pd + "/scripts/UCDPluginTool.js");
load(pd + "/scripts/RSServers.js");
load(pd + "/scripts/RSExecution.js");
load(pd + "/scripts/RSVolumes.js");
load(pd + "/scripts/RSUsers.js");

var pluginTool = new UCDPluginTool(args[0], args[1]);
var props = pluginTool.getStepProperties();
var refreshToken = props.get("refreshToken");
var firstName = props.get("firstName");
var lastName = props.get("lastName");
var email = props.get("email");
var company = props.get("company");
var phone = props.get("phone");
var password = false;
if (!props.get("password").empty) {
	password = props.get("password");
}
try {
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth(refreshToken, httpClient);
	var oaok = oAuthO.updateHttpClient();
	if (oaok != "ok") {
		print("Unable to authenticate to RightScale server.");
		System.exit(1);
	}

	var users = new RSUsers(httpClient);

	var user_id = users.id(firstName, lastName);
	if (user_id) {
		print("User exists : " + firstName + ", " + lastName);
		System.exit(1);
		
	}
	
	var ok = users.create(firstName, lastName, email, company, phone, password);
	if (ok != "ok") {
		print("Failed to create user : " + firstName + ", " + lastName);
		System.exit(1);
	}
	
	var user_id = users.id(firstName, lastName);
	
	if (!user_id) {
		print("Unable to find after creating user : " + firstName + ", " + lastName);
		System.exit(1);
		
	}
	
	var permissions = new RSPermissions(httpClient);
	ok = permissions.create(user_id, "observer");
	if (ok != "ok") {
		print("Unable to set initial permissions on user : " + firstName + ", " + lastName);
		System.exit(1);
		
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();