package com.ibm.db.dap;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.codehaus.jettison.json.JSONStringer;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;

public class RSUtils {
	static public NativeObject genJSMap(Map<String, String> map) {
		List<String> alist = null;
		NativeObject nobj = new NativeObject();
		for (Entry<String, String> entry : map.entrySet()) {
			nobj.defineProperty(entry.getKey(), entry.getValue(),
					NativeObject.READONLY);
		}

		// Get Engine and place native object into the context
		return nobj;
	}

	static public NativeObject toObject(JSONObject jsonObject) throws JSONException {
		// Create native object
		NativeObject object = new NativeObject();

		Iterator<String> keys = jsonObject.keys();
		while (keys.hasNext()) {
			String key = (String) keys.next();
			Object value = jsonObject.get(key);
			if (value instanceof JSONObject) {
				object.put(key, object, toObject((JSONObject) value));
			} else {
				object.put(key, object, value);
			}
		}

		return object;
	}
	
 }
