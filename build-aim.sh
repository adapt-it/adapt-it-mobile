#!/bin/bash
# build-ai.sh -- builds Adapt It Mobile on macOS (ios and Android platforms)

DIR=$( cd "$( dirname "$0" )" && pwd )
TRUNK=$DIR
CURRENT_OS="OSX" 
ANDROID_VER="@12.0.1"    # cordova-android version
IOS_VER="@7.0.1"        # cordova-ios version

echo " "
echo "-- Adapt It Mobile build configuration --"
echo "  Current directory: $DIR"
echo "  cordova-android: $ANDROID_VER"
echo "  cordova-ios: $IOS_VER"
echo "-------------------------------------"

# troubleshooting helps -- enable if needed
# set -e
# set -x

# clean
# remove files from previous builds
rm -rf $TRUNK/platforms
if [ $? -ne 0 ]
then
  echo "Unable to remove platforms directory: $?"
  exit 1
fi

rm -rf $TRUNK/plugins
if [ $? -ne 0 ]
then
  echo "Unable to remove plugins directory: $?"
  exit 1
fi

# Add platforms as appropriate 
# (will also add plugins from config.xml)
if [ "$(uname)" == "Darwin" ]; then
    # macOS / OSX -- Android and iOS platforms
    osType="Darwin"
    echo "OSX detected... adding android and iOS platforms"
    cordova platform add android $ANDROID_VER
    cordova platform add ios $IOS_VER
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux -- Android
    osType="Linux"
    echo "Linux detected... adding android platform"
    cordova platform add android $ANDROID_VER
fi

# build ios and Android platforms
cordova build
if [ $? -ne 0 ]
then
  echo "Error building Adapt It Mobile: $?"
  exit 1
fi

echo " "
echo "--------------------------------------"
echo "-- Adapt It Mobile builds succeeded --"
echo "--------------------------------------"
echo " "

