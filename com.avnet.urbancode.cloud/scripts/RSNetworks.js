/**
 * RightScale Deployments javascript class.
 */

function RSSecurityGroups(httpClient)
{
	this.httpClient = httpClient;
}

RSSecurityGroups.prototype = {
	create : function(name, desc, cloud_id, network_id)
	{
		var parms = [];
		var i = 0;
		parms[i++] = "security_group[name]=" + name;
		if (desc && !desc.empty)
			parms[i++] = "security_group[description]=" + desc;
		if (network_id)
			parms[i++] = "security_group[network_href]=/api/networks/" + network_id;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/security_groups.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
	},
	
	destroy : function(name, cloud_id, network_id) {
		var items = this.list(name, cloud_id, network_id);
		return RSUtils.deleteItems(items, this.httpClient);
	},
	
	destroyRule : function(ruleName, gname, cloud_id, network_id) {
		var rules = this.ruleList(gname, cloud_id, ruleName, network_id);
		var ok = RSUtils.deleteItems(rules, this.httpClient);
		return ok;
	},
	
	list : function(name, cloud_id, network_id) {
		var parms = [];
		var i = 0;
		if (name) {
			parms[i++] = "filter[]=name==" + name;
		}
		if (network_id) {
			parms[i++] = "filter[]=network_href==/api/networks/" + network_id;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/security_groups.json", jparms);
		return RSUtils.filterByName(ok, name);
		
	},
	
	ruleList : function(gname, cloud_id, ruleName, network_id) {
		var id = this.id(gname, cloud_id, network_id);
		var parms = java.lang.reflect.Array.newInstance(java.lang.String, 0);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/security_groups/" + id + "/security_group_rules.json", parms);
		if (ok.startsWith("[")) {
			ok = "var items = " + ok;
			eval(ok);
		} else {
			var items = [];
			return items;
		}
		if (ruleName) {
			var outItems = [];
			var j = 0;
			for (var i = 0; i < items.length; i++) {
				if (items[i].description == ruleName) {
					outItems[j] = items[i];
					j++;
				}
			}
			return outItems;
		}
		return items;
		
	},
	
	id : function(name,cloud_id, network_id) {
		var grps = this.list(name, cloud_id, network_id);
		return RSUtils.findId(grps,name);
		
	},
	
	
	addRuleCIDR_IP : function(ruleName, gname, network_id, cloud_id, protocol, cidr_ips, beginport, endport, direction, icmptype, icmpcode) {
		var id = this.id(gname, cloud_id, network_id);
//		-d security_group_rule[protocol]=tcp \
//		-d security_group_rule[cidr_ips]='0.0.0.0/0' \                     # Open up for all IP addresses
//		-d security_group_rule[protocol_details][start_port]=22 \          # Enable SSH (port 22)
//		-d security_group_rule[protocol_details][end_port]=22 \            # Must set the start and end ports
//		-d security_group_rule[source_type]=cidr_ips \                     # Create by CIDR IP
		var parms = [];
		var i = 0;
		parms[i++] = "security_group_rule[protocol]=" + protocol;
		if (cidr_ips)
			parms[i++] = "security_group_rule[cidr_ips]=" + cidr_ips;
		if (beginport)
			parms[i++] = "security_group_rule[protocol_details][start_port]=" + beginport;
		if (endport)
			parms[i++] = "security_group_rule[protocol_details][end_port]=" + endport;
		parms[i++] = "security_group_rule[source_type]=cidr_ips";
		if (direction)
			parms[i++] = "security_group_rule[direction]=" + direction;
		if (icmptype)
			parms[i++] = "security_group_rule[protocol_details][icmp_type]=" + icmptype;
		if (icmpcode)
			parms[i++] = "security_group_rule[protocol_details][icmp_code]=" + icmpcode;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPostReturnLocation(RSUtils.HOST + "/api/clouds/" + cloud_id + "/security_groups/" + id + "/security_group_rules", jparms);
		if (!ok.startsWith("/api")) {
			return "Failed";
		}
		var parms = [];
		var i = 0;
		var newrule = RSUtils.findItem(ok, this.httpClient);
		if (newrule) {
			var link = RSUtils.findHref(newrule.links, "self")
			parms[i++] = "security_group_rule[description]=" + ruleName;
			var jparms = RSUtils.convertParms(parms);
			ok = this.httpClient.doPut(RSUtils.HOST + link, jparms);
		}
		return ok;
	},
	
	findNewRule : function(oldList, newList) {
		var hasRuleMap = new java.util.HashMap();
		for (var i = 0; i < oldList.length; i++) {
			var link = RSUtils.findHref(oldList[i].links, "self");
			hasRuleMap.put(link, link);
		}
		for (var i = 0; i < newList.length; i++) {
			var link = RSUtils.findHref(newList[i].links, "self");
			if (!hasRuleMap.containsKey(link)) {
				return newList[i];
			}
		}
		var undef;
		return undef;
	},
	
	addRuleGroup : function(ruleName, gname, network_id, sourceGroupOwner, cloud_id, protocol, beginport, endport, direction, icmptype, icmpcode) {
		var id = this.id(gname, cloud_id, network_id);
//		-d security_group_rule[protocol]=tcp \
//		-d security_group_rule[protocol_details][start_port]=80 \
//		-d security_group_rule[protocol_details][end_port]=80 \
//		-d security_group_rule[source_type]=group \
//		-d security_group_rule[group_owner]=test \
//		-d security_group_rule[group_name]="SG for API Sandbox" \
		var parms = [];
		var i = 0;
		var items = this.list(gname, cloud_id, network_id);
		var groupID = items[0].resource_uid;
		parms[i++] = "security_group_rule[protocol]=" + protocol;
		if (beginport)
			parms[i++] = "security_group_rule[protocol_details][start_port]=" + beginport;
		if (endport)
			parms[i++] = "security_group_rule[protocol_details][end_port]=" + endport;
		parms[i++] = "security_group_rule[source_type]=group";
		if (sourceGroupOwner)
			parms[i++] = "security_group_rule[group_owner]=" + sourceGroupOwner;
		
		parms[i++] = "security_group_rule[group_name]=" + groupID;
		if (direction)
			parms[i++] = "security_group_rule[direction]=" + direction;
		if (icmptype)
			parms[i++] = "security_group_rule[protocol_details][icmp_type]=" + icmptype;
		if (icmpcode)
			parms[i++] = "security_group_rule[protocol_details][icmp_code]=" + icmpcode;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPostReturnLocation(RSUtils.HOST + "/api/clouds/" + cloud_id + "/security_groups/" + id + "/security_group_rules", jparms);
		if (!ok.startsWith("/api")) {
			return "Failed";
		}
		var parms = [];
		var i = 0;
		var newrule = RSUtils.findItem(ok, this.httpClient);
		if (newrule) {
			var link = RSUtils.findHref(newrule.links, "self")
			parms[i++] = "security_group_rule[description]=" + ruleName;
			var jparms = RSUtils.convertParms(parms);
			ok = this.httpClient.doPut(RSUtils.HOST + link, jparms);
		}
		return ok;
	}
	
};

function RSNetworks(httpClient) {
	this.httpClient = httpClient;
}

RSNetworks.prototype = {
	create : function (name, cidr_block, cloud_id, description, instance_tendancy) {
		var parms = [];
		var i = 0;
		parms[i++] = "network[cidr_block]=" + cidr_block;
		parms[i++] = "network[cloud_href]=/api/clouds/" + cloud_id;
		parms[i++] = "network[name]=" + name;
		if (description)
			parms[i++] = "network[description]=" + description;
		if (instance_tendancy)
			parms[i++] = "network[instance_tendancy]=" + instance_tendancy;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/networks.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},
	
	update : function (network_id, new_name, description) {
		var parms = [];
		var i = 0;
		parms[i++] = "network[name]=" + new_name;
		if (description)
			parms[i++] = "network[description]=" + description;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPut(RSUtils.HOST + "/api/networks/" + network_id, jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},
	
	list : function(name, cloud_id) {
		var parms = [];
		var i = 0;
		if (name) {
			parms[i++] = "filter[]=name==" + name;
		}
		if (cloud_id)
			parms[i++] = "filter[]=cloud_href==/api/clouds/" + cloud_id;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/networks.json", jparms);
		return RSUtils.filterByName(ok, name);
		
	},
	destroy : function(name, cloud_id) {
		var items = this.list(name, cloud_id);
		var ok = RSUtils.deleteItems(items, this.httpClient);
		return ok;
	},
	
	id : function(name, cloud_id) {
		var items = this.list(name, cloud_id);
		return RSUtils.findId(items,name);
		
	}
		
};

function RSSubnets(httpClient) {
	this.httpClient = httpClient;
}

RSSubnets.prototype = {
		create : function (name, cidr_block, cloud_id, network_id, instance_id, description, datacenter_id) {
			var parms = [];
			var i = 0;
			parms[i++] = "subnet[cidr_block]=" + cidr_block;
			parms[i++] = "subnet[name]=" + name;
			parms[i++] = "subnet[network_href]=/api/networks/" + network_id;
			if (description)
				parms[i++] = "subnet[description]=" + description;
			if (datacenter_id)
				parms[i++] = "subnet[datacenter_href]=/api/clouds/" + cloud_id + "/datacenters/" + datacenter_id;
			var jparms = RSUtils.convertParms(parms);
			var ok = "";
			if (instance_id) {
				ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + instance_id + "/subnets.json", jparms);
			} else {
				ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/subnets.json", jparms);
				
			}
			if (ok.trim() == "") {
				return "ok";
			} else {
				return "Failed";
			}
			
		},
		
		list : function(name, cloud_id, network_id, instance_id, datacenter_id) {
			var parms = [];
			var i = 0;
			if (name) {
				parms[i++] = "filter[]=name==" + name;
			}
			if (network_id)
				parms[i++] = "filter[]=network_href==/api/networks/" + network_id;
			if (datacenter_id)
				parms[i++] = "filter[]=datacenter_href==/api/clouds/" + cloud_id + "/datacenters/" + datacenter_id;

			var jparms = RSUtils.convertParms(parms);
			var ok = "var items = []";
			if (instance_id) {
				ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + instance_id + "/subnets.json", jparms);
			} else {
				ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/subnets.json", jparms);
			}
			return RSUtils.filterByName(ok, name);
			
		},
		
		destroy : function(name, cloud_id, network_id, instance_id, datacenter_id) {
			var items = this.list(name, cloud_id, network_id, instance_id, datacenter_id);
			if (items.length == 0) {
				print("Subnet not found by name:  " + name);
				return "Failed";
			}
			var ok = RSUtils.deleteItems(items, this.httpClient);
			return ok;
		},
		
		id : function(name, cloud_id, network_id, instance_id, datacenter_id) {
			var items = this.list(name, cloud_id, network_id, instance_id, datacenter_id);
			return RSUtils.findId(items,name);
			
		}
		
		
};
function RSGateways(httpClient) {
	this.httpClient = httpClient;
}

RSGateways.prototype = {
		create : function (name, description, type, cloud_id, network_id) {
			var parms = [];
			var i = 0;
			parms[i++] = "network_gateway[name]=" + name;
			parms[i++] = "network_gateway[type]=" + type;
			if (description)
				parms[i++] = "subnet[description]=" + description;
			var jparms = RSUtils.convertParms(parms);
			var link = "";
			link = this.httpClient.doPostReturnLocation(RSUtils.HOST + "/api/clouds/networkgate_ways.json", jparms);
			if (link.trim() != "/api") {
				return "Failed";
			}
			parms = [];
			i = 0;
			parms[i++] = "network_gateway[network_href]=/api/networks/" + network_id;
			jparms = RSUtils.convertParms(parms);
			var ok = this.httpClient.doPut(RSUtils.HOST + link, jparms);
		},
		
		assocNetwork : function(name, cloud_id, network_id) {
			var id = this.id(name, cloud_id);
			var link = "/api/network_gateways/" + id;
			var parms = [];
			var i = 0;
			if (network_id) {
				parms[i++] = "network_gateway[network_href]=/api/networks/" + network_id;
			} else {
				parms[i++] = "network_gateway[network_href]=";
			}
			jparms = RSUtils.convertParms(parms);
			var ok = this.httpClient.doPut(RSUtils.HOST + link, jparms);
			return ok;
		},
		
		list : function(name, cloud_id) {
			var parms = [];
			var i = 0;
			if (name) {
				parms[i++] = "filter[]=name==" + name;
			}
			parms[i++] = "filter[]=cloud_href==/api/clouds/" + cloud_id;
			var jparms = RSUtils.convertParms(parms);
			var ok = "var items = []";
			ok = this.httpClient.doGet(RSUtils.HOST + "/api/network_gateways.json", jparms);

			return RSUtils.filterByName(ok, name);
			
		},
		
		destroy : function(name, cloud_id) {
			var items = this.list(name, cloud_id);
			var ok = RSUtils.deleteItems(items, this.httpClient);
			return ok;
		},
		
		id : function(name) {
			var items = this.list(name, cloud_id);
			return RSUtils.findId(items,name);
			
		}
		
		
};

function RSIPAddresses(httpClient) {
	this.httpClient = httpClient;
}

RSIPAddresses.prototype = {
	create : function (name, cloud_id, description, network_id, domain) {
		var parms = [];
		var i = 0;
		parms[i++] = "ip_address[name]=" + name;
		if (description)
			parms[i++] = "ip_address[description]=" + description;
		if (network_id)
			parms[i++] = "ip_address[network_href]=/api/networks/" + network_id;
		if (domain)
			parms[i++] = "ip_address[domain]=" + domain;
		var jparms = RSUtils.convertParms(parms);
		var ok = "";
		ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/ip_addresses.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},
	
	list : function(name, cloud_id) {
		var parms = [];
		var i = 0;
		if (name) {
			parms[i++] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/ip_addresses.json", jparms);
		return RSUtils.filterByName(ok, name);
		
	},
	
	destroy : function(name, cloud_id) {
		var items = this.list(name, cloud_id);
		var ok = RSUtils.deleteItems(items, this.httpClient);
		
		return ok;
	},
	
	id : function(name, cloud_id) {
		var items = this.list(name, cloud_id);
		return RSUtils.findId(items,name);
		
	}
		
		
};

function RSIPAddressBindings(httpClient) {
	this.httpClient = httpClient;
}

RSIPAddressBindings.prototype = {
	create : function (instance_id, cloud_id, ip_address_id, private_port, protocol, public_ip_address_id,public_port) {
		var parms = [];
		var i = 0;
		parms[i++] = "ip_address_binding[instance_href]=/api/clouds/" + cloud_id + "/instances/" + instance_id;
		if (private_port)
			parms[i++] = "ip_address_binding[private_port]=" + private_port;
		if (protocol)
			parms[i++] = "ip_address_binding[protocol]=" + protocol;
		if (public_ip_address_id)
			parms[i++] = "ip_address_binding[public_ip_address_href]=/api/clouds/" + cloud_id + "/ip_addresses/" + public_ip_address_id;
		if (public_port)
			parms[i++] = "ip_address_binding[public_port]=" + public_port;
		var jparms = RSUtils.convertParms(parms);
		var ok = "";
		if (ip_address_id) {
			ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/ip_addresses/" + ip_address_id + "/ip_address_bindings.json", jparms);
		} else {
			ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/ip_address_bindings.json", jparms);
		}
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},
	
	list : function(instance_id, cloud_id, ip_address_id) {
		var parms = [];
		parms[0] = "filter[]=instance_href==/api/clouds/" + cloud_id + "/instances/" + instance_id;
		var jparms = RSUtils.convertParms(parms);
		var ok = "var items = []";
		if (ip_address_id) {
			ok = "var items = " + this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/ip_addresses/" + ip_address_id + "/ip_address_bindings.json", jparms);
		} else {
			ok = "var items = " + this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/ip_address_bindings.json", jparms);
		}
		eval(ok);
		return items;
		
	},
	
	destroy : function(instance_id, cloud_id, ip_address_id) {
		var items = this.list(instance_id, cloud_id, ip_address_id);
		var ok = RSUtils.deleteItems(items, this.httpClient);
		return ok;
	}
		
};
/** Test
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

quit();
*/