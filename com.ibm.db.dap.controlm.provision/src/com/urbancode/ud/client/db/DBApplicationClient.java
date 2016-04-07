package com.urbancode.ud.client.db;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.mozilla.javascript.NativeObject;

import com.ibm.db.dap.RSUtils;
import com.urbancode.ud.client.ApplicationClient;

public class DBApplicationClient extends ApplicationClient {

	public DBApplicationClient(URI url, String clientUser, String clientPassword) {
		super(url, clientUser, clientPassword);
		// TODO Auto-generated constructor stub
	}

	public String getAllApplications() throws ClientProtocolException,
			IOException, JSONException {
		JSONObject result = null;
		String uri = this.url + "/rest/deploy/application";

		HttpGet method = new HttpGet(uri);

		HttpResponse response = invokeMethod(method);
		String body = getBody(response);
		return body;
	}

	public String getApplicationData(String appName) throws IOException,
			JSONException {
		JSONObject result = null;
		String uri = this.url + "/cli/application/info?application="
				+ encodePath(appName);

		HttpGet method = new HttpGet(uri);

		HttpResponse response = invokeMethod(method);
		String body = getBody(response);
		return body;
	}
	
	public String getApplicationAllData(String appId) throws IOException,
	JSONException {
		JSONObject result = null;
		String uri = this.url + "/rest/deploy/application/"
				+ encodePath(appId);
		
		HttpGet method = new HttpGet(uri);
		
		HttpResponse response = invokeMethod(method);
		String body = getBody(response);
		return body;
	}

	public String getApplicationProcesses(String appId) throws ClientProtocolException, IOException {
		String uri = this.url + "/rest/deploy/application/"
				+ encodePath(appId) + "/processes/true";
	
		HttpGet method = new HttpGet(uri);
	
		HttpResponse response = invokeMethod(method);
		String body = getBody(response);
		return body;
	}
	public String getApplicationProcessData(String processId, String version) throws ClientProtocolException, IOException {
		String uri = this.url + "/rest/deploy/applicationProcess/"
				+ encodePath(processId) + "/" + encodePath(version);
	
		HttpGet method = new HttpGet(uri);
	
		HttpResponse response = invokeMethod(method);
		String body = getBody(response);
		return body;
	}
	
	public String getApplicationEnvironmentsData(String appId) throws ClientProtocolException, IOException {
		String uri = this.url + "/rest/deploy/application/"
				+ encodePath(appId) + "/environments/false";
	
		HttpGet method = new HttpGet(uri);
	
		HttpResponse response = invokeMethod(method);
		String body = getBody(response);
		return body;
	}
	
	public String saveApplicationProcess(String processId, String process, String version) throws ClientProtocolException, IOException {
		String uri = this.url + "/rest/deploy/applicationProcess/"
				+ encodePath(processId) + "/saveActivities";
	
		HttpPut method = new HttpPut(uri);
		method.addHeader("applicationProcessVersion", "" + version);
	    StringEntity requestEntity = new StringEntity(process);
	    method.setEntity(requestEntity);
	
		HttpResponse response = invokeMethod(method);
		if (response.getEntity() != null)
			response.getEntity().consumeContent();
		
		uri = this.url + "/rest/deploy/applicationProcess/"
				+ encodePath(processId) + "/-1";
		HttpGet gmethod = new HttpGet(uri);
		response = invokeMethod(gmethod);
		String body = getBody(response);
		return body;
		
	}
}
