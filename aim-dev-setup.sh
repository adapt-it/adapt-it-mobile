#!/bin/bash
# aim-dev-setup.sh -- Set up environment for developing Adapt It Mobile (AIM) on Ubuntu 12.04, 14.04 or higher
# Note: This scipt may be called from the setup-work-dev-tools.sh script (option 2), or it 
#       can be called independently as a stand-alone script.
# Date: 2015-06-23
# Author: Jonathan Marsden <jmarsden@fastmail.fm>
# Revised: 2015-06-10 by Bill Martin <bill_martin@sil.org> 
#    - changed PROJECT_DIR default to ~/projects
#    - add check for whether we're running in a virtual machine - if not, add qemu-kvm to install
#      list; if we're running in a vm, ask user if the script should continue to setup for aim
#    - add check for apt-cache availability of npm >= 2.10.0 and nodejs >= 0.12.3
#      If the apt-cache versions of npm and/or nodejs are to old (currently normally the case), 
#      offer to install v0.12 from NodeSource, using their install script which supports
#      Ubuntu/Linux Mint distros 12.04LTS, 14.04LTS (see https://github.com/nodesource/distributions)
#    - install curl early on (needed for NodeSource setup)
#    - add g++ tools to install list (test on fresh Ubuntu VM show g++ is needed for cordova)
#    - add java 7 packages (openjdk-7-jre openjdk-7-jdk openjdk-7-jre-lib) and icedtea-7-plugin to intall list
#    - after download of AIM sources, rsync res dir in www back to adapt-it-mobile dir
#    - check for existing git 'user.name' and 'user.email' and ask user for them if they are not already set
#    - set the 'push.default simple' git option
#    - only download Android SDK components if they haven't been downloaded (saves 10min on
#      subsequent setup runs)
#    - ensure user's ~/tmp dir is owned by $USER rather than root
#    - add more echo comments throughout
#    - tweaked setting of ANDROID_HOME in .profile to be exported, ie: export ANDROID_HOME=...
#      otherwise, the env variable does not get set in subsequent terminal sessions/logins
#    - flesh out next steps message at end of script
#    - ensured that this script can be run repeatedly without problems on 12.04LTS and 14.04LTS.

PROJECT_DIR=${1:-~/projects}	# AIM development file location, default ~/projects/

# This vercomp function from: Dennis Williamson post @ http://stackoverflow.com/questions/4023830/bash-how-compare-two-strings-in-version-format
vercomp () {
    if [[ $1 == $2 ]]
    then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++))
    do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++))
    do
        if [[ -z ${ver2[i]} ]]
        then
            # fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]}))
        then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]}))
        then
            return 2
        fi
    done
    return 0
}

# whm Notes: 
# 1. npm is not included in AIM_DEV_TOOLS below as it is installed
# before these tools below via the NodeSource installation.
# 2. Erik says version 7 of the jdk should be used. openjdk-7-jdk, 
# openjdk-7-jre and openjdk-7-jre-lib are available in both 12.04 
# and 14.04 based Ubuntu distros, but default-jdk installs openjdk-6 
# as the default on 12.04, so instead of installing default-jdk, 
# we'll explicitly purge any existing openjdk-6 packages, and then
# install the openjdk-7-jdk, openjdk-7-jre and openjdk-7-jre-lib 
# packages if they are not already installed.
AIM_DEV_TOOLS="git inkscape openjdk-7-jre openjdk-7-jdk openjdk-7-jre-lib icedtea-7-plugin ant dpkg-dev curl g++"

# Setup AIM development tools
echo "Seting up AIM Tools..."

# Install needed Ubuntu packages
sudo apt-get update -y

# Detect if running this script within a VirtualBox or VMware VM, if not install qemu-kvm
runningInVBVM=`sudo dmidecode |grep -i -m1 "Product Name: VirtualBox"`
runningInVMwareVM=`sudo dmidecode |grep -i -m1 "Product Name: VMware Virtual Platform"`
if [[ "$runningInVBVM" == ""  && "$runningInVMwareVM" == "" ]]
then
  echo -e "\nWe're not in a virtual machine. Adding qemu-kvm is install list"
  #sudo apt-get install qemu-kvm -y
  AIM_DEV_TOOLS=$AIM_DEV_TOOLS" qemu-kvm"
else
  echo -e "\nWe are running in a virtual machine..."
  echo "The qemu-kvm tool can't be installed - hardware acceleration won't be possible."
  echo "Therefore, running the 'cordova emulate android' command won't work in this VM."
  read -r -p "Continue setting up for AIM on this VM? [y/N] " response
  case $response in
    [yY][eE][sS]|[yY]) 
        echo "Continuing with setup..."
        ;;
    *)
        echo "Aborting..."
        exit 0
        ;;
  esac
fi

# Note: Android and Phonegap/Cordova are developing rapidly, so I think it is good to
# develop Adapt It Mobile (AIM) with the most up-to-date tools.
# Erik says building aim requires npm >= 2.10.0 and nodejs >= 0.12.3, so I'm
# setting the starting mininum version to be those versions. In case the standard Ubuntu
# repos have those versions, I'll first check for apt-cache version availability of 
# those versions. Ubuntu Vivid (15.04) ships with nodejs v0.10.25 so it is not likely
# that the required version of nodejs will be available in an LTS for some time. So, 
# we'll notify the user that the distro's repo doesn't have the required version of  
# nodejs, and offer to install the newer version nodejs v0.12 (and npm) from nodesource,  
# utilizing their installation script (see https://github.com/nodesource/distributions).
npmMinVer="2.10.0"
nodejsMinVer="0.12.3"
npmVerRepo=`sudo apt-cache show npm | grep Version: | cut -d ' ' -f2 | cut -d '~' -f1 | cut -d '-' -f1`
nodejsVerRepo=`sudo apt-cache show nodejs | grep Version: | cut -d ' ' -f2 | cut -d '~' -f1 | cut -d '-' -f1`
echo -e "\nChecking versions of npm and nodejs available in repos..."
vercomp $npmMinVer $npmVerRepo
case $? in
   0) npmComp='=';;
   1) npmComp='>';;
   2) npmComp='<';;
esac
if [[ $npmComp = '<' ]] || [[ $npmComp = '=' ]]
then
  echo "  The npm version $npmVerRepo is new enough (at least v $npmMinVer)"
else
  echo "  The npm version $npmVerRepo is too old for AIM development."
  echo "  At least version $npmMinVer is required to develop AIM on your system."
fi
vercomp $nodejsMinVer $nodejsVerRepo
case $? in
   0) nodejsComp='=';;
   1) nodejsComp='>';;
   2) nodejsComp='<';;
esac
if [[ $nodejsComp = '<' ]] || [[ $nodejsComp = '=' ]]
then
  echo "  The nodejs version $nodejsVerRepo is new enough (at least v $nodejsMinVer)"
else
  echo "  The nodejs version $nodejsVerRepo is too old for AIM development."
  echo "  At least version $nodejsMinVer is required to develop AIM on your system."
  echo "  The newer nodejs version is available from NodeSource, but requires"
  echo "  adding nodesource.list to your /etc/apt/sources.list.d and installing"
  echo "  other dependencies."
  echo "  Installing nodejs from NodeSource will also upgrade your npm version."
  # Ask user if we should continue and install the required version from nodesource
  read -r -p "Install the newer version of nodejs/npm from NodeSource? [y/N] " response
  case $response in
    [yY][eE][sS]|[yY]) 
        echo "Continuing with setup..."
        ;;
    *)
        echo "Aborting..."
        exit 0
        ;;
  esac
fi
# Retrieving and executing the NodeSource script requires curl, so make sure it is installed
sudo apt-get install curl
# whm added: some re-install problems can be avoided by first removing any previous npm configuration at ~/.npm
sudo rm -rf $HOME/.npm
# Retrieve and execute the NodeSource script for installing nodejs v0.12
curl -sL https://deb.nodesource.com/setup_dev | sudo bash -
sudo apt-get install -y nodejs

# Remove/Purge any existing openjdk java 1.6.x packages from the system
sudo apt-get purge openjdk-6-jdk openjdk-6-jre openjdk-6-jre-headless -y

# Install the main list of tools (which include openjdk java 1.7 packages)
echo -e "\nInstalling software tools needed for building AIM..."
sudo apt-get install $AIM_DEV_TOOLS -y

# Use update-java-alternatives to set the java runtime and development tools to point
# to the 1.7.x java implementation. Also set all runtime and development tools to auto mode.
# This is preferable to setting the JAVA_HOME environment variable. See the README.alternatives
# file at: /usr/lib/jvm/java-1.7.x*/docs/README.alternatives
JAVA17PATH=`update-java-alternatives --list | grep java-1.7 | cut -d ' ' -f3`
sudo update-java-alternatives --set $JAVA17PATH
sudo update-java-alternatives --auto

# Allow nodejs to be run as node, then use npm to install cordova
echo -e "\nAllowing nodejs to be run as node"
[ -h /usr/bin/node -o -x /usr/bin/node ] || sudo ln -s /usr/bin/nodejs /usr/bin/node
echo -e "\nUsing npm to install cordova and npm update"
sudo npm -g install cordova i18next i18next-conv -q
sudo npm -g update -q

# Set user crontab to update cordova daily using npm
echo -e "\nSet user crontab to update cordova daily using npm"
if crontab -l | grep -sq 'npm update -g cordova'; then
  :	# Crontab already updates cordova
else
  TMPFILE=$(mktemp)
  crontab -l >$TMPFILE
  echo "@daily npm update -g cordova" >>$TMPFILE
  crontab $TMPFILE
  rm $TMPFILE
fi

# Install extra i386 packages if running on amd64
echo -e "\nInstall extra i386 packages if needed"
dpkg-architecture -eamd64 && sudo apt-get install libc6:i386 libstdc++6:i386 zlib1g:i386 -y

# Download AIM sources from git
# Check for an existing local adaptit repo
if [ -f $PROJECT_DIR/adapt-it-mobile/.git/config ]; then
  echo -e "\nPulling in any adapt-it-mobile changes to $PROJECT_DIR/adapt-it-mobile/..."
  cd $PROJECT_DIR/adapt-it-mobile
  git pull
else
  echo -e "\nCloning the Adapt It Mobile (AIM) sources to $PROJECT_DIR/adapt-it-mobile/..."
  mkdir -p "${PROJECT_DIR}"
  cd ${PROJECT_DIR}
  [ -d adapt-it-mobile ] || git clone https://github.com/adapt-it/adapt-it-mobile.git
fi

# Check for an existing git user.name and user.email
echo -e "\nTo help with AIM development you should have a GitHub user.name and user.email."
echo "Checking for previous configuration of git user name and git user email..."
# work from the adapt-it-mobile repo
cd $PROJECT_DIR/adapt-it-mobile
gitUserName=`git config user.name`
gitUserEmail=`git config user.email`
if [ -z  "$gitUserName" ]; then
  echo "  A git user.name has not yet been configured."
  read -p "Type your git user name: " gitUserName
  if [ ! -z "$gitUserName" ]; then
    echo "  Setting $gitUserName as your git user.name"
    git config user.name "$gitUserName"
  else
    echo "  Nothing entered. No git configuration made for user.name!"
  fi
else
  echo "  Found this git user.name: $gitUserName"
  echo "  $gitUserName will be used as your git name for the adaptit repository."
fi
      
if [ -z  "$gitUserEmail" ]; then
  echo "  A git user.email has not yet been configured."
  read -p "Type your git user email: " gitUserEmail
  if [ ! -z "$gitUserEmail" ]; then
    echo "  Setting $gitUserEmail as your git user.email"
    git config user.email "$gitUserEmail"
  else
    echo "  Nothing entered. No git configuration made for user.email"
  fi
else
  echo "  Found this git user.email: $gitUserEmail"
  echo "  $gitUserEmail will be used as your git email for the adaptit repository."
fi
# Add 'git config push.default simple' command which will be the default in git version 2.0
# In Ubuntu Precise 12.04, the git version is 1.7.9 which doesn't recognize a 'simple'
# setting for push.default, so leave any setting up to the developer.
#git config push.default simple.
echo -e "\nThe git configuration settings for the adaptit repository are:"
git config --list
sleep 2

# whm Added: To avoid cp errors when building the android project, I'm copying the adapt-it-mobile/www/res
# folder to adapt-it-mobile/res/ folder
echo -e "\nCopying res folder from www to adapt-it-mobile"
rsync -a --update "${PROJECT_DIR}"/adapt-it-mobile/www/res/ "${PROJECT_DIR}"/adapt-it-mobile/res

# Download and unpack/set up Android SDK (AOSP)
echo -e "\nDownload and unpack/set up Android SDK (AOSP)"
SDK_VERSION=24.2 # Latest SDK version, see https://developer.android.com/sdk/index.html#Other
wget -c http://dl.google.com/android/android-sdk_r${SDK_VERSION}-linux.tgz
tar Czxfp ~ "${PROJECT_DIR}/android-sdk_r${SDK_VERSION}-linux.tgz"
grep -sq "/android-sdk-linux/tools" ~/.profile \
  || echo 'PATH=$PATH:$HOME/android-sdk-linux/tools:$HOME/android-sdk-linux/platform-tools' >>~/.profile
grep -sq "^export ANDROID_HOME=" ~/.profile \
  || echo 'export ANDROID_HOME=$HOME/android-sdk-linux' >>~/.profile
[ -z "$ANDROID_HOME" ] && source ~/.profile

# Download Android SDK components needed
# To get a full list of available SDK components, run:
#   android list sdk --extended -a
echo -e "\nDownload Android SDK components if needed"
# skip the android update sdk --no-ui -a --filter $COMPONENTS call if specified android
# version and api level already exist as targets
andrVer=`$HOME/android-sdk-linux/tools/android list target |grep "Name: Android 5.1.1"`
andrApi=`$HOME/android-sdk-linux/tools/android list target |grep "API level: 22"`
if [ -z "$andrVer" ] || [ -z "$andrApi" ]
then
  COMPONENTS=platform-tools,build-tools-22.0.1,android-22,sys-img-x86-android-22,sys-img-armeabi-v7a-android-22
  android update sdk --no-ui -a --filter $COMPONENTS 
else
  echo "$andrVer $andrApi already exists"
fi

# Create a default Android emulator to test with (one that uses API Level 22 = Android 5.1.1)
# For speed, use an x86 emulation by default.  Use --abi default/armeabi-v7 for ARM emulator.
echo -e "\nCreate a default Android emulator that uses API 22/Android 5.1.1"
android list avds -c |grep -qs 'android-5.1.1-WVGA800' || \
  android create avd --name android-5.1.1-WVGA800 -t android-22 --abi default/x86

# [Optional] Install the Brackets editor.  See http://download.brackets.io/.

# Build AIM for Android
cd "${PROJECT_DIR}/adapt-it-mobile"
# Add android platform if not already added
# whm Note: On a fresh Ubuntu 14.04 system, the /home/$USER/tmp/ directory is owned by root.
# While the standard /tmp directory is owned by root, the user's ~/tmp directory needs to be 
# owned by the $USER in order for the 'cordova ... add ...' commands to succeed.
# Otherwise, the 'cordova platform add android' command issues this error:
#   Unable to fetch platform android: Error: EACCES, mkdir '/home/bill/tmp/npm-12127-zrD08_YV'
# and the 'cordova plugin add ...' commands issue errors similar to this:
#   Fetching from npm failed: EACCES, mkdir '/home/bill/tmp/npm-12133-X9FTvbhR'
#   Error: EACCES, mkdir '/home/bill/tmp/npm-12133-X9FTvbhR'
echo -e "\nEnsuring the ~/tmp directory of user: $USER is owned by $USER"
sudo chown $USER:$USER ~/tmp

echo -e "\nAdd android platform if not already added"
cordova platform list | grep ^Installed |grep -sq android || cordova platform add android
# Add the plugins from npm
echo -e "\nAdd Android plugins from npm"
cordova plugin add cordova-plugin-crosswalk-webview
cordova plugin add cordova-plugin-dialogs
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-file-transfer
cordova plugin add cordova-plugin-fonts
cordova plugin add cordova-plugin-globalization
cordova plugin add cordova-sqlite-storage
# Build the project
echo -e "\nBuild the Android project"
cordova build android

# Output help for the developer on next steps to take
echo -e "\nUsage (next steps):"
echo -e "   Recommended: Do a cold boot before running the cordova build and emulate"
echo "      commands shown below (if the build or emulate process appears to hang up)"
echo -e "   cd ${PROJECT_DIR}/adapt-it-mobile"
echo -e "   To build AIM run:\tcordova build android"
echo -e "   To test AIM on an Android emulator run:\tcordova emulate android &"
echo -e "   To run AIM on a connected Android device run:\tcordova run android &"

