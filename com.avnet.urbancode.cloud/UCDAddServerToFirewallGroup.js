/**
 * 
 */
importPackage(com.avnet.urbancode.cloud.http);
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
var name = props.get("groupName");
var serverName = props.get("serverName");
var cloudName = props.get("cloudName");
var networkName = props.get("networkName");
var subnetName = props.get("subnetName");
var blocking = false;
if (!props.get("blocking").empty && props.get("blocking").equals("true")) {
	blocking = true;
}
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
		print("Unable to retrieve cloud by name:  " + cloudName);
		System.exit(1);
	}
	var networks = new RSNetworks(httpClient);
	var network_id = networks.id(networkName, cloud_id);
	if (!network_id) {
		print("Unable to retrieve network by name:  " + networkName);
		System.exit(1);
	}
	
	var subnets = new RSSubnets(httpClient);
	var subnet_id = subnets.id(subnetName, cloud_id, network_id);
	if (!subnet_id) {
		print("Unable to retrieve subnet by name:  " + subnetName);
		System.exit(1);
	}
	
	var sg = new RSSecurityGroups(httpClient);
	var sg_id = sg.id(name, cloud_id, network_id);
	if (!sg_id) {
		print("Unable to retrieve security group by name:  " + name);
		System.exit(1);
		
	}
	
	
	
	var servers = new RSServers(httpClient);
	var sg_ids = [];
	sg_ids[0] = sg_id;
	var ok = servers.changeSecurityGroup(serverName, cloud_id, sg_ids, blocking, subnet_id);
	
	if (ok != "ok") {
		print("Failed to change to Server : " + serverName);
		System.exit(1);
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();