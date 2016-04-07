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
var name = props.get("ipAddressName");
var description;
if (!props.get("description").empty)
	description = props.get("description");
var domain;
if (!props.get("domain").empty)
	domain = props.get("domain");
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
	
	var ipAddresses = new RSIPAddresses(httpClient);
	
	var ok = ipAddresses.create(name, cloud_id, description, network_id, domain);
	
	if (ok != "ok") {
		print("Failed to create IP Address : " + name);
		System.exit(1);
	}
	
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();