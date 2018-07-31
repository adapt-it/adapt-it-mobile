#!/bin/bash
# build-ai.sh -- builds Adapt It Mobile on macOS (ios and Android platforms)

DIR=$( cd "$( dirname "$0" )" && pwd )
TRUNK=$DIR
CURRENT_OS="OSX" 
ANDROID_VER="@6.3.0"    # cordova-android version
IOS_VER="@4.5.4"        # cordova-ios version
WIN_VER="@latest"       # cordova-windows version

echo " "
echo "-- Adapt It Mobile build configuration --"
echo "  Current directory: $DIR"
echo "  cordova-android: $ANDROID_VER"
echo "  cordova-ios: $IOS_VER"
echo "  cordova-win: $WIN_VER"
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
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    # Ancient mingw Windows thing -- error out
    echo "unsupported operating system for AIM build"
    exit 1
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    # Windows 10? 64 bit mingw implementation
    osType="Windows"
    cordova platform add android $ANDROID_VER
    cordova platform add windows $WIN_VER
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

