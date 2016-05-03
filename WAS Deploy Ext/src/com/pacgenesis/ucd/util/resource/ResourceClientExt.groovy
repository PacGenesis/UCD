package com.pacgenesis.ucd.util.resource;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
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
	
	public String[] getTargetsForComponent(String environmentName, 
			String applicationName, String deployableName, String agent,String filterTag)
			throws ClientProtocolException, IOException, JSONException {
				
		def filtered = getRelatedResources(environmentName, applicationName, deployableName, agent, filterTag);
		ArrayList<String> targets= new ArrayList<String>();
		filtered.each { target ->
			targets.add(getTarget(target));
		}
		return targets.toArray();
	}
			
	public ArrayList<Object> getRelatedResources(String environmentName, 
			String applicationName, String deployableName, String agent,String filterTag)
			throws ClientProtocolException, IOException, JSONException {
		def result = getEnvironmentResource(environmentName, applicationName);
		ArrayList<Object> filtered = new ArrayList<Object>();
		result.each { res ->
			String name = res.name;
			String path =  res.path;
			def full = getResourceInfo(path);
			def role = null;
			String type = "";
			try {
				role = full.role;
				type = role.specialType;
			} catch (Exception e) {}
			if (role != null && type.equals("COMPONENT") ) {
				if (deployableName.equals(name) && path.contains(agent)) {
					if (filterTag != null && !filterTag.equals("")) {
						if (hasTag(res,filterTag)) {
							filtered.add(res);
						}
					} else {
						filtered.add(res);
					}
				}
			}
		}
		return filtered;
	}
	
	private boolean hasTag(def res, String filter) {
		Boolean retVal = false;
		
		def tags = null;
		try {
			tags = res.tags;
		} catch (Exception e){}
		if (tags != null) {
			tags.each { tag ->
				String name = tag.name;
				if (name.equals(filter)) return true;
			}
		}
		return retVal;
	}
	
	private String getTarget(def tData)  {
		
		String result = "";
			String path;
			try {
				path = tData.path;
				path = path.replace("\\", "");
				path = path.substring(0, path.lastIndexOf("/"));
				def parent = getResourceInfo(path);
				int l = 0;
				while (parent != null) {
					String id = parent.id;
					def role = null;
					try {
						role = parent.role;
					} catch (Exception e) {}
					String name = "";
					String value = "";
					if (role!=null)
						name = role.name;
					if (name.equals("WebSphereServer")) {
						value = "server=" + parent.name;
					} else if (name.equals("WebSphereNode")) {
						value = "node=" + parent.name;
						
					} else if (name.equals("WebSphereCluster")) {
						value = "cluster=" + parent.name;
						
					} else if (name.equals("WebSphereCell")) {
						value = "cell=" + parent.name;
						
					}
					if (!value.equals("") && l == 0) {
						result = value + result;
						l++;
					} else if (!value.equals(""))
					{
						result = value + "," + result;
						l++;
					}
					path = parent.path;
					path = path.replace("\\", "");
					path = path.substring(0, path.lastIndexOf("/"));
					parent = null;
					try {
						parent = getResourceInfo(path);
					} catch (IOException x) {}
					
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		return "WebSphere:" + result;
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
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void addResourceToTeam(String resource, String team, String type) throws IOException {
		String uri = this.url.toString() + "/cli/resource/teams?team=" + encodePath(team) + "&type=" + encodePath(type)
				+ "&resource=" + encodePath(resource);

		HttpPut method = new HttpPut(uri);
		try {
			invokeMethod(method);
		} finally {
			releaseConnection(method);
		}
	}

	public void deleteResourceFromTeam(String resource, String team, String type) throws IOException {
		String uri = this.url.toString() + "/cli/resource/teams?team=" + encodePath(team) + "&type=" + encodePath(type)
				+ "&resource=" + encodePath(resource);
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
