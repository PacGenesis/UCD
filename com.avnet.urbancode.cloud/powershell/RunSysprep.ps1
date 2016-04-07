# Powershell 2.0
# Copyright (c) 2013-2014, Avnet Inc, All Rights Reserved Worldwide.
# This powershell script runs Windows Sysprep with a specified input file
# to reset the SID


# Stop and fail script when a command fails.
$errorActionPreference = "Stop"

# File for unattended sysprep operations
# Location passed in as full file path from RightScale
# This file should exist on all cloud-provisioned servers
# The default value on an Amazon EC2 Win2008 cloud is C:\Program Files\Amazon\Ec2ConfigService\sysprep2008.xml
# The operation must reboot the machine
$unattended_file=$env:UNATTENDED_FILE_LOCATION
try
{
  Write-Host ("Sysprep initiated, system is restarting now")
  C:\windows\System32\sysprep\sysprep.exe /generalize /oobe /reboot /unattend:$unattended_file
} catch [exception]
{
    Write-Host ("ERROR:" + $_)
    exit 1
}