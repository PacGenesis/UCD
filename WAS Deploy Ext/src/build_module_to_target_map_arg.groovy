import com.pacgenesis.ucd.util.resource.ResourceClientExt
import java.io.*;
import java.util.*;
import com.urbancode.air.AirPluginTool
import com.urbancode.air.XTrustProvider;

XTrustProvider.install()
final def isWindows = (System.getProperty('os.name') =~ /(?i)windows/).find()
out = System.out;
def wsadmin = isWindows ? "wsadmin.bat" : "wsadmin.sh"

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
def moduleMappingPropery = props['moduleMappingPropery']
StringBuilder builder = new StringBuilder();
builder.append("-MapModulesToServers [")
def aURI = new URI(weburl);
def client = new ResourceClientExt(aURI, user, password);
def targets = client.getTargetsForComponent(env,app,appName,agent);
def reader = new StringReader(moduleURIList);
reader.each { line ->
	builder.append("[").append(line).append(" ")
	for (int i = 0; i < targets.length; i++) {
		builder.append(targets[i])
		if (i < (targets.length-1) )
			builder.append("+")
	}
	builder.append("]")
}
builder.append("]")
System.out.println(builder.toString())
apTool.setOutputProperty(moduleMappingPropery,builder.toString())
apTool.storeOutputProperties()





