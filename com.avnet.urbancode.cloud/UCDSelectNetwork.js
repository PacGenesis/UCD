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
var networkName = props.get("networkName");
var subnetName = props.get("subnetName");
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
		print("Failed to access server : " + serverName);
		System.exit(1);
		
	}
	var server = servers.show(server_id);
	var cloud_id = RSUtils.findHrefId(server.next_instance.links, "cloud");
	
	var networks = new RSNetworks(httpClient);
	var network_id = networks.id(networkName, cloud_id);
	if (!network_id) {
		print("Failed to access network by name : " + networkName);
		System.exit(1);
		
	}
	
	var sns = new RSSubnets(httpClient);
	var subnet_id = sns.id(subnetName, cloud_id, network_id);
	if (!subnet_id) {
		print("Failed to access subnet by name : " + subnetName);
		System.exit(1);
		
	}
	
	var ok = servers.selectNetwork(server_id, subnet_id);
	if (ok != "ok") {
		print("Unable to change network selection.");
		System.exit(1);
		
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();