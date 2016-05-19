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
	
	public def getResourceChildrenExt(String id) throws IOException {
		def result = null;
		String eUrl = this.url.toString();
		String eId = encodePath(id);
		String uri = "${eUrl}/cli/resource/?parent=${eId}";

		try {
			HttpGet method = new HttpGet(uri);
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
			def children = this.getResourceChildrenExt(parentResource);
			children.each { child -> 
				String cPath = child.path;
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
		String startURL = this.url.toString();
		String eResourceName = encodePath(resourceName);
		String eName = encodePath(name);
		String eValue = encodePath(value);
		String eIsSecure = encodePath(isSecure);


		String uri = "${startURL}/cli/resource/setProperty?resource=${eResourceName}&name=${eName}&value=${eValue}&isSecure=${eIsSecure}";
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
