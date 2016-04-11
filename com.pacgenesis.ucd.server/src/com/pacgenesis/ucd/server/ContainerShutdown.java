package com.pacgenesis.ucd.server;

import com.urbancode.container.tomcat.Container;

public class ContainerShutdown {
	public static void main(String[] args) throws Exception {
//		if (!(Container.SHUTDOWN_FILE.createNewFile()))
//			System.err.println("Shutdown file is present! Is the server running?");
		System.exit(0);
	}

}
