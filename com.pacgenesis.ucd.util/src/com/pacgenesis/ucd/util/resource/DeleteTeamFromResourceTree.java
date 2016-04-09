package com.pacgenesis.ucd.util.resource;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.OptionBuilder;
import org.apache.commons.cli.Options;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.urbancode.ud.client.ResourceClient;

@SuppressWarnings("deprecation")
public class DeleteTeamFromResourceTree extends ResourceClient {
	static Options ops = new Options();
	public static void buildOptions() {
		ops.addOption(Option.builder("weburi").hasArg().argName("uri").required().desc("UCD URI").build());
		ops.addOption(Option.builder("userid").hasArg().argName("userid").required().desc("user logon id").build());
		ops.addOption(Option.builder("password").hasArg().argName("Password").required().desc("UCD user password").build());
		ops.addOption(Option.builder("application").hasArg().argName("UCDApplication").required().desc("Related UCD Application").build());
		ops.addOption(Option.builder("environment").hasArg().argName("Environment").required().desc("Related UCD Application Environment").build());
		ops.addOption(Option.builder("team").hasArg().argName("Team").required().desc("Team to remove").build());
		
	}

	public DeleteTeamFromResourceTree(URI url, String clientUser, String clientPassword) {
		super(url, clientUser, clientPassword);
		// TODO Auto-generated constructor stub
	}
	
	public JSONArray getEnvironmentResource(String environmentName, String applicationName) throws ClientProtocolException, IOException, JSONException {
	    String uri = this.url + "/cli/environment/getBaseResources?environment=" + encodePath(environmentName);
	    if ((applicationName != null) && (!("".equals(applicationName)))) {
	      uri = uri + "&application=" + encodePath(applicationName);
	    }
	    HttpGet method = new HttpGet(uri);
	    HttpResponse response = invokeMethod(method);
	    String body = getBody(response);
	    return new JSONArray(body);
	}
	
	void addTeamToResourceTree(String team, String parentResource) {
		try {
			this.addResourceToTeam(parentResource, team, "");
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		try {
			JSONArray children = this.getResourceChildren(parentResource);
			for (int i = 0; i < children.length(); i++) {
				String cPath = children.getJSONObject(i).getString("path");
				cPath = cPath.replace("\\", "");
				addTeamToResourceTree(team, cPath);
			}
		} catch (IOException | JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	

	public void deleteResourceFromTeam(String resource, String team, String type) throws IOException {
		String uri = this.url + "/cli/resource/teams?team=" + encodePath(team) + "&type=" + encodePath(type)
				+ "&resource=" + encodePath(resource);

		HttpDelete method = new HttpDelete(uri);
		invokeMethod(method);
	}
	
	public static void main(String[] args) {
		buildOptions();
		
		
		String suri = null;
		String userid = null;
		String password = null;
		String application = null;
		String env = null;
		String team = null;
	    CommandLineParser parser = new DefaultParser();
	    try {
	        // parse the command line arguments
	        CommandLine line = parser.parse( ops, args );
	        if (line.hasOption("weburi")) {
	        	suri = line.getOptionValue("weburi");
	        }
	        if (line.hasOption("userid")) {
	        	userid = line.getOptionValue("userid");
	        }
	        if (line.hasOption("password")) {
	        	password = line.getOptionValue("password");
	        }
	        if (line.hasOption("application")) {
	        	application = line.getOptionValue("application");
	        }
	        if (line.hasOption("environment")) {
	        	env = line.getOptionValue("environment");
	        }
	        if (line.hasOption("team")) {
	        	team = line.getOptionValue("team");
	        }
	    }
	    catch (org.apache.commons.cli.ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
		URI uri = null;
		try {
			uri = new URI(suri);
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		DeleteTeamFromResourceTree adder = new DeleteTeamFromResourceTree(uri, userid, password);
		try {
			JSONArray resources = adder.getEnvironmentResource(env, application);
			for (int i = 0; i < resources.length(); i++) {
				String cPath = resources.getJSONObject(i).getString("path");
				cPath = cPath.replace("\\", "");
				adder.deleteResourceFromTeam(cPath, team,null);
			}
		} catch (IOException | JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
