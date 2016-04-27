import com.pacgenesis.ucd.util.resource.ResourceClientExt
import java.io.*;
import java.util.*;
import com.urbancode.air.AirPluginTool
import com.urbancode.air.XTrustProvider;
import org.codehaus.jettison.json.*;
import com.pacgenesis.ucd.util.resource.*;

XTrustProvider.install()
final def isWindows = (System.getProperty('os.name') =~ /(?i)windows/).find()
out = System.out;

final def workDir = new File('.').canonicalFile
def apTool = new AirPluginTool(this.args[0], this.args[1]);
def props = apTool.getStepProperties();
def outProps = apTool.getOutProps();

def MAX_RETRIES = 3;

def weburl = System.getenv("AH_WEB_URL");
def user = apTool.getAuthTokenUsername();
def password = apTool.getAuthToken();

def PLUGIN_HOME= System.getenv("PLUGIN_HOME");
def moduleURIList = props['moduleList']
def appName = props['appName']
def agent = props['agent']
def app = props['app']
def env = props['env']
def componentId = props['componentId']
def versionId = props['versionId']
def requestId = props['requestId']
def mainResourceId = props['resourceId']
def filterTag = props['filterTag']
def moduleMappingPropery = props['moduleMappingPropery']
StringBuilder builder = new StringBuilder();
builder.append("-MapModulesToServers [")
def aURI = new URI(weburl);
def client = new ResourceClientExt(aURI, user, password);
def re
def targets = client.getTargetsForComponent(env,app,appName,agent,filterTag);
def resources = client.getRelatedResources(env,app,appName,agent,filterTag);
def getModuleHelper = new GetModuleDisplayNameHelper(props);
def reader = new StringReader(moduleURIList);
reader.each { line ->
	if (line.endsWith(".jar")) {
		line = line + ",META-INF/ejb-jar.xml"
		def dName = getModuleHelper.execute(line);
		dName = dName.trim();
		line = dName + " " + line;
	} else if (line.endsWith(".war")) {
		 
		line = line + ",WEB-INF/web.xml"
		def dName = getModuleHelper.execute(line);
		dName = dName.trim();
		line = dName + " " + line;
	}
	builder.append("[").append(line).append(" ")
	for (int i = 0; i < targets.length; i++) {
		builder.append(targets[i])
		if (i < (targets.length-1) )
			builder.append("+")
	}
	builder.append("]")
}
builder.append("]")
for (int i = 0; i < resources.length(); i++) {
	JSONObject res = resources.getJSONObject(i);
	String id = res.getString("id");
	if (!mainResourceId.equals(id))
		client.createResourceInventoryEntry(requestId, id, componentId, versionId,"Active");
}
System.out.println(builder.toString())
apTool.setOutputProperty(moduleMappingPropery,builder.toString())
apTool.storeOutputProperties()





