/**
 * RightScale Servers javascript class.
 */
function RSServers(httpClient)
{
	this.httpClient = httpClient;
}

RSServers.prototype = {
	create : function(name, desc, deployment_id, cloud_id, network_id, st_id, sg_id, mci_id, instancetype_id, sshkey_id, optimized, inputs, subnets, datacenter_id)
	{
		var parms = [];
		var i = 0;
		parms[i++] = "server[name]=" + name;
		if (desc)
			parms[i++] = "server[description]=" + desc;
		parms[i++] = "server[deployment_href]=/api/deployments/" + deployment_id;
		parms[i++] = "server[instance][cloud_href]=/api/clouds/" + cloud_id;
		parms[i++] = "server[instance][server_template_href]=/api/server_templates/" + st_id;
		if (mci_id)
			parms[i++] = "server[instance][multi_cloud_image_href]=/api/multi_cloud_images/" + mci_id;
		if (instancetype_id)
			parms[i++] = "server[instance][instance_type_href]=/api/clouds/" + cloud_id + "/instance_types/" + instancetype_id;
		if (sg_id)
			parms[i++] = "server[instance][security_group_hrefs][]=/api/clouds/" + cloud_id + "/security_groups/" + sg_id;
		if (sshkey_id)
			parms[i++] = "server[instance][ssh_key_href]=/api/clouds/" + cloud_id + "/ssh_keys/" + sshkey_id;
		if (datacenter_id)
			parms[i++] = "server[instance][datacenter_href]=/api/clouds/" + cloud_id + "/datacenters/" + datacenter_id;
		if (optimized == true)
			parms[i++] = "server[optimized]=" + optimized;

		if (inputs) {
			for (var j = 0; j < inputs.length; j++) {
				var args = RSUtils.splitParms(inputs[j]);
				parms[i++] = "server[instance][inputs][][name]=" + args[0];
				parms[i++] = "server[instance][inputs][][value]=" + args[1];
			}
		}
		if (network_id && subnets) {
			var sns = new RSSubnets(this.httpClient);
			
			for (var j = 0; j < subnets.length; j++) {
				var name = subnets[j];
				var subnet_id = sns.id(name, cloud_id, network_id);
				if (subnet_id && subnet_id != "")
					parms[i++] = "server[instance][subnet_hrefs][]=/api/clouds/" + cloud_id + "/subnets/" + subnet_id;
			}
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/servers", jparms);
		
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		var instances = new RSInstances(this.httpClient);
		return ok;
	},
	
	changeSecurityGroup : function(name, cloud_id, sg_ids, blocking, subnet_id) {
		var undef;
		var server_id = this.id(name);
		if (!server_id) {
			print("Server by name, " + name + ", does not exist.");
			return "Failed";
		}
		var subnet_ids = [];
		subnet_ids[0] = subnet_id;
		return this.softUpdate(server_id, undef, undef, sg_ids, undef, undef, subnet_ids);
	},
	
	changeNames : function(servername, newname, newinstancename) {
		var undef;
		var server_id = this.id(servername);
		if (!server_id) {
			print("Server by name, " + serverName + ", does not exist.");
			return "Failed";
		}
		return this.softUpdate(server_id, newname, newinstancename);
	},
	
	changeInstanceType : function(serverName, instancetype_id) {
		var undef;
		var server_id = this.id(serverName);
		if (!server_id) {
			print("Server by name, " + serverName + ", does not exist.");
			return "Failed";
		}
		return this.softUpdate(server_id, undef, undef, undef, instancetype_id);
		
	},
	
	hardUpdate : function(blocking, name, cloud_id, newname, description, sg_ids, subnet_ids, deployment_id, st_id, mci_id, instancetype_id, inputs) {
		var Thread = java.lang.Thread;
		var currentThread = Thread.currentThread();
		var server_id = this.id(name);
		var server = this.show(server_id);
		var isCurrent = true;
		var cInstance = server.current_instance;
		if (!cInstance) {
			cInstance = server.next_instance;
			isCurrent = false;
		}
		
		var instance_id = RSUtils.findHrefId(cInstance.links, "self");
		
		var instances = new RSInstances(this.httpClient);
		
		var instance = instances.show(instance_id, cloud_id);
		
		if (!instance) {
			return "Failed";
		}
		var parms = [];
		var i = 0;
		if (newname) {
			parms[i++] = "server[name]=" + newname;
			
		} else {
			parms[i++] = "server[name]=" + server.name;
		}
		if (description) {
			parms[i++] = "server[description]=" + description;
		} else {
			parms[i++] = "server[description]=" + server.description;
		}
		if (deployment_id) {
			parms[i++] = "server[deployment_href]=/api/deployments/" + deployment_id;
		} else {
			parms[i++] = "server[deployment_href]=" + RSUtils.findHref(instance.links, "deployment");
		}
		parms[i++] = "server[instance][cloud_href]=" + RSUtils.findHref(instance.links, "cloud");
		parms[i++] = "server[instance][server_template_href]=" + RSUtils.findHref(instance.links, "server_template");;
		if (RSUtils.findHref(instance.links, "multi_cloud_image"))
			parms[i++] = "server[instance][multi_cloud_image_href]=" + RSUtils.findHref(instance.links, "multi_cloud_image");
		if (instancetype_id) {
			parms[i++] = "server[instance][instance_type_href]=/api/clouds/" + cloud_id + "/instance_types/" + instancetype_id;
		}
		else if (RSUtils.findHref(instance.links, "instance_type")) {
			parms[i++] = "server[instance][instance_type_href]=" + RSUtils.findHref(instance.links, "instance_type");
		}
		if (sg_ids) {
			for (var k = 0; k < sg_ids.length; k++) {
				var sg_id = sg_ids[k];
				parms[i++] = "server[instance][security_group_hrefs][]=/api/clouds/" + cloud_id + "/security_groups/" + sg_id;
			}
		} else {
			var sgs = instance.security_groups;
			for (var k = 0; k < sg_ids.length; k++) {
				var sg = sgs[k];
				parms[i++] = "server[instance][security_group_hrefs][]=" + sg[k].href;
			}
		}
		if (inputs) {
			for (var j = 0; j < inputs.length; j++) {
				var args = inputs[j].split("=");
				parms[i++] = "server[instance][inputs][][name]=" + args[0];
				parms[i++] = "server[instance][inputs][][value]=" + args[1];
			}
			
		} else {
			for (var j = 0; j < instance.inputs.length; j++) {
				var input = instance.inputs[j];
				parms[i++] = "server[instance][inputs][][name]=" + input.name;
				parms[i++] = "server[instance][inputs][][value]=" + input.value;
			}
		}
		var va = new RSVolumeAttachments(this.httpClient);
		var volumeAttachments = va.list(cloud_id, instance_id);
		var sns = new RSSubnets(this.httpClient);
		var undef;
		var subnets = sns.list(undef, cloud_id, undef, instance_id);
//		var deployment_id = RSUtils.findHrefId(instance.links, "deployment");
		if (isCurrent) {
			var dOK = instances.terminate(instance_id, cloud_id);
			if (dOK != "ok") {
				return "Failed";
			}
		}
		while (isCurrent) {
			server = this.show(server_id);
			var state = server.state;
			if (state == "inactive") { 
				break;
			}
			currentThread.sleep(15000);
		}
		dOK = this.destroy(server_id);
		if (dOK != "ok") {
			return "Failed";
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/servers", jparms);
		if (ok.trim() != "") {
			return "Failed";
		}
		server_id = this.id(name);
		server = this.show(server_id);
		cInstance = server.next_instance;
		instance_id = RSUtils.findHrefId(cInstance.links, "self");
		for (var j = 0; j < volumeAttachments.length; j++) {
			var volume_id = RSUtils.findHrefId(volumeAttachments[j].links, "volume");
			va.create(cloud_id, instance_id, volume_id);
		}
		for (var j = 0; j < subnets.length; j++) {
			var subnet = subnets[j];
			var network_id = RSUtils.findHrefId(subnet.links, "network");
			sns.create(subnet.name, cidr_block, cloud_id, network_id, instance_id, subnet.description);
		}
		ok = "ok";
		if (isCurrent) {
			ok = this.launch(server_id, blocking);
		}
		return ok;
		
	},
	
	ensureInactive : function(server) {
		var isCurrent = true;
		var server_id = RSUtils.findHrefId(server.links, "self");
		var cInstance = server.current_instance;
		if (!cInstance) {
			cInstance = server.next_instance;
			isCurrent = false;
		}
		var instance_id = RSUtils.findHrefId(cInstance.links, "self");
		var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
		var instances = new RSInstances(this.httpClient);
		if (isCurrent) {
			var iok = instances.terminate(instance_id, cloud_id);
			if (iok == "ok") {
				var block_ok = this.blockForStateChange(server_id, "inactive", 50, 15000);
			} else {
				return iok;
			}
		}
		return isCurrent;
	},
	
	
	restore : function(server_id, state) {
		var server = this.show(server_id);
		var cState = server.state;
		var ok = "ok";
		if (cState == "inactive" && state == "provisioned") {
			ok = this.launch(server_id, false);
			if (ok != "ok") return ok;
			ok = this.blockForStateChange(server_id, "booting", 50, 15000);
			server = this.show(server_id);
			
			ok = this.stop(server_id);
			if (ok != "ok") return ok;
			ok = this.blockForStateChange(server_id, "provisioned", 50, 15000)
		} else if (cState == "inactive" && state == "operational") {
			ok = this.launch(server_id, false);
			if (ok != "ok") return ok;
			ok = this.blockForStateChange(server_id, "operational", 500, 15000);
			
		} else if (cState == "inactive" && state == "booting") {
			ok = this.launch(server_id, false);
			if (ok != "ok") return ok;
			ok = this.blockForStateChange(server_id, "booting", 500, 15000);
			
			
		} else if ((cState == "operational" || cState == "booting") && state == "inactive") {
			ok = this.terminate(server_id);
			if (ok != "ok") return ok;
			ok = this.blockForStateChange(server_id, "inactive", 500, 15000);
		} else if ((cState == "operational" || cState == "booting") && state == "provisioned") {
			ok = this.stop(server_id);
			if (ok != "ok") return ok;
			ok = this.blockForStateChange(server_id, "provisioned", 500, 15000);
		}
		return ok;
	},
	
	softUpdate : function(server_id, newname, newinstancename, sg_ids, instancetype_id, st_id, subnet_ids) {
		var server = this.show(server_id);
		var state = server.state;
		var isCurrent = this.ensureInactive(server);
		var cInstance = server.next_instance;
		var instance_id = RSUtils.findHrefId(cInstance.links, "self");
		var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
		
		
		var ins = new RSInstances(this.httpClient);
		var ok = ins.update(instance_id, cloud_id, newinstancename, sg_ids, instancetype_id, st_id, subnet_ids);
		if (ok != "ok") {
			return ok;
		}
		var parms = [];
		var i = 0;
		if (newname)
			parms[i++] = "server[name]=" + newname;
		if (parms.length > 0) {
			var jparms = RSUtils.convertParms(parms);
			ok = this.httpClient.doPut(RSUtils.HOST + "/api/servers/" + server_id, jparms);
		}
		if (isCurrent) {
			this.restore(server_id, state);
		}
		return ok;
	},
	
	selectNetwork : function(server_id, subnet_id) {
		var undef;
		var subnet_ids = []
		subnet_ids[0] = subnet_id;
		var ok = this.softUpdate(server_id, undef, undef, undef, undef, undef, subnet_ids);
		return ok;
	},
	
	addVolume : function(server_id, volume_id, device) {
		var server = this.show(server_id);
		var nInstance = server.next_instance;
		var cloud_id = RSUtils.findHrefId(nInstance.links, "cloud");
		
		var cInstance = server.current_instance;
		if (cInstance) {
			var instance_id = RSUtils.findHrefId(cInstance.links, "self");
			var volAs = new RSVolumeAttachments(httpClient);
			var ok = volAs.create(cloud_id, instance_id, volume_id, device);
			if (ok != "ok") {
				return ok;
			}
		}
		
		var volumeAttachs = new RSRecurringVolumeAttachments(this.httpClient);
		ok = volumeAttachs.create(cloud_id, server_id, volume_id, device);
		return ok;
	},
	
	revertToSnapshot : function(server_id, device, snapshot_id) {
		var server = this.show(server_id);
		var state = server.state;
		var isCurrent = this.ensureInactive(server, false);
		server = this.show(server_id);
		var cInstance = server.next_instance;
		var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
		
		var volumeAttachs = new RSRecurringVolumeAttachments(this.httpClient);
		var ok = volumeAttachs.destroy(cloud_id, server_id, device);
		ok = volumeAttachs.createForSnapshot(cloud_id, server_id, snapshot_id, device);
		if (isCurrent)
			var rok = this.restore(server_id, state);
		return ok;
	},
	
	addIPAddress : function(server_id, ip_address) {
		
		var server = this.show(server_id);
		var state = server.state;
		var isCurrent = this.ensureInactive(server);
		var cInstance = server.next_instance;
		var instance_id = RSUtils.findHrefId(cInstance.links, "self");
		var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
		var rsipAddressBindings = new RSIPAddressBindings(this.httpClient);
		var undef;
		var ok = rsipAddressBindings.create(instance_id, cloud_id, undef, undef, undef, ip_address);
		if (isCurrent && ok == "ok") {
			ok = this.restore(server_id, state);
		}
		return ok;
	},
	
	removeIPAddress : function(server_id, ip_address) {
		
		var server = this.show(server_id);
		var state = server.state;
		var isCurrent = this.ensureInactive(server);
		var cInstance = server.next_instance;
		var instance_id = RSUtils.findHrefId(cInstance.links, "self");
		var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
		var rsipAddressBindings = new RSIPAddressBindings(this.httpClient);
		var undef;
		var ok = rsipAddressBindings.destroy(instance_id, cloud_id, ip_address);
		if (isCurrent && ok == "ok") {
			ok = this.restore(server_id, state);
		}
		return ok;
	},	
	
	ensureRunning : function(server, provisionedOK) {
		var cInstance = server.current_instance;
		var server_id = RSUtils.findHrefId(server.links, "self");
		var state = server.state;
		var statechange = false;
		var ok = "ok";
		if (!cInstance) {
			ok = this.launch(server_id, false);
			if (ok != "ok") {
				return ok;
			}
			statechange = true;
		} else if  (!provisionedOK && state == "provisioned") {
			ok = this.start(server_id);
			if (ok != "ok") {
				return ok;
			}
			statechange = true;
		}
		if (statechange)
			ok = this.blockForStateChange(server_id, "booting", 500, 15000);
		return ok;
	},
	
	ensureOperational : function(server, provisionedOK) {
		var cInstance = server.current_instance;
		var server_id = RSUtils.findHrefId(server.links, "self");
		var state = server.state;
		var statechange = false;
		var ok = "ok";
		if (!cInstance) {
			ok = this.launch(server_id, false);
			if (ok != "ok") {
				return ok;
			}
			statechange = true;
		} else if  (!provisionedOK && state == "provisioned") {
			ok = this.start(server_id);
			if (ok != "ok") {
				return ok;
			}
			statechange = true;
		}
		if (statechange)
			ok = this.blockForStateChange(server_id, "operational", 500, 15000);
		return ok;
	},
	
	removeVolume : function(server_id, device) {
		var server = this.show(server_id);
		var nInstance = server.next_instance;
		var cloud_id = RSUtils.findHrefId(nInstance.links, "cloud");
		
		var cInstance = server.current_instance;
		var iok = "ok";
		if (cInstance) {
			var instance_id = RSUtils.findHrefId(cInstance.links, "self");
			var volAs = new RSVolumeAttachments(httpClient);
			iok = volAs.destroy(cloud_id, instance_id, device);
			if (iok != "ok") {
				return iok;
			}
			
		}
		
		var volumeAttachs = new RSRecurringVolumeAttachments(this.httpClient);
		var ok = volumeAttachs.destroy(cloud_id, server_id, device);
		return ok;
	},
	
	destroy : function(server_id, deployment_id) {
		var parms = java.lang.reflect.Array.newInstance(java.lang.String, 0);
		var ok;
		if (deployment_id) {
			ok = this.httpClient.doDelete(RSUtils.HOST + "/api/deployments/" + deployment_id + "/servers/" + server_id, parms);
			
		} else {
			ok = this.httpClient.doDelete(RSUtils.HOST + "/api/servers/" + server_id, parms);

		}
		return ok;
	},
	
	destroyByName : function(name) {
		var items = this.list(name);
		var ok = RSUtils.deleteItems(items, this.httpClient);
		return ok;
		
	},
	
	launch : function(server_id, blocking) {
		var server = this.show(server_id);
		var ok = "ok";
		var cInstance = server.current_instance;
		if (!cInstance) {
			cInstance = server.next_instance;
			var instance_id = RSUtils.findHrefId(cInstance.links, "self");
			var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
			var instances = new RSInstances(this.httpClient);
			ok = instances.launch(instance_id, cloud_id);
			if (ok != "ok") {
				return ok;
			}
		}
		if (blocking == false) return ok;
		return this.blockForStateChange(server_id, "operational", 500, 15000);
		
	},
	
	runScript : function(server_id, script_id, inputs, blocking) {
		var server = this.show(server_id);
		var state = server.state;
		var ok = this.ensureOperational(server, false);
		if (ok != "ok") {
			return ok;
		}
		server = this.show(server_id);
		var cInstance = server.current_instance;
		if (!cInstance) {
			return "Failed";
		}
		var instance_id = RSUtils.findHrefId(cInstance.links, "self");
		var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
		var instances = new RSInstances(this.httpClient);
		var rok = instances.runExecutable(script_id, inputs, cloud_id, instance_id);
		if (rok == "Failed") {
			return rok;
		}
		if (blocking && blocking == true) {
			var tasks = new RSTasks(this.httpClient);
			var eok = tasks.blockForStateChange(rok, "completed", 50, 15000);
			if (eok != "ok") {
				return eok;
			}
		}
		ok = this.restore(server_id, state);
		if (ok != "ok") {
			return ok;
		}
		return ok;
	},
	
	runSysprep : function(server_id, inputs) {
		var server = this.show(server_id);
		var state = server.state;
		var ok = this.ensureOperational(server, false);
		if (ok != "ok") {
			return ok;
		}
		server = this.show(server_id);
		var cInstance = server.current_instance;
		if (!cInstance) {
			return "Failed";
		}
		var instance_id = RSUtils.findHrefId(cInstance.links, "self");
		var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
		var servertemplate_id = RSUtils.findHrefId(cInstance.links, "server_template");
		var instances = new RSInstances(this.httpClient);
		var rrbs = new RSRunnableBindings(this.httpClient);
		var rbs = rrbs.list(servertemplate_id);
		
		var is = new RSInputs(this.httpClient);
		var cInputs = is.list(instance_id, cloud_id);
		var inInputs = [];
		var hashInputs = new java.util.HashMap();
		for (var j = 0; j < cInputs.length; j++) {
			var name = cInputs[j].name;
			var value = cInputs[j].value;
			hashInputs.put(name, value);
		}
		for (var k = 0; k < inputs.length; k++) {
			var vals = RSUtils.splitParms(inputs[k]);
			hashInputs.put(vals[0], vals[1]);
		}
		var iter = hashInputs.keySet().iterator();
		var l = 0;
		while (iter.hasNext()) {
			var name = iter.next();
			var value = hashInputs.get(name);
			inInputs[l++] = name + "=" + value;
		}
		var hashScripts = new java.util.HashMap();
		for (var i = 0; i < rbs.length; i++) {
			var script_id = RSUtils.findHrefId(rbs[i].links, "right_script");
			var sequence = rbs[i].sequence;
			if (sequence == "boot") {
				hashScripts.put(rbs[i].position, script_id);
			}
		}
		for (var n = 1; n <= hashScripts.size(); n++) {
			var script_id = hashScripts.get(n);
			ok = instances.runExecutable(script_id, inInputs, cloud_id, instance_id);
			if (ok.startsWith("/api")) {
				var tasks = new RSTasks(this.httpClient);
				var eok = tasks.blockForStateChange(ok, "completed", 50, 15000);
				if (eok != "ok") {
					return eok;
				}
				
			}
			
		}
		ok = this.restore(server_id, state);
		return ok;
	},
	
	instanceId : function(name) {
		var server_id = this.id(name);
		var server = this.show(server_id);
		var instance_id;
		var cInstance = server.current_instance;
		if (cInstance) {
			instance_id = RSUtils.findHrefId(cInstance.links, "self");
		}
		return instance_id;
	},
	
	start : function(server_id) {
		var server = this.show(server_id);
		var ok = "ok";
		if (server.state == "operational") {
			return ok;
		}
		var cInstance = server.current_instance;
		if (!cInstance) {
			cInstance = server.next_instance;
			var instance_id = RSUtils.findHrefId(cInstance.links, "self");
			var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
			var instances = new RSInstances(this.httpClient);
			ok = instances.launch(instance_id, cloud_id);
		} else {
			var instance_id = RSUtils.findHrefId(cInstance.links, "self");
			var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
			var instances = new RSInstances(this.httpClient);
			ok = instances.start(instance_id, cloud_id);
		}
		return ok;
	},
	
	stop : function(server_id) {
		var server = this.show(server_id);
		var ok = "ok"
		if (server.state == "provisioned") {
			return ok;
		}
		var cInstance = server.current_instance;
		if (!cInstance) {
			return ok;
		} else {
			var instance_id = RSUtils.findHrefId(cInstance.links, "self");
			var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
			var instances = new RSInstances(this.httpClient);
			ok = instances.stop(instance_id, cloud_id);
		}
		return ok;
	},
	
	terminate : function(server_id) {
		var server = this.show(server_id);
		var ok = "ok";
		if (server.state == "terminated") {
			return ok;
		}
		var cInstance = server.current_instance;
		if (!cInstance) {
			return ok;
		} else {
			var instance_id = RSUtils.findHrefId(cInstance.links, "self");
			var cloud_id = RSUtils.findHrefId(cInstance.links, "cloud");
			var instances = new RSInstances(this.httpClient);
			ok = instances.terminate(instance_id, cloud_id);
		}
		return ok;
	},
	
	show : function(server_id) {
		var parms = [];
		parms[0] = "view=instance_detail";
		
		
		var jparms = RSUtils.convertParms(parms);
		var ok = "var server = " + this.httpClient.doGet(RSUtils.HOST + "/api/servers/" + server_id + ".json", jparms);
		eval(ok);
		return server;
		
	},
	
	list : function(name) {
		var parms = [];
		
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/servers.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	id : function(name) {
		var servers = this.list(name);
		
		return RSUtils.findId(servers,name);
		
	},
	
	findVolumeName : function(device, server_id) {
		var volName;
		var server = this.show(server_id);
		var nInstance = server.next_instance;
		var cloud_id = RSUtils.findHrefId(nInstance.links, "cloud");
		
		var cInstance = server.current_instance;
		if (cInstance) {
			var instance_id = RSUtils.findHrefId(cInstance.links, "self");
			var volAs = new RSVolumeAttachments(httpClient);
			var items = volAs.list(cloud_id, instance_id, device);
			if (items.length > 0) {
				var va = items[0];
				var vl = RSUtils.findHref(va.links, "volume");
				var vol = RSUtils.findItem(vl, this.httpClient);
				volName = vol.name;
			}
		}
		
		
		return volName;
		
	},
	
	
	blockForStateChange : function(server_id, state, count, sleeptime, blockingTimeout) {
		var Thread = java.lang.Thread;
		var currentThread = Thread.currentThread();
		var j = 0;
		var ok = "Failed";
		var timeout;
		if (blockingTimeout) {
			var currentDate = new java.util.Date();
			var cTime = currentDate.getTime();
			timeout = cTime + (blockingTimeout * 1000);
		}
		while (j < count) {
			var server = this.show(server_id);
			var sstate = server.state;
			if (sstate == state || (state == "operational" && sstate == "stranded")) {
				ok = "ok";
				break;
			}
			if (timeout) {
				var time = (new java.util.Date()).getTime();
				if (time >= timeout) {
					return "ok";
				}
			}
			currentThread.sleep(sleeptime);
			j++;
		}
		return ok;
		
	}

};

/**
 * RightScale Deployments javascript class.
 */
function RSDeployments(httpClient)
{
	this.httpClient = httpClient;
}

RSDeployments.prototype = {
	create : function(name, desc)
	{
		var parms = [];
		var i = 0;
		parms[i++] = "deployment[name]=" + name;
		if (desc && !desc.trim().equals(""))
			parms[i++] = "deployment[description]=" + desc;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/deployments.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
	},
	
	destroy : function(name) {
		var items = this.list(name);
		var ok = RSUtils.deleteItems(items, this.httpClient);
		return ok;
	},
	
	list : function(name) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/deployments.json", jparms);
		return RSUtils.filterByName(ok, name);
		
	},
	
	id : function(name) {
		var deps = this.list(name);
		return RSUtils.findId(deps,name);
		
	}
	
};


function RSDataCenters(httpClient) {
	this.httpClient = httpClient;
}

RSDataCenters.prototype = {
	list : function(name, cloud_id) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/datacenters.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	id : function(name, cloud_id)	{
		var dcs = this.list(name, cloud_id);
		
		return RSUtils.findId(dcs,name);
		
	}
};

function RSClouds(httpClient) {
	this.httpClient = httpClient;
}

RSClouds.prototype = {
	list : function(name) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	id : function(name)	{
		var dcs = this.list(name);
		
		return RSUtils.findId(dcs,name);
		
	}
};

function RSMultiCloudImages(httpClient) {
	this.httpClient = httpClient;
}

RSMultiCloudImages.prototype = {
	list : function(name, st_id) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/server_templates/" + st_id + "/multi_cloud_images.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	id : function(name, st_id)	{
		var mcis = this.list(name, st_id);
		
		return RSUtils.findId(mcis,name);
		
	}
};

function RSInstanceTypes(httpClient) {
	this.httpClient = httpClient;
}

RSInstanceTypes.prototype = {
	list : function(name, cloud_id) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instance_types.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	id : function(name, cloud_id)	{
		var its = this.list(name, cloud_id);
		
		return RSUtils.findId(its,name);
		
	}
};


/**
 * RightScale Server Templates javascript class.
 */
function RSServerTemplates(httpClient)
{
	this.httpClient = httpClient;
}

RSServerTemplates.prototype = {
	create : function(name, desc) {
		var parms = [];
		var i = 0;
		parms[i++] = "server_template[name]=" + name;
		parms[i++] = "server_template[description]=" + desc;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/server_templates.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		};
	},
	
	destroy : function(id) {
		var parms = java.lang.reflect.Array.newInstance(java.lang.String, 0);
		var ok = this.httpClient.doDelete(RSUtils.HOST + "/api/server_templates/" + id, parms);
		return ok;
	},
	
	list : function(name) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/server_templates.json", jparms);
		return RSUtils.filterByName(ok, name);
		
	},
	
	id : function(name) {
		var sts = this.list(name);
		return RSUtils.findId(sts,name);
		
	}
	
};

function RSSSHKeys(httpClient) {
	this.httpClient = httpClient;
}

RSSSHKeys.prototype = {
		list : function(name, cloud_id) {
			var parms = [];
			if (name) {
				parms[0] = "filter[]=resource_uid==" + name;
			}
			var jparms = RSUtils.convertParms(parms);
			var ok = "var items = " + this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/ssh_keys.json", jparms);
			eval(ok);
			return items;
			
		},
		
		id : function(name, cloud_id) {
			var items = this.list(name,cloud_id);
			return RSUtils.findResourceUID(items,name);
			
		}
		
};

/** Test
importPackage(com.avnet.urbancode.cloud.http);
load("./scripts/RSOAuth.js");
load("./scripts/RSUtils.js", "./scripts/RSNetworks.js");
var httpClient = new RightScaleHttpClient();
var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
oAuthO.updateHttpClient();
var serverTemplates = new RSServerTemplates(httpClient);
var st_id = serverTemplates.id("Base ServerTemplate for Windows (v13.5)");
print(st_id);
var clouds = new RSClouds(httpClient);
var cloud_id = clouds.id("EC2 us-east-1");
var rsSecurityGroups = new RSSecurityGroups(httpClient);
var sg_id = rsSecurityGroups.id("default", cloud_id);
var rsDeployments = new RSDeployments(httpClient);
var deployment_id = rsDeployments.id("AWS Test");

var rsServers = new RSServers(httpClient);
var undef;
var inputs = [];
var i = 0;
inputs[i++] = "ADMIN_PASSWORD=text:admin";
inputs[i++] = "SYS_WINDOWS_TZINFO=text:(UTC-06:00) Central Standard Time";
rsServers.create("Test", "A testing server", deployment_id, cloud_id, st_id, sg_id, undef, undef, inputs);

var server_id = rsServers.id("Test");

rsServers.launch(server_id);

//var ok = rsServers.destroy(server_id);


*/