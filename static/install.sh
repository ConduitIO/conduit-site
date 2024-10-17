#!/bin/bash

# Copyright © 2024 Meroxa, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# The install script is based off of the MIT-licensed script from glide,
# the package manager for Go: https://github.com/conduitio/glide.sh/blob/master/get

PROJECT_NAME="conduit"

# Define color codes
reset="\033[0m"
conduit_blue="\033[38;5;45m"
red="\033[31m"

fail() {
  echo "$1"
  exit 1
}

# Function to print a string in bright blue
coloredEcho() {
  local text=$1
  printf "${conduit_blue}${text}${reset}\n"
}

initArch() {
  ARCH=$(uname -m)
  case $ARCH in
  aarch64) ARCH="arm64" ;;
  x86) ARCH="i386" ;;
  x86_64) ARCH="x86_64" ;;
  i686) ARCH="i386" ;;
  i386) ARCH="i386" ;;
  *)
    fail "Error: Unsupported architecture: $ARCH"
    ;;
  esac
}

initOS() {
  OS=$(echo $(uname))
  # We support Linux and Darwin, Windows (mingw, msys) are not supported.
  if [[ "$OS" != "Linux" && "$OS" != "Darwin" ]]; then
    fail "Error: Unsupported operating system: $OS"
  fi
}

initDownloadTool() {
  if type "curl" >/dev/null; then
    DOWNLOAD_TOOL="curl"
  elif type "wget" >/dev/null; then
    DOWNLOAD_TOOL="wget"
  else
    fail "You need 'curl' or 'wget' as a download tool. Please install it first before continuing"
  fi
}

getLatestTag() {
  # GitHub releases URL
  local url="https://github.com/ConduitIO/conduit/releases/latest"
  local latest_url # Variable to store the redirected URL

  # Check if DOWNLOAD_TOOL is set to curl or wget
  if [[ "$DOWNLOAD_TOOL" == "curl" ]]; then
    # Use curl to get the redirected link
    latest_url=$(curl -sL -o /dev/null -w "%{url_effective}" "$url")
  elif [[ "$DOWNLOAD_TOOL" == "wget" ]]; then
    # Use wget to get the redirected link
    latest_url=$(wget --spider --server-response --max-redirect=2 "$url" 2>&1 | grep "Location" | tail -1 | awk '{print $2}')
  else
    fail "Error: DOWNLOAD_TOOL is not set or not recognized. Use 'curl' or 'wget'."
  fi

  # Extract the tag from the redirected URL (everything after the last "/")
  TAG=$(echo "$latest_url" | grep -oE "[^/]+$")
}

get() {
  local url="$2"
  local body
  local httpStatusCode
  echo "Getting $url"
  if [ "$DOWNLOAD_TOOL" = "curl" ]; then
    httpResponse=$(curl -sL --write-out HTTPSTATUS:%{http_code} "$url")
    httpStatusCode=$(echo $httpResponse | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$httpResponse" | sed -e 's/HTTPSTATUS\:.*//g')
  elif [ "$DOWNLOAD_TOOL" = "wget" ]; then
    tmpFile=$(mktemp)
    body=$(wget --server-response --content-on-error -q -O - "$url" 2>$tmpFile || true)
    httpStatusCode=$(cat $tmpFile | awk '/^  HTTP/{print $2}')
  fi
  if [ "$httpStatusCode" != 200 ]; then
    echo "Request fail with http status code $httpStatusCode"
    fail "Body: $body"
  fi
  eval "$1='$body'"
}

getFile() {
  local url="$1"
  local filePath="$2"
  if [ "$DOWNLOAD_TOOL" = "curl" ]; then
    httpStatusCode=$(curl --progress-bar -w '%{http_code}' -L "$url" -o "$filePath")
  elif [ "$DOWNLOAD_TOOL" = "wget" ]; then
    body=$(wget --server-response --content-on-error -q -O "$filePath" "$url")
    httpStatusCode=$(cat $tmpFile | awk '/^  HTTP/{print $2}')
  fi
  echo "$httpStatusCode"
}

downloadFile() {
  local extension=$1       # Accept the file extension as an argument
  local version="${TAG#v}" # Remove the leading 'v' from TAG and store it in 'version'
  CONDUIT_DIST="conduit_${version}_${OS}_${ARCH}.${extension}"

  DOWNLOAD_URL="https://conduit.gateway.scarf.sh/conduit/download/$TAG/$CONDUIT_DIST"
  CONDUIT_TMP_FILE="/tmp/$CONDUIT_DIST"
  echo "Downloading $DOWNLOAD_URL"
  httpStatusCode=$(getFile "$DOWNLOAD_URL" "$CONDUIT_TMP_FILE")
  if [ "$httpStatusCode" -ne 200 ]; then
    echo "Did not find a release for your system: $OS $ARCH"
    echo "Trying to find a release on the github api."
    LATEST_RELEASE_URL="https://api.github.com/repos/conduitio/$PROJECT_NAME/releases/tags/$TAG"
    get LATEST_RELEASE_JSON $LATEST_RELEASE_URL
    # || true forces this command to not catch error if grep does not find anything
    DOWNLOAD_URL=$(echo "$LATEST_RELEASE_JSON" | grep 'browser_' | cut -d\" -f4 | grep "$CONDUIT_DIST") || true
    if [ -z "$DOWNLOAD_URL" ]; then
      echo "Sorry, we dont have a dist for your system: $OS $ARCH"
      fail "You can ask one here: https://github.com/conduitio/$PROJECT_NAME/issues"
    else
      echo "Downloading $DOWNLOAD_URL"
      getFile "$DOWNLOAD_URL" "$CONDUIT_TMP_FILE"
    fi
  fi
}

detectPackageManager() {
  # Get the OS information
  os=$(uname)

  if [[ "$os" == "Darwin" ]]; then
    PKG_MGR="brew"
  elif [[ -f /etc/debian_version ]]; then
    PKG_MGR="dpkg"
  elif [[ -f /etc/redhat-release || -f /etc/fedora-release ]]; then
    PKG_MGR="rpm"
  else
    fail "Unsupported OS"
  fi
}

installWithBrew() {
  brew install conduit
}

installWithDPKG() {
  downloadFile "deb"

  printf "\nRunning dpkg...\n"
  sudo dpkg -i "$CONDUIT_TMP_FILE"
  rm -f "$CONDUIT_TMP_FILE"
}

installWithRPM() {
  downloadFile "rpm"

  printf "\nRunning rpm...\n"
  rpm -i "$CONDUIT_TMP_FILE"
  rm -f "$CONDUIT_TMP_FILE"
}

checkPkgMgrAndInstall() {
  coloredEcho "Installing Conduit $TAG..."
  printf "\n"
  # Check the value of PKG_MGR and invoke the corresponding function
  if [[ "$PKG_MGR" == "brew" ]]; then
    installWithBrew
  elif [[ "$PKG_MGR" == "dpkg" ]]; then
    installWithDPKG
  elif [[ "$PKG_MGR" == "rpm" ]]; then
    installWithRPM
  else
    fail "Error: PKG_MGR is not set or not recognized. Use 'brew', 'dpkg', or 'rpm'."
  fi
}

bye() {
  result=$?
  if [ "$result" != "0" ]; then
    echo -e "${red}Failed to install Conduit${reset}"
  fi
  exit $result
}

testVersion() {
  set +e
  CONDUIT="$(which $PROJECT_NAME)"
  if [ "$?" = "1" ]; then
    fail "$PROJECT_NAME not found."
  fi
  set -e
  CONDUIT_VERSION=$($PROJECT_NAME -version)
  coloredEcho "\n$CONDUIT_VERSION installed successfully"
}

# Execution

#Stop execution on any error
trap "bye" EXIT
set -e

initArch
initOS
initDownloadTool
detectPackageManager
getLatestTag
checkPkgMgrAndInstall
testVersion
