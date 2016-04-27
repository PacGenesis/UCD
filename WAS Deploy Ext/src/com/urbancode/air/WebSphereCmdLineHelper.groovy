/*
* Licensed Materials - Property of IBM Corp.
* IBM UrbanCode Build
* IBM UrbanCode Deploy
* IBM UrbanCode Release
* IBM AnthillPro
* (c) Copyright IBM Corporation 2002, 2013. All Rights Reserved.
*
* U.S. Government Users Restricted Rights - Use, duplication or disclosure restricted by
* GSA ADP Schedule Contract with IBM Corp.
*/
package com.urbancode.air;

import java.util.Collection;
import java.io.ByteArrayOutputStream;

public class WebSphereCmdLineHelper {
    static private final String wsadmin;
    static {
        wsadmin = "wsadmin.sh";
        def isWindows = (System.getProperty('os.name') =~ /(?i)windows/).find()
        def isOS400 = (System.getProperty('os.name') =~ /(?i)os\/400/).find()
        if (isWindows)
           wsadmin = "wsadmin.bat"
        if (isOS400)
           wsadmin = "wsadmin"
    }
    
    //------------------------------------------------------------------------------------------------------------------
    static public String getWSADMINValue() {
        return wsadmin;
    }
    
    def commandPath;
    def user;
    def password;
    def pluginHome = new File(System.getenv("PLUGIN_HOME"));
    def scriptsDir = new File(pluginHome, "jythonScripts");
    def connType;
    def host;
    def port;
    def clusterName;
    def additionalArgs;
    def lang = "jython";
    def isWindows = (System.getProperty('os.name') =~ /(?i)windows/).find()
    def out = System.out;

    public WebSphereCmdLineHelper(def props) {
        commandPath = props['commandPath'];
        user = props['user'];
        password = (props['password'] != null && props['password'] != "")? props['password'] : props['passScript'];
        connType = props['connType'];
        host = props['host'];
        port = props['port'];
        lang = (props['lang'] != null && props['lang'] != "")? props['lang'] : "jython";
        additionalArgs = props['additionalArgs'];
		
    }

    public String runWSAdminScript(def scriptPath, String msg, String... arguments) {
        return runWSAdminScript(scriptPath, msg, null, arguments);
    }

    public String runWSAdminScript(def scriptPath, String msg, Closure exitCodeChecker, String... arguments) {
        def commandArgs = [commandPath + getWSADMINValue(), "-lang", lang];
        commandArgs << "-conntype"
        commandArgs << connType.trim();
        
        if (host) {
            commandArgs << "-host";
            commandArgs << host;
        }

        if (port) {
            commandArgs << "-port";
            commandArgs << port;
        }

        if (user) {
            commandArgs << "-user"
            commandArgs <<  user
            commandArgs << "-password"
            commandArgs << password
        }

        additionalArgs?.split("\n")?.each { arg ->
            def value = arg?.trim();
            if (value != null && value != "") {
                commandArgs << value;
            }
        }

        commandArgs << "-f";
        commandArgs << scriptPath;
        arguments.each { arg ->
            commandArgs << arg;
        }

        println msg + " : " + commandArgs.join(' ');
        def procBuilder = new ProcessBuilder(commandArgs);

        if (isWindows) {
            def envMap = procBuilder.environment();
            envMap.put("PROFILE_CONFIG_ACTION","true");
        }

        def statusProc = procBuilder.start();
		def outPrint = new ByteArrayOutputStream();
		statusProc.waitForProcessOutput(outPrint, outPrint);
		statusProc.waitFor();
		return outPrint.toString();
    }
}
