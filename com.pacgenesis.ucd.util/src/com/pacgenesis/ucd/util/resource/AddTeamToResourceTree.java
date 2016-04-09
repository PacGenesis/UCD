package com.pacgenesis.ucd.util.resource;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.apache.commons.cli.Option;
import org.apache.commons.cli.OptionBuilder;
import org.apache.commons.cli.Options;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.urbancode.ud.client.ResourceClient;

@SuppressWarnings("deprecation")
public class AddTeamToResourceTree extends ResourceClient {

	public AddTeamToResourceTree(URI url, String clientUser, String clientPassword) {
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
	
	@SuppressWarnings("unused")
	private static void buildOptions() {
		Options options = new Options();
		options.addOption(Option.builder("weburl").argName("url").required().desc("UCD URI").build());
		options.addOption(Option.builder("userid").argName("userid").required().desc("user logon id").build());
	}

	
	public static void main(String[] args) {
		
		
		URI uri = null;
		try {
			uri = new URI(args[0]);
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		AddTeamToResourceTree adder = new AddTeamToResourceTree(uri, args[1], args[2]);
		try {
			JSONArray resources = adder.getEnvironmentResource(args[3], args[4]);
			for (int i = 0; i < resources.length(); i++) {
				String cPath = resources.getJSONObject(i).getString("path");
				cPath = cPath.replace("\\", "");
				adder.addResourceToTeam(cPath, args[5],null);
			}
		} catch (IOException | JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
