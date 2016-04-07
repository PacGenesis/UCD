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
var ruleName = props.get("ruleName");
var name = props.get("groupName");
var cloudName = props.get("cloudName");
var networkName;
if (!props.get("networkName").empty)
	networkName = props.get("networkName");
var sourceType = props.get("sourceType");
var protocol = props.get("protocol");
var direction;
if (!props.get("direction").empty)
	direction = props.get("direction");
var cidrIPS;
if (!props.get("cidrIPS").empty)
	cidrIPS = props.get("cidrIPS");
var sourceGroupOwner;
if (!props.get("sourceGroupOwner").empty)
	sourceGroupOwner = props.get("sourceGroupOwner");
var startPort;
if (!props.get("startPort").empty)
	startPort = props.get("startPort");
var endPort;
if (!props.get("endPort").empty)
	endPort = props.get("endPort");
var icmpType;
if (!props.get("icmpType").empty)
	icmpType = props.get("icmpType");
var icmpCode;
if (!props.get("icmpCode").empty)
	icmpCode = props.get("icmpCode");
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
		pluginTool.setOutputProperty("errorMessage", "Unable to retrieve cloud by name.");
		pluginTool.storeOutputProperties();
		System.exit(1);
	}
	
	var networks = new RSNetworks(httpClient);
	var network_id = networks.id(networkName, cloud_id);
	if (!network_id) {
		print("Unable to retrieve network by name.")
		System.exit(1);
		
	}
	
	var securityGroups = new RSSecurityGroups(httpClient);
	
	var sg_id = securityGroups.id(name, cloud_id, network_id);
	
	if (!sg_id) {
		print("Unable to retrieve group by name:  " + name);
		System.exit(1);
	}
	
	var rules = securityGroups.ruleList(name, cloud_id, ruleName, network_id);
	if (rules.length > 0) {
		print("Rule exists with name :  " + ruleName);
		System.exit(1);
		
	}
	
	var ok;
	if (sourceType == "cidr_ips") {
		ok = securityGroups.addRuleCIDR_IP(ruleName, name, network_id, cloud_id, protocol, cidrIPS, startPort, endPort, direction, icmpType, icmpCode);
	} else {
		ok = securityGroups.addRuleGroup(ruleName, name, network_id, sourceGroupOwner, cloud_id, protocol, startPort, endPort, direction, icmpType, icmpCode);
		
	}
	
	if (ok != "ok") {
		print("Failed to add rule to Security Group : " + name);
		System.exit(1);
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();