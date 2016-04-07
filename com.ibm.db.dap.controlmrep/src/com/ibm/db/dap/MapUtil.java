package com.ibm.db.dap;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.mozilla.javascript.NativeObject;

public class MapUtil {
	static public NativeObject genJSMap(Map<String, String> map) {
		List<String> alist = null;
		NativeObject nobj = new NativeObject();
		for (Entry<String, String> entry : map.entrySet()) {
		    nobj.defineProperty(entry.getKey(), entry.getValue(), NativeObject.READONLY);
		}

		// Get Engine and place native object into the context
		return nobj;
	}
}
