/**
 * 
 */
importPackage(com.avnet.urbancode.cloud.http);
var System = java.lang.System;
var args = arguments;
var pd = args[2];
load(pd + "/scripts/RSOAuth.js", pd + "/scripts/RSUtils.js", pd + "/scripts/RSNetworks.js", pd + "/scripts/UCDPluginTool.js");
load(pd + "/scripts/RSServers.js");

var pluginTool = new UCDPluginTool(args[0], args[1]);
var props = pluginTool.getStepProperties();
var refreshToken = props.get("refreshToken");
var name = props.get("groupName");
var description;
if (!props.get("description").empty)
	description = props.get("description");
var networkName;
if (!props.get("networkName").empty)
	networkName = props.get("networkName");
var cloudName = props.get("cloudName");
try {
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth(refreshToken, httpClient);
	var oaok = oAuthO.updateHttpClient();
	if (oaok != "ok") {
		print("Unable to authenticate to RightScale server.");
		System.exit(1);
	}
	
	
	var clouds = new RSClouds(httpClient);
	
	var cloud_id = clouds.id(cloudName);
	if (!cloud_id) {
		print("Unable to retrieve cloud by name.");
		System.exit(1);
	}
	
	var network_id;
	if (networkName) {
		var networks = new RSNetworks(httpClient);
		network_id = networks.id(networkName, cloud_id);
	}
	
	var securityGroups = new RSSecurityGroups(httpClient);
	
	var ok = securityGroups.create(name, description, cloud_id, network_id);
	
	if (ok != "ok") {
		print("Failed to create Security Group : " + name);
		System.exit(1);
	}
	
	var items = securityGroups.list(name, cloud_id);
	if (items.length > 0) {
		var group = items[0];
		var ruid = group.resource_uid;
		pluginTool.setOutputProperty("sourceGroupID", ruid);
		pluginTool.storeOutputProperties();
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();