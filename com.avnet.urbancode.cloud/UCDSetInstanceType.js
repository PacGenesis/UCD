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

var pluginTool = new UCDPluginTool(args[0], args[1]);
var props = pluginTool.getStepProperties();
var refreshToken = props.get("refreshToken");
var serverName = props.get("serverName");
var instanceTypeName = props.get("instanceTypeName");
try {
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth(refreshToken, httpClient);
	var oaok = oAuthO.updateHttpClient();
	if (oaok != "ok") {
		print("Unable to authenticate to RightScale server.");
		System.exit(1);
	}

	var servers = new RSServers(httpClient);

	var server_id = servers.id(serverName);
	if (!server_id) {
		print("Server not found by name : " + serverName);
		System.exit(1);
	}
	
	var server = servers.show(server_id);
	
	var cloud_id = RSUtils.findHrefId(server.next_instance.links, "cloud");
	
	var instts = new RSInstanceTypes(httpClient);
	var instancetype_id = instts.id(instanceTypeName, cloud_id);
	if (!instancetype_id) {
		print("Instance type not found by name :  " + instanceTypeName);
		System.exit(1);
	}
	
	var ok = servers.changeInstanceType(serverName, instancetype_id);
	if (ok != "ok") {
		print("Failed to change instance type.");
		System.exit(1);
	}
	
	
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();