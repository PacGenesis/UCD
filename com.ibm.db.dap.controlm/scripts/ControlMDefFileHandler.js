// spanDir - a directory traversal function for
// Rhino JavaScript
// Copyright 2010 by James K. Lawless
// See MIT/X11 license at 
// http://www.mailsend-online.com/wp/license.php

importPackage(java.io);

function ControlMDefFileHandler(dir, userName, password, hostName, cmdName) {
	this.dir = dir;
	this.userName = userName;
	this.password = password;
	this.hostName = hostName;
	this.cmdName = cmdName;
}
// spanDir() accepts two parameters
// The first is a string representing a directory path
// The second is a closure that accepts a parameter of type
// java.io.File
ControlMDefFileHandler.prototype = {
	process : function() {
		this.spanDir(this.dir);
	},
	spanDir : function(adir) {
		var lst = new File(adir).listFiles();
		var i;
		for (i = 0; i < lst.length; i++) {
			// If it's a directory, recursive call spanDir()
			// so that we end up doing a scan of
			// the directory tree
			if (lst[i].isDirectory()) {
				this.spanDir(lst[i].getAbsolutePath());
			}
			// Pass the File object to the handler that
			// the caller has specified regardless of whether
			// the File object is a directory.
			this.processXml(lst[i]);
		}
	},
	processXml : function(fil) {
		var nam;
		nam = fil.getAbsolutePath();
		if (!fil.isDirectory()) {
			if (nam.toLowerCase().endsWith(".xml") || nam.toLowerCase().endsWith(".exp")) {
				if (!this.validXml(fil)) {
					print(nam + " does not contain valid Control-M xml.");
					System.exit(1);
				}
				this.executeUpdateDef(nam);
			}
		}

	},
	validXml : function(fil) {
		var br = new BufferedReader(new InputStreamReader(new FileInputStream(fil)));
		var flag = false
		try {
			var line;
			var i = 0;
			while ((line = br.readLine()) != null && i < 10) {
				if (line.indexOf("<DEFTABLE ") > -1) {
					flag = true;
					break;
				}
				i++;
			}
		} finally {
			br.close();
		}
		return flag;
	},
	executeUpdateDef : function(nam) {
		var System = java.lang.System;
		var arg_array = [ "deffolder", "-u", this.userName, "-p",
				this.password, "-s", this.hostName, "-src", nam, "/o", "/v",
				"/a" ];
		var opt = {
			args : arg_array,
			output : '',
			err : ''
		};
		var exitCode = runCommand(cmdName, opt);
		if (exitCode == 1) {
			print(opt.output);
			System.exit(1);
		}
		print(opt.output);
	}

};
