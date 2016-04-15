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
	
	public String[] getTargetsForComponent(String environmentName, String applicationName, String deployableName, String agent)
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
				filtered.put(res);
			}
		}
		String targets[] = new String[filtered.length()];
		for (int j = 0; j < filtered.length(); j++) {
			targets[j] = getTarget(filtered.getJSONObject(j));
		}
		return targets;
	}

	private String getTarget(JSONObject jsonObject)  {
		
		String result = "";
			String path;
			try {
				path = jsonObject.getString("path");
				path = path.replace("\\", "");
				path = path.substring(0, path.lastIndexOf("/"));
				JSONObject parent = getResourceInfo(path);
				while (parent != null) {
					String id = parent.getString("id");
					JSONObject role = null;
					try {
						role = parent.getJSONObject("role");
					} catch (JSONException k){}
					String name = "";
					if (role!=null)
						name = role.getString("name");
					if (name.equals("WebSphereServer")) {
						result = "server=" + parent.getString("name") + result;
					} else if (name.equals("WebSphereNode")) {
						result = "node=" + parent.getString("name") + "," + result;
						
					} else if (name.equals("WebSphereCluster")) {
						result = "cluster=" + parent.getString("name") + "," + result;
						
					} else if (name.equals("WebSphereCell")) {
						result = "cell=" + parent.getString("name") + "," + result;
						
					}
					path = parent.getString("path");
					path = path.replace("\\", "");
					path = path.substring(0, path.lastIndexOf("/"));
					parent = null;
					try {
						parent = getResourceInfo(path);
					} catch (JSONException | IOException x) {}
				}
			} catch (JSONException | IOException e) {
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
		} catch (IOException | JSONException e) {
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
	
	static public void main(String[] args) {
		URI uri;
		try {
			uri = new URI("http://localhost:8060");
			ResourceClientExt client = new ResourceClientExt(uri, "admin", "admin");
			String[] targets = client.getTargetsForComponent("DEV1", "zions-bankcorp-pwr-common", "application", "wasAppSrv03agent");
			for (String out: targets) {
				System.out.println(out);
			}
		} catch (URISyntaxException | IOException | JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
