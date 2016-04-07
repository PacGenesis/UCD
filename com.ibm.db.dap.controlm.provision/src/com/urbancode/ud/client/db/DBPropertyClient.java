package com.urbancode.ud.client.db;

import java.io.IOException;
import java.net.URI;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;

import com.urbancode.ud.client.PropertyClient;

public class DBPropertyClient extends PropertyClient {

	public DBPropertyClient(URI url, String clientUser, String clientPassword) {
		super(url, clientUser, clientPassword);
		// TODO Auto-generated constructor stub
	}

	public String getPropertiesData(String path, String aversion) throws IOException,
			JSONException {
		JSONArray result = null;

		String uri = this.url + "/property/propSheet/" + encodePath(path)
				+ "." + aversion;

		HttpGet method = new HttpGet(uri);
		HttpResponse response = invokeMethod(method);
		String body = getBody(response);

		return body;
	}
	
	public void saveProperty(String path, String version, String body) throws IOException,
	JSONException {
		JSONArray result = null;
		
		String uri = this.url + "/property/propSheet/" + encodePath(path)
				+ ".-1/propValues";
		
		HttpPut method = new HttpPut(uri);
		method.addHeader("version", "" + version);
	    StringEntity requestEntity = new StringEntity(body);
	    method.setEntity(requestEntity);
	
		HttpResponse response = invokeMethod(method);
		if (response.getEntity() != null)
			response.getEntity().consumeContent();
	}

}
