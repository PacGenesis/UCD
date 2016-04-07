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
var name = props.get("networkName");
var description;
if (!props.get("description").empty)
	description = props.get("description");
var cloudName = props.get("cloudName");
var cidrBlock;
if (!props.get("cidrBlock").empty)
	cidrBlock = props.get("cidrBlock");
var instanceTenancy;
if (!props.get("instanceTenancy").empty)
	instanceTenancy = props.get("instanceTenancy");
var gatewayName;
if (!props.get("gatewayName").empty)
	gatewayName = props.get("gatewayName");
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
	
	var networks = new RSNetworks(httpClient);
	
	var network_id = networks.id(name, cloud_id);
	
	if (network_id) {
		print("Network exits.");
		System.exit(1);
		
	}
	
	var ok = networks.create(name, cidrBlock, cloud_id, description, instanceTenancy);
	
	if (ok != "ok") {
		print("Failed to create network : " + name);
		System.exit(1);
	}
	
	if (gatewayName) {
		var network_id = networks.id(name, cloud_id);
		var gateways = new RSGateways(httpClient);
		ok = gateways.assocNetwork(gatewayName, cloud_id, network_id);
		if (ok != "ok") {
			networks.destroy(name, cloud_id);
			print("Failed to associate gateway : " + gatewayName);
			System.exit(1);
		}
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();