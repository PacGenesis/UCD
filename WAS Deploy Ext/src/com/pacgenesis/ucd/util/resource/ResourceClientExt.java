package com.pacgenesis.ucd.util.resource;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

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

	public JSONArray getEnvironmentResource(String environmentName, String applicationName)
			throws ClientProtocolException, IOException, JSONException {
		String uri = this.url + "/cli/environment/getBaseResources?environment=" + encodePath(environmentName);
		JSONArray result = null;
		if ((applicationName != null) && (!("".equals(applicationName)))) {
			uri = uri + "&application=" + encodePath(applicationName);
		}

		HttpGet method = new HttpGet(uri);
		try {
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			result = new JSONArray(body);
		} finally {
			releaseConnection(method);
		}
		return result;
	}
	
	public String[] getTargetsForComponent(String environmentName, 
			String applicationName, String deployableName, String agent,String filterTag)
			throws ClientProtocolException, IOException, JSONException {
		JSONArray result = getEnvironmentResource(environmentName, applicationName);
		JSONArray filtered = new JSONArray();
		for (int i = 0; i < result.length(); i++) {
			JSONObject res = result.getJSONObject(i);
			String name = res.getString("name");
			String path =  res.getString("path");
			JSONObject full = getResourceInfo(path);
			JSONObject role = null;
			String type = "";
			try {
				role = full.getJSONObject("role");
				type = role.getString("specialType");
			} catch (JSONException j) {}
			if (role == null || !type.equals("COMPONENT") ) continue;
			if (deployableName.equals(name) && path.contains(agent)) {
				if (filterTag != null && !filterTag.equals("")) {
					if (hasTag(res,filterTag)) {
						filtered.put(res);
					}
				} else {
					filtered.put(res);
				}
			}
		}
		String targets[] = new String[filtered.length()];
		for (int j = 0; j < filtered.length(); j++) {
			targets[j] = getTarget(filtered.getJSONObject(j));
		}
		return targets;
	}
	public JSONArray getRelatedResources(String environmentName, 
			String applicationName, String deployableName, String agent,String filterTag)
			throws ClientProtocolException, IOException, JSONException {
		JSONArray result = getEnvironmentResource(environmentName, applicationName);
		JSONArray filtered = new JSONArray();
		for (int i = 0; i < result.length(); i++) {
			JSONObject res = result.getJSONObject(i);
			String name = res.getString("name");
			String path =  res.getString("path");
			JSONObject full = getResourceInfo(path);
			JSONObject role = null;
			String type = "";
			try {
				role = full.getJSONObject("role");
				type = role.getString("specialType");
			} catch (JSONException j) {}
			if (role == null || !type.equals("COMPONENT") ) continue;
			if (deployableName.equals(name) && path.contains(agent)) {
				if (filterTag != null && !filterTag.equals("")) {
					if (hasTag(res,filterTag)) {
						filtered.put(res);
					}
				} else {
					filtered.put(res);
				}
			}
		}
		return filtered;
	}
	
	private boolean hasTag(JSONObject res, String filter) {
		Boolean retVal = false;
		
		JSONArray tags = null;
		try {
			tags = res.getJSONArray("tags");
		} catch (JSONException e) {}
		if (tags != null) {
			for (int i = 0; i < tags.length(); i++) {
				try {
					JSONObject tag = tags.getJSONObject(i);
					String name = tag.getString("name");
					if (name.equals(filter)) return true;
				} catch (JSONException e) {}
			}
		}
		return retVal;
	}
	private String getTarget(JSONObject jsonObject)  {
		
		String result = "";
			String path;
			try {
				path = jsonObject.getString("path");
				path = path.replace("\\", "");
				path = path.substring(0, path.lastIndexOf("/"));
				JSONObject parent = getResourceInfo(path);
				int l = 0;
				while (parent != null) {
					String id = parent.getString("id");
					JSONObject role = null;
					try {
						role = parent.getJSONObject("role");
					} catch (JSONException k){}
					String name = "";
					String value = "";
					if (role!=null)
						name = role.getString("name");
					if (name.equals("WebSphereServer")) {
						value = "server=" + parent.getString("name");
					} else if (name.equals("WebSphereNode")) {
						value = "node=" + parent.getString("name");
						
					} else if (name.equals("WebSphereCluster")) {
						value = "cluster=" + parent.getString("name");
						
					} else if (name.equals("WebSphereCell")) {
						value = "cell=" + parent.getString("name");
						
					}
					if (!value.equals("") && l == 0) {
						result = value + result;
						l++;
					} else if (!value.equals(""))
					{
						result = value + "," + result;
						l++;
					}
					path = parent.getString("path");
					path = path.replace("\\", "");
					path = path.substring(0, path.lastIndexOf("/"));
					parent = null;
					try {
						parent = getResourceInfo(path);
					}  catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					} catch (IOException x) {}
					
				}
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}  catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		return "WebSphere:" + result;
	}

	public JSONObject getResourceInfo(String path) throws IOException, JSONException {
		JSONObject result = null;

		String uri = this.url + "/cli/resource/info?resource=" + encodePath(path);

		HttpGet method = new HttpGet(uri);
		try {
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			result = new JSONObject(body);
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
		String uri = this.url + "/cli/resource/teams?team=" + encodePath(team) + "&type=" + encodePath(type)
				+ "&resource=" + encodePath(resource);

		HttpPut method = new HttpPut(uri);
		try {
			invokeMethod(method);
		} finally {
			releaseConnection(method);
		}
	}

	public void deleteResourceFromTeam(String resource, String team, String type) throws IOException {
		String uri = this.url + "/cli/resource/teams?team=" + encodePath(team) + "&type=" + encodePath(type)
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

		String uri = this.url + "/cli/resource/setProperty?resource=" + encodePath(resourceName) + "&name="
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

		String uri = this.url + "/cli/resource/update?resource=" + encodePath(resource);

		HttpPut method = new HttpPut(uri);
		try {
			method.setEntity(getStringEntity(data));
			invokeMethod(method);
		} finally {
			releaseConnection(method);
		}
	}
	
}
