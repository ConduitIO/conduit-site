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
#
# Environment variables:
#
#   CONDUIT_INSTALL_METHOD  Force an install method instead of detecting one.
#                           One of: brew, dpkg, rpm, tarball.
#   CONDUIT_INSTALL_DIR     Where the tarball method puts the binary. Defaults to
#                           /usr/local/bin when it is writable, otherwise
#                           $HOME/.local/bin. A directory that is not writable is
#                           written with sudo, and the script says so first.

PROJECT_NAME="conduit"
GITHUB_REPO="ConduitIO/conduit"

# Define color codes
reset="\033[0m"
conduit_blue="\033[38;5;45m"
red="\033[31m"

fail() {
  printf "%b\n" "$1"
  exit 1
}

# Function to print a string in bright blue
coloredEcho() {
  local text=$1
  printf "${conduit_blue}%b${reset}\n" "$text"
}

initArch() {
  ARCH=$(uname -m)
  case $ARCH in
  aarch64) ARCH="arm64" ;;
  arm64) ARCH="arm64" ;;
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
  OS=$(uname)
  # We support Linux and Darwin, Windows (mingw, msys) are not supported.
  if [[ "$OS" != "Linux" && "$OS" != "Darwin" ]]; then
    fail "Error: Unsupported operating system: $OS"
  fi
}

initDownloadTool() {
  if type "curl" >/dev/null 2>&1; then
    DOWNLOAD_TOOL="curl"
  elif type "wget" >/dev/null 2>&1; then
    DOWNLOAD_TOOL="wget"
  else
    fail "You need 'curl' or 'wget' as a download tool. Please install it first before continuing."
  fi
}

getLatestTag() {
  # GitHub releases URL
  local url="https://github.com/$GITHUB_REPO/releases/latest"
  local latest_url # Variable to store the redirected URL

  # Check if DOWNLOAD_TOOL is set to curl or wget
  if [[ "$DOWNLOAD_TOOL" == "curl" ]]; then
    # Use curl to get the redirected link
    latest_url=$(curl -sL -o /dev/null -w "%{url_effective}" "$url")
  elif [[ "$DOWNLOAD_TOOL" == "wget" ]]; then
    # Use wget to get the redirected link
    latest_url=$(wget --spider --server-response --max-redirect=2 "$url" 2>&1 | grep "Location" | tail -1)
    # The line looks like "  Location: <url> [following]".
    latest_url="${latest_url#*Location: }"
    latest_url="${latest_url%% *}"
  else
    fail "Error: DOWNLOAD_TOOL is not set or not recognized. Use 'curl' or 'wget'."
  fi

  # Extract the tag from the redirected URL (everything after the last "/")
  TAG=$(echo "$latest_url" | grep -oE "[^/]+$")
  if [ -z "$TAG" ]; then
    fail "Error: could not determine the latest Conduit release from $url"
  fi
}

# lastHTTPStatus prints the status code of the last HTTP response recorded in a
# wget --server-response log. Deliberately implemented with shell builtins only:
# some minimal Linux images (openSUSE Tumbleweed's base container, for one) ship
# without awk, and this script must not need it.
lastHTTPStatus() {
  local file="$1"
  local proto code rest
  local status=""
  while read -r proto code rest || [ -n "$proto" ]; do
    case "$proto" in
    HTTP/*) status="$code" ;;
    esac
  done <"$file"
  echo "$status"
}

get() {
  local url="$2"
  local body
  local httpStatusCode
  echo "Getting $url"
  if [ "$DOWNLOAD_TOOL" = "curl" ]; then
    httpResponse=$(curl -sL --write-out 'HTTPSTATUS:%{http_code}' "$url")
    httpStatusCode=$(echo "$httpResponse" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$httpResponse" | sed -e 's/HTTPSTATUS\:.*//g')
  elif [ "$DOWNLOAD_TOOL" = "wget" ]; then
    local tmpFile
    tmpFile=$(mktemp)
    body=$(wget --server-response --content-on-error -q -O - "$url" 2>"$tmpFile" || true)
    httpStatusCode=$(lastHTTPStatus "$tmpFile")
    rm -f "$tmpFile"
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
  local httpStatusCode
  if [ "$DOWNLOAD_TOOL" = "curl" ]; then
    httpStatusCode=$(curl --progress-bar -w '%{http_code}' -L "$url" -o "$filePath")
  elif [ "$DOWNLOAD_TOOL" = "wget" ]; then
    local tmpFile
    tmpFile=$(mktemp)
    wget --server-response --content-on-error -q -O "$filePath" "$url" 2>"$tmpFile" || true
    httpStatusCode=$(lastHTTPStatus "$tmpFile")
    rm -f "$tmpFile"
  fi
  echo "$httpStatusCode"
}

downloadFile() {
  local extension=$1       # Accept the file extension as an argument
  local version="${TAG#v}" # Remove the leading 'v' from TAG and store it in 'version'
  CONDUIT_DIST="conduit_${version}_${OS}_${ARCH}.${extension}"

  DOWNLOAD_URL="https://conduit.gateway.scarf.sh/conduit/download/$TAG/$CONDUIT_DIST"
  # A private directory rather than a predictable /tmp path: the artifact is
  # verified and then handed to dpkg/rpm as root, so nothing else may be able to
  # swap it in between the two.
  CONDUIT_TMP_DIR=$(mktemp -d)
  CONDUIT_TMP_FILE="$CONDUIT_TMP_DIR/$CONDUIT_DIST"
  echo "Downloading $DOWNLOAD_URL"
  httpStatusCode=$(getFile "$DOWNLOAD_URL" "$CONDUIT_TMP_FILE")
  if [ "$httpStatusCode" -ne 200 ]; then
    echo "Did not find a release for your system: $OS $ARCH"
    echo "Trying to find a release on the github api."
    LATEST_RELEASE_URL="https://api.github.com/repos/conduitio/$PROJECT_NAME/releases/tags/$TAG"
    get LATEST_RELEASE_JSON "$LATEST_RELEASE_URL"
    # || true forces this command to not catch error if grep does not find anything
    DOWNLOAD_URL=$(echo "$LATEST_RELEASE_JSON" | grep 'browser_' | cut -d\" -f4 | grep "$CONDUIT_DIST") || true
    if [ -z "$DOWNLOAD_URL" ]; then
      echo "Sorry, we dont have a dist for your system: $OS $ARCH"
      fail "You can ask one here: https://github.com/conduitio/$PROJECT_NAME/issues"
    else
      echo "Downloading $DOWNLOAD_URL"
      httpStatusCode=$(getFile "$DOWNLOAD_URL" "$CONDUIT_TMP_FILE")
      if [ "$httpStatusCode" -ne 200 ]; then
        fail "Error: failed to download $DOWNLOAD_URL (HTTP $httpStatusCode)"
      fi
    fi
  fi
}

# sha256Of prints the SHA-256 of a file using whichever of sha256sum, shasum or
# openssl is available. Returns non-zero if none of them are.
sha256Of() {
  local file="$1"
  local out
  if type "sha256sum" >/dev/null 2>&1; then
    out=$(sha256sum "$file") || return 1
    echo "${out%% *}" # "<sha256>  <file>"
  elif type "shasum" >/dev/null 2>&1; then
    out=$(shasum -a 256 "$file") || return 1
    echo "${out%% *}" # "<sha256>  <file>"
  elif type "openssl" >/dev/null 2>&1; then
    out=$(openssl dgst -sha256 "$file") || return 1
    echo "${out##* }" # "SHA2-256(<file>)= <sha256>"
  else
    return 1
  fi
}

# verifyChecksum checks a downloaded artifact against the checksums.txt published
# with the same release. It fails closed: an unreachable checksums.txt, a missing
# entry, no SHA-256 tool, or a mismatch all abort the install. The checksums come
# from github.com directly (the Scarf download gateway does not serve them), so a
# tampered artifact from the gateway would not match.
verifyChecksum() {
  local file="$1"
  local name="$2"
  local checksumsURL="https://github.com/$GITHUB_REPO/releases/download/$TAG/checksums.txt"
  local checksumsFile
  local expected
  local actual
  local statusCode

  printf "\nVerifying SHA-256 checksum of %s\n" "$name"
  checksumsFile=$(mktemp)
  statusCode=$(getFile "$checksumsURL" "$checksumsFile")
  if [ "$statusCode" -ne 200 ]; then
    rm -f "$checksumsFile"
    fail "Error: could not download $checksumsURL (HTTP $statusCode).\nRefusing to install an unverified artifact."
  fi

  # checksums.txt lines look like "<sha256>  <filename>"; some tools prefix the
  # filename with '*' to mark binary mode.
  expected=""
  while read -r sum entry || [ -n "$sum" ]; do
    if [ "${entry#\*}" = "$name" ]; then
      expected="$sum"
      break
    fi
  done <"$checksumsFile"
  rm -f "$checksumsFile"
  if [ -z "$expected" ]; then
    fail "Error: no checksum for $name in the checksums.txt of $TAG.\nRefusing to install an unverified artifact."
  fi

  if ! actual=$(sha256Of "$file"); then
    fail "Error: need 'sha256sum', 'shasum' or 'openssl' to verify the download.\nInstall one of them and re-run. Refusing to install an unverified artifact."
  fi

  if [ "$expected" != "$actual" ]; then
    rm -f "$file"
    fail "Error: checksum mismatch for $name.\n  expected: $expected\n  actual:   $actual\nThe download was deleted. Do not install it."
  fi
  echo "Checksum OK"
}

# detectInstallMethod picks how to install. Anything we do not have a native
# package for falls back to the generic tarball, which every release publishes for
# Linux (x86_64, arm64, i386) and Darwin (x86_64, arm64) — that covers Arch,
# Alpine, SUSE, and a Mac without Homebrew.
detectInstallMethod() {
  if [ -n "${CONDUIT_INSTALL_METHOD:-}" ]; then
    INSTALL_METHOD="$CONDUIT_INSTALL_METHOD"
    return
  fi

  if [[ "$OS" == "Darwin" ]]; then
    if type "brew" >/dev/null 2>&1; then
      INSTALL_METHOD="brew"
    else
      INSTALL_METHOD="tarball"
    fi
  elif [[ -f /etc/debian_version ]] && type "dpkg" >/dev/null 2>&1; then
    INSTALL_METHOD="dpkg"
  elif [[ -f /etc/redhat-release || -f /etc/fedora-release ]] && type "rpm" >/dev/null 2>&1; then
    INSTALL_METHOD="rpm"
  else
    INSTALL_METHOD="tarball"
  fi
}

# runAsRoot runs a command as root, saying so before it reaches for sudo.
runAsRoot() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  else
    echo "Elevating with sudo: $*"
    sudo "$@"
  fi
}

installWithBrew() {
  brew install conduit
  CONDUIT_BIN="$(command -v "$PROJECT_NAME" || true)"
}

installWithDPKG() {
  downloadFile "deb"
  verifyChecksum "$CONDUIT_TMP_FILE" "$CONDUIT_DIST"

  printf "\nRunning dpkg...\n"
  runAsRoot dpkg -i "$CONDUIT_TMP_FILE"
  rm -f "$CONDUIT_TMP_FILE"
  CONDUIT_BIN="$(command -v "$PROJECT_NAME" || true)"
}

installWithRPM() {
  downloadFile "rpm"
  verifyChecksum "$CONDUIT_TMP_FILE" "$CONDUIT_DIST"

  printf "\nRunning rpm...\n"
  runAsRoot rpm -i "$CONDUIT_TMP_FILE"
  rm -f "$CONDUIT_TMP_FILE"
  CONDUIT_BIN="$(command -v "$PROJECT_NAME" || true)"
}

# resolveInstallDir picks the directory the tarball binary goes into. It never
# reaches for sudo on its own: if /usr/local/bin is not writable it uses a
# per-user directory instead, and installWithTarball reports where the binary
# landed and whether that directory is on PATH.
resolveInstallDir() {
  if [ -n "${CONDUIT_INSTALL_DIR:-}" ]; then
    INSTALL_DIR="$CONDUIT_INSTALL_DIR"
  elif [ -d /usr/local/bin ] && [ -w /usr/local/bin ]; then
    INSTALL_DIR="/usr/local/bin"
  else
    INSTALL_DIR="$HOME/.local/bin"
  fi
}

installWithTarball() {
  local extractDir
  local binary

  downloadFile "tar.gz"
  verifyChecksum "$CONDUIT_TMP_FILE" "$CONDUIT_DIST"

  extractDir=$(mktemp -d)
  if ! tar -xzf "$CONDUIT_TMP_FILE" -C "$extractDir"; then
    rm -rf "$extractDir"
    rm -f "$CONDUIT_TMP_FILE"
    fail "Error: failed to extract $CONDUIT_DIST"
  fi
  rm -f "$CONDUIT_TMP_FILE"

  binary="$extractDir/$PROJECT_NAME"
  if [ ! -f "$binary" ]; then
    binary=$(find "$extractDir" -type f -name "$PROJECT_NAME" | head -n 1)
  fi
  if [ -z "$binary" ] || [ ! -f "$binary" ]; then
    rm -rf "$extractDir"
    fail "Error: could not find a '$PROJECT_NAME' binary inside $CONDUIT_DIST"
  fi

  resolveInstallDir
  printf "\nInstalling to %s\n" "$INSTALL_DIR"
  if mkdir -p "$INSTALL_DIR" 2>/dev/null && [ -w "$INSTALL_DIR" ]; then
    if ! install -m 0755 "$binary" "$INSTALL_DIR/$PROJECT_NAME"; then
      rm -rf "$extractDir"
      fail "Error: failed to install $PROJECT_NAME into $INSTALL_DIR"
    fi
  else
    echo "$INSTALL_DIR is not writable by $(id -un). Installing there needs root."
    echo "Set CONDUIT_INSTALL_DIR to a directory you own (for example \$HOME/.local/bin) to avoid this."
    if ! runAsRoot mkdir -p "$INSTALL_DIR" || ! runAsRoot install -m 0755 "$binary" "$INSTALL_DIR/$PROJECT_NAME"; then
      rm -rf "$extractDir"
      fail "Error: failed to install $PROJECT_NAME into $INSTALL_DIR"
    fi
  fi
  rm -rf "$extractDir"

  CONDUIT_BIN="$INSTALL_DIR/$PROJECT_NAME"
  reportInstallLocation
}

reportInstallLocation() {
  printf "\n"
  coloredEcho "Installed $PROJECT_NAME to $CONDUIT_BIN"
  case ":$PATH:" in
  *":$INSTALL_DIR:"*)
    echo "$INSTALL_DIR is on your PATH, so 'conduit' is ready to use."
    ;;
  *)
    echo "$INSTALL_DIR is NOT on your PATH. Either run the binary directly:"
    echo ""
    echo "    $CONDUIT_BIN --version"
    echo ""
    echo "or add the directory to your PATH:"
    echo ""
    echo "    export PATH=\"$INSTALL_DIR:\$PATH\""
    echo ""
    ;;
  esac
}

runInstall() {
  coloredEcho "Installing Conduit $TAG..."
  printf "\n"
  case "$INSTALL_METHOD" in
  brew) installWithBrew ;;
  dpkg) installWithDPKG ;;
  rpm) installWithRPM ;;
  tarball) installWithTarball ;;
  *)
    fail "Error: unknown install method '$INSTALL_METHOD'. Use 'brew', 'dpkg', 'rpm' or 'tarball'."
    ;;
  esac
}

bye() {
  result=$?
  [ -n "${CONDUIT_TMP_DIR:-}" ] && rm -rf "$CONDUIT_TMP_DIR"
  if [ "$result" != "0" ]; then
    echo -e "${red}Failed to install Conduit${reset}"
  fi
  exit $result
}

testVersion() {
  if [ -z "${CONDUIT_BIN:-}" ]; then
    CONDUIT_BIN="$(command -v "$PROJECT_NAME" || true)"
  fi
  if [ -z "$CONDUIT_BIN" ] || [ ! -x "$CONDUIT_BIN" ]; then
    fail "$PROJECT_NAME not found after installing."
  fi
  CONDUIT_VERSION=$("$CONDUIT_BIN" --version)
  coloredEcho "\n$CONDUIT_VERSION installed successfully"
}

# Execution

# Stop execution on any error
trap "bye" EXIT
set -e

initArch
initOS
initDownloadTool
detectInstallMethod
getLatestTag
runInstall
testVersion
