package com.pacgenesis.ucd.util.resource;

import java.io.IOException;
import java.net.URI;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;

import com.urbancode.ud.client.ResourceClient;

public class ResourceClientExt extends ResourceClient {

	public ResourceClientExt(URI url, String clientUser, String clientPassword) {
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
}
