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
var serverName = props.get("serverName");
var device = props.get("device");
var snapshotName = props.get("snapshotName");
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
		print("Unable to retrieve server by name :  " + serverName);
		System.exit(1);
	}
	
	var server = servers.show(server_id);
	var cloud_id = RSUtils.findHrefId(server.next_instance.links, "cloud");
	
	
	var vss = new RSVolumeSnapshots(httpClient);	
	var snapshot_id = vss.id(snapshotName, cloud_id);
	if (!snapshot_id) {
		print("Failed to find snapshot : " + snapshotName);
		System.exit(1);
	}
	
	var ok = servers.revertToSnapshot(server_id, device, snapshot_id);
	if (ok != "ok") {
		print("Failed to set device, " + device + " to snapshot :  " + snapshotName);
		System.exit(1);
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();