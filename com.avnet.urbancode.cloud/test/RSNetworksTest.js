testManagerNetworks = function() {
	var System = java.lang.System;
	importPackage(com.avnet.urbancode.cloud.http);
	load("./scripts/RSOAuth.js");
	load("./scripts/RSUtils.js", "./scripts/RSServers.js");
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
	oAuthO.updateHttpClient();
	//var rsSG = new RSSecurityGroups(httpClient);
	//var ok = rsSG.create("test", "test", 1);
	//var id = rsSG.id("test", 1);
	//print(id);
	//var undf;
	//ok = rsSG.addRuleGroup("test", "592608662671", 1, "icmp", undf, undf, "ingress", -1, -1);
	//ok = rsSG.addRuleCIDR_IP("test", 1, "tcp", "0.0.0.0/0", 22, 22, "ingress");
	//ok = rsSG.ruleList("test", 1);
	//ok = rsSG.destroyRule(0, "test", 1);
	//ok = rsSG.destroy(id, 1);

	var rsClouds = new RSClouds(httpClient);

	var cloud_id = rsClouds.id("EC2 us-east-1");

	var rsNetworks = new RSNetworks(httpClient);
	rsNetworks.create("default", "172.31.0.0/16", cloud_id);


	var network_id = rsNetworks.id("default", cloud_id);
	print(network_id);
	rsNetworks.update(network_id, "Default New");

	var rsSubnets = new RSSubnets(httpClient);
	rsSubnets.create("Default Subnet", "172.31.22.0/16", cloud_id, network_id);

	var rsIPAddresses = new RSIPAddresses(httpClient);
	rsIPAddresses.create("Default IP Address", cloud_id, "", network_id);



	rsIPAddresses.destroy("Default IP Address", cloud_id);
	rsSubnets.destroy("Default Subnet", cloud_id, network_id);
	rsNetworks.destroy("Default New", cloud_id);
};

testManageSecurityGroups = function() {
	var System = java.lang.System;
	importPackage(com.avnet.urbancode.cloud.http);
	load("./scripts/RSOAuth.js");
	load("./scripts/RSUtils.js", "./scripts/RSServers.js", "./scripts/RSNetworks.js");
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
	oAuthO.updateHttpClient();
	var nets = new RSNetworks(httpClient);
	var network_id = nets.id("test3", 1)
	var rsSG = new RSSecurityGroups(httpClient);
	var ok = rsSG.create("test", "test", 1, network_id);
	var id = rsSG.id("test", 1, network_id);
	print(id);
	var undf;
	ok = rsSG.addRuleGroup("group test", "test", network_id, "592608662671", 1, "icmp", undf, undf, "ingress", -1, -1);
	ok = rsSG.addRuleCIDR_IP("cidr test", "test", network_id, 1, "tcp", "0.0.0.0/0", 22, 22, "ingress");
	ok = rsSG.ruleList("test", 1, network_id);
	ok = rsSG.destroyRule(0, "test", 1, network_id);
	ok = rsSG.destroy(id, 1, network_id);
	
};

testManageSecurityGroups();

