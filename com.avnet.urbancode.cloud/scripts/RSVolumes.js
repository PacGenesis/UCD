function RSVolumes(httpClient) {
	this.httpClient = httpClient;
}

RSVolumes.prototype = {
	create : function(name, cloud_id, description, size, iops, volumetype_id, parent_volumesnapshot_id, datacenter_id) {
		var parms = [];
		var i = 0;
		parms[i++] = "volume[name]=" + name;
		if (description)
			parms[i++] = "volume[description=" + description;
		if (size)
			parms[i++] = "volume[size]=" + size;
		if (iops)
			parms[i++] = "volume[iops]=" + iops;
		
		if (volumetype_id)
			parms[i++] = "volume[volume_type_href]=/api/clouds/" + cloud_id + "/volume_types/" + volumetype_id;
		if (parent_volumesnapshot_id)
			parms[i++] = "volume[parent_volume_snapshot_href]=/api/clouds/" + cloud_id + "/volume_snapshots/" + parent_volumesnapshot_id;
		if (datacenter_id)
			parms[i++] = "volume[datacenter_href]=/api/clouds/" + cloud_id + "/datacenters/" + datacenter_id;
		var jparms = RSUtils.convertParms(parms);
		
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/volumes.json", jparms);
		
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	}, 
	
	list : function(name, cloud_id) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/volumes.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	destroy : function(name, cloud_id) {
		var items = this.list(name, cloud_id);
		var ok = RSUtils.deleteItems(items, this.httpClient);
		return ok;
	},
	
	blockForStateChange : function(cloud_id, volumeName, state, count, sleeptime, blockingTimeout) {
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
			var items = this.list(volumeName, cloud_id);
			var volume = items[0];
			var sstate = volume.status;
			if (sstate == state) {
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
		
	},
	
	id : function(name, cloud_id)	{
		var items = this.list(name, cloud_id);
		
		return RSUtils.findId(items, name);
		
	}
		
};

function RSVolumeSnapshots(httpClient) {
	this.httpClient = httpClient;
}

RSVolumeSnapshots.prototype = {
	create : function(name, cloud_id, description, parent_volume_id) {
		var parms = [];
		var i = 0;
		parms[i++] = "volume_snapshot[name]=" + name;
		if (description)
			parms[i++] = "volume_snapshot[description=" + description;
		
		if (parent_volume_id)
			parms[i++] = "volume_snapshot[parent_volume_href]=/api/clouds/" + cloud_id + "/volumes/" + parent_volume_id;
		var jparms = RSUtils.convertParms(parms);
		
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/volume_snapshots.json", jparms);
		
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	}, 
	
	list : function(name, cloud_id) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/volume_snapshots.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	destroy : function(name, cloud_id) {
		var id = this.id(name, cloud_id);
		var parms = [];
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doDelete(RSUtils.HOST + "/api/clouds/" + cloud_id + "/volume_snapshots/" + id, jparms);
		return ok;
	},
	
	id : function(name, cloud_id)	{
		var items = this.list(name, cloud_id);
		
		return RSUtils.findId(items, name);
		
	}
		
};

function RSVolumeAttachments(httpClient) {
	this.httpClient = httpClient;
}

RSVolumeAttachments.prototype = {
	create : function(cloud_id, instance_id, volume_id, device) {
		var parms = [];
		var i = 0;
		parms[i++] = "volume_attachment[volume_href]=/api/clouds/" + cloud_id + "/volumes/" + volume_id;
		if (device)
			parms[i++] = "volume_attachment[device]=" + device;
		var jparms = RSUtils.convertParms(parms);
		
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + instance_id + "/volume_attachments.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
		return ok;
	}, 
	
	list : function(cloud_id, instance_id, device) {
		var parms = [];
		var i = 0;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + instance_id + "/volume_attachments.json", jparms);
		if (ok.startsWith("[")) {
			ok = "var items = " + ok;
		} else {
			var items = [];
			return items;
		}
		eval(ok);
		if (device) {
			var outItems = [];
			var j = 0;
			for (var i = 0; i < items.length; i++) {
				
				if (device == items[i].device) {
					outItems[j] = items[i];
					j++;
				}
			}
			return outItems;
		}
		return items;
	},
	
	destroy : function(cloud_id, instance_id, device) {
		var items = this.list(cloud_id, instance_id, device);
		if (items.length == 0) {
			print("No volumes associated with device : " + device);
			return "Failed";
		}
		var ok = RSUtils.deleteItems(items, this.httpClient);
		return ok;
	},
	
		
};
function RSRecurringVolumeAttachments(httpClient) {
	this.httpClient = httpClient;
}

RSRecurringVolumeAttachments.prototype = {
	create : function(cloud_id, server_id, volume_id, device) {
		var parms = [];
		var i = 0;
		parms[i++] = "recurring_volume_attachment[storage_href]=/api/clouds/" + cloud_id + "/volumes/" + volume_id;
		parms[i++] = "recurring_volume_attachment[runnable_href]=/api/servers/" + server_id;
		if (device)
			parms[i++] = "recurring_volume_attachment[device]=" + device;
		var jparms = RSUtils.convertParms(parms);
		
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/recurring_volume_attachments.json", jparms);
		
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	}, 
	
	createForSnapshot : function(cloud_id, server_id, snapshot_id, device) {
		var parms = [];
		var i = 0;
		parms[i++] = "recurring_volume_attachment[storage_href]=/api/clouds/" + cloud_id + "/volume_snapshots/" + snapshot_id;
		parms[i++] = "recurring_volume_attachment[runnable_href]=/api/servers/" + server_id;
		if (device)
			parms[i++] = "recurring_volume_attachment[device]=" + device;
		var jparms = RSUtils.convertParms(parms);
		
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/recurring_volume_attachments.json", jparms);
		
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	}, 
	
	list : function(cloud_id, server_id, device) {
		var parms = [];
		var i = 0;
		parms[i++] = "filter[]=runnable_href==/api/servers/" + server_id;
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/recurring_volume_attachments.json", jparms);
		if (ok.startsWith("[")) {
			ok = "var items = " + ok;
		} else {
			var items = [];
			return items;
		}
		eval(ok);
		if (device) {
			var outItems = [];
			var j = 0;
			for (var i = 0; i < items.length; i++) {
				
				if (device == items[i].device) {
					outItems[j] = items[i];
					j++;
				}
			}
			return outItems;
		}
		return items;
	},
	
	destroy : function(cloud_id, server_id, device) {
		var items = this.list(cloud_id, server_id, device);
		if (items.length == 0) {
			print("No volumes associated with device : " + device);
			return "Failed";
		}
		var ok = RSUtils.deleteItems(items, this.httpClient);
		return ok;
	},
	
		
};

function RSVolumeType(httpClient) {
	this.httpClient = httpClient;
}

RSVolumeType.prototype = {
		list : function(name, cloud_id) {
			var parms = [];
			if (name) {
				parms[0] = "filter[]=name==" + name;
			}
			var jparms = RSUtils.convertParms(parms);
			var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/volume_types.json", jparms);
			return RSUtils.filterByName(ok, name);
		},
		
		id : function(name, cloud_id)	{
			var items = this.list(name, cloud_id);
			
			return RSUtils.findId(items, name);
			
		}
		
};
