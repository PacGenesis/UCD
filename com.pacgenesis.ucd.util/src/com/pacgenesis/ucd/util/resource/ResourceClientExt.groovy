package com.pacgenesis.ucd.util.resource;

import java.io.IOException;
import java.net.URI;
import groovy.json.*;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.urbancode.ud.client.ResourceClient;

public class ResourceClientExt extends ResourceClient {

	public ResourceClientExt(URI url, String clientUser, String clientPassword) {
		super(url, clientUser, clientPassword);
		// TODO Auto-generated constructor stub
	}

	public def getEnvironmentResource(String environmentName, String applicationName)
			throws ClientProtocolException, IOException, JSONException {
		String uri = this.url.toString() + "/cli/environment/getBaseResources?environment=" + encodePath(environmentName);
		def result = null;
		if ((applicationName != null) && (!("".equals(applicationName)))) {
			uri = uri + "&application=" + encodePath(applicationName);
		}

		HttpGet method = new HttpGet(uri);
		try {
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			result = new JsonSlurper().parseText(body);
		} finally {
			releaseConnection(method);
		}
		return result;
	}

	public def getResourceInfo(String path) throws IOException, JSONException {
		def result = null;

		String uri = this.url.toString() + "/cli/resource/info?resource=" + encodePath(path);

		HttpGet method = new HttpGet(uri);
		try {
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			result = new JsonSlurper().parseText(body);
		} finally {
			releaseConnection(method);
		}

		return result;
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
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void addResourceToTeam(String resource, String team, String type) throws IOException {
		String startURL = this.url.toString();
		String eTeam = encodePath(team);
		String eResource = encodePath(resource);
		String eType = encodePath(type);
		String uri = "${startURL}/cli/resource/teams?team=${eTeam}&type=${eType}&resource=${eResource}";

		HttpPut method = new HttpPut(uri);
		try {
			invokeMethod(method);
		} finally {
			releaseConnection(method);
		}
	}

	public void deleteResourceFromTeam(String resource, String team, String type) throws IOException {
		String startURL = this.url.toString();
		String eTeam = encodePath(team);
		String eResource = encodePath(resource);
		String eType = encodePath(type);
		String uri = "${startURL}/cli/resource/teams?team=${eTeam}&type=${eType}&resource=${eResource}";
		HttpDelete method = new HttpDelete(uri);
		try {
			invokeMethod(method);
		} finally {
			releaseConnection(method);
		}
	}

	public String setResourceProperty(String resourceName, String name, String value, boolean isSecure)
			throws IOException {
		if (("".equals(resourceName)) || ("".equals(name))) {
			throw new IOException("a required argument was not supplied");
		}

		String uri = this.url.toString() + "/cli/resource/setProperty?resource=" + encodePath(resourceName) + "&name="
				+ encodePath(name) + "&value=" + encodePath(value) + "&isSecure="
				+ encodePath(String.valueOf(isSecure));
		String result = null;
		HttpPut method = new HttpPut(uri);
		try {
			invokeMethod(method);
			if (isSecure) {
				result = name + "=****";
			} else {
				result = name + "=" + value;
			}
		} finally {
			releaseConnection(method);
		}
		return result;
	}

	public void updateResource(String resource, JSONObject data) throws IOException {

		String uri = this.url.toString() + "/cli/resource/update?resource=" + encodePath(resource);

		HttpPut method = new HttpPut(uri);
		try {
			method.setEntity(getStringEntity(data));
			invokeMethod(method);
		} finally {
			releaseConnection(method);
		}
	}
}
