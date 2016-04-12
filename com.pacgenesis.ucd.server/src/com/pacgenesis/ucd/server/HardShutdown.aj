package com.pacgenesis.ucd.server;

import java.lang.reflect.Field;

import com.urbancode.ds.UDeployServer;

public aspect HardShutdown {
	pointcut fixshutdown(UDeployServer target) : execution( void UDeployServer.shutdown()) && target(target);

	void around(UDeployServer target) : fixshutdown(target) {
		System.out.println("Hard Stop!");
		System.exit(0);
	}
}
