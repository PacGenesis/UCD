package com.pacgenesis.ucd.util.processrequest

import java.io.IOException;
import java.net.URI;
import groovy.json.*;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;

import com.urbancode.ud.client.UDRestClient

class ProcessRequestClient extends UDRestClient {
	public ProcessRequestClient(URI url, String clientUser, String clientPassword) {
		super(url, clientUser, clientPassword);
	}
	public def getProcessRequest(String requestId) {
		def request = null;
		String startURL = this.url.toString();
		String eRequestId = encodePath(requestId);
		String uri = "${startURL}/cli/applicationProcessRequest/${eRequestId}";
		HttpGet method = new HttpGet(uri);
		try
		{
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			request = new JsonSlurper().parseText(body);
	    } catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		finally {
		  releaseConnection(method);
		}
		
		return request;
	}
}
