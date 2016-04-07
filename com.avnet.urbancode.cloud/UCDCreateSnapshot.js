/**
 * 
 */
importPackage(com.avnet.urbancode.cloud.http);
var System = java.lang.System;
var args = arguments;
var pd = args[2];
load(pd + "/scripts/RSOAuth.js", pd + "/scripts/RSUtils.js", pd + "/scripts/RSNetworks.js", pd + "/scripts/UCDPluginTool.js");
load(pd + "/scripts/RSServers.js");
load(pd + "/scripts/RSVolumes.js");

var pluginTool = new UCDPluginTool(args[0], args[1]);
var props = pluginTool.getStepProperties();
var refreshToken = props.get("refreshToken");
var volumeName = props.get("volumeName");
var snapshotName = props.get("snapshotName");
var description;
if (!props.get("description").empty)
	description = props.get("description");
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
	
	
	var volumes = new RSVolumes(httpClient);
	
	var volume_id = volumes.id(volumeName, cloud_id);
	
	if (!volume_id) {
		print("Failed to find volume : " + volumeName);
		System.exit(1);
	}
	
	var vss = new RSVolumeSnapshots(httpClient);
	
	var ok = vss.create(snapshotName, cloud_id, description, volume_id);
	if (ok != "ok") {
		print("Failed to create snapshot : " + snapshotName);
		System.exit(1);
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();