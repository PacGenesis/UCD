# Powershell 2.0
# Copyright (c) 2013-2014, Avnet Inc, All Rights Reserved Worldwide.
# This PowerShell script is to be set as a RightScript for disabling the admin account
# and is trigged by the IBM UrbanCode RightScale plugin

# Change local user, with a required local 
$computer=hostname
$user="Administrator"

# Windows SDK data for user permissions
$EnableUser = 512
$DisableUser = 2 

# Determines the action to take to enable or disable account
# Should be selected from an enumeration set in RightScript
# Options created should be Enable, Disable, and Toggle
$action=$ENV:ACCOUNT_ACTION

$objUser = [ADSI]"WinNT://$computer/$user"

try {
	switch($action)
	{
	 "Enable" {
		  Write-Host ("Enabling account for local " + $user)
		  $objUser.userflags = $EnableUser

		  }

	 "Disable" {
		  Write-Host ("Disabling account for local " + $user)
		  $objUser.userflags = $DisableUser
		 }

	 "Toggle" {
				if($objUser.accountdisabled) {
					$objUser.userflags = $EnableUser
					Write-Host ("Enabling account for local " + $user)
				} else {
				$objUser.userflags = $DisableUser
				Write-Host ("Disabling account for local " + $user)
				}
			}

	}

	$objUser.setinfo()
}
catch
{
    throw "ERROR: $_"
    exit 101
}