import java.io.*;
import java.util.*;
import com.urbancode.air.plugin.websphere.WebSphereBatchScriptHelper

final def isWindows = (System.getProperty('os.name') =~ /(?i)windows/).find()
out = System.out;
def wsadmin = isWindows ? "wsadmin.bat" : "wsadmin.sh"

final def workDir = new File('.').canonicalFile
final def props = new Properties();
final def inputPropsFile = new File(args[0]);
final def inputPropsStream = null;
try {
    inputPropsStream = new FileInputStream(inputPropsFile);
    props.load(inputPropsStream);
}
catch (IOException e) {
    throw new RuntimeException(e);
}

def PLUGIN_HOME= System.getenv("PLUGIN_HOME");
def cell = props['cell']
def node = props['node']
def server = props['server']
def cluster = props['cluster']
def moduleURI = props['moduleURI']
def appName = props['appName']
def appEdition = props['appEdition']
def command; 
if (server == null || server.startsWith('${p:') || server.trim() == "") {
    //clustercommand
    StringBuilder builder = new StringBuilder();
    builder.append("mapClusterToModule(")
               .append("\"").append(appName).append("\"").append(",")
               .append("\"").append(appEdition?:"").append("\"").append(",")
               .append("\"").append(moduleURI).append("\"").append(",")
               .append("\"").append(cell).append("\"").append(",")
               .append("\"").append(cluster).append("\"")
           .append(")")
    command = builder.toString();
}
else {
    //servercommand
    StringBuilder builder = new StringBuilder();
    builder.append("mapServerToModule(")
               .append("\"").append(appName).append("\"").append(",")
               .append("\"").append(appEdition?:"").append("\"").append(",")
               .append("\"").append(moduleURI).append("\"").append(",")
               .append("\"").append(cell).append("\"").append(",")
               .append("\"").append(node).append("\"").append(",")
               .append("\"").append(server).append("\"")
           .append(")")
    command = builder.toString();
}




WebSphereBatchScriptHelper helper = new WebSphereBatchScriptHelper(props);
helper.execute(command);
