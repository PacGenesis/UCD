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
var name = props.get("subnetName");
var networkName = props.get("networkName");
var description;
if (!props.get("description").empty)
	description = props.get("description");
var cloudName = props.get("cloudName");
var cidrBlock = props.get("cidrBlock");
var serverName;
if (!props.get("serverName").empty)
	serverName = props.get("serverName");
var datacenterName;
if (!props.get("datacenterName").empty)
	datacenterName = props.get("datacenterName");
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
	
	var network_id = networks.id(networkName, cloud_id);
	
	if (!network_id) {
		print("Failed to get network : " + name);
		System.exit(1);
	}
	
	var instance_id;
	if (serverName) {
		var servers = new RSServers(httpClient);
		instance_id = servers.instanceId(serverName);
	}
	
	var datacenter_id;
	if (datacenterName) {
		var dcs = new RSDataCenters(httpClient);
		
		datacenter_id = dcs.id(datacenterName, cloud_id);
		if (!datacenter_id) {
			print("Data Center not found by name :  " + name);
			System.exit(1);
			
		}
	}
	
	var subnets = new RSSubnets(httpClient);
	var subnet_id = subnets.id(name,cloud_id, network_id, instance_id);
	if (subnet_id) {
		print("Subnet exists by name : " + name);
		System.exit(1);
	}
	
	var ok = subnets.create(name, cidrBlock, cloud_id, network_id, instance_id, description, datacenter_id);
	
	if (ok != "ok") {
		print("Unable to create subnet:  " + name);
		System.exit(1);
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();