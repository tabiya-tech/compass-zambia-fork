#!/usr/bin/env bash
# comment out the set -x to enable debugging
# set -x

####################################
# Import the common functions
if false; then
  # IntelliJ Hack. This will never run, but it will make the IDE recognize the functions.
  # It is needed so that IntelliJ can resolve the common.sh location statically.
  source "./common.sh"
fi
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
####################################

function write_version_json() {
  local _version_json_filename=$1
  local _git_branch_tag_name=$2
  local _git_commit_sha=$3
  local _build_run=$4

  echo "info: setting the version info in $_version_json_filename"
  sed -i -e "s|\###date###|$(date -u +%F' %T.%3N UTC')|g" "${_version_json_filename}"
  sed -i -e "s|\###GITHUB_REF_NAME###|$_git_branch_tag_name|g" "${_version_json_filename}"
  sed -i -e "s|\###GITHUB_RUN_NUMBER###|$_build_run|g" "${_version_json_filename}"
  sed -i -e "s|\###GITHUB_SHA###|$_git_commit_sha|g" "${_version_json_filename}"
  cat "$_version_json_filename"
}

function save_report() {
  local _report_filename=$1
  local _deployable_version=$2
  local _version_json_filename=$3
  local _frontend_type=$4
  local _newline='  ' # in markdown, two spaces are needed for a newline
  {
    echo "### ${_frontend_type} artifacts packaging summary"
    echo "**Date**: \`$(date -u +%F' %T.%3N UTC')\`$_newline"
    echo "**Status**: ✅ Successfully uploaded$_newline"
    echo "**Version**: \`$_deployable_version\`$_newline"
    echo "**version.json**:$_newline"
    echo  "\`\`\`json"
    cat "$_version_json_filename"
    echo  "\`\`\`"
    echo "-------"
  } >> "$_report_filename"
}

function check_args() {
  if [ "$#" -ne 5 ]; then
    echo "Usage: $0 <region> <project_id> <report_filename> <build_run> <frontend_type>"
    cat << EOF
  Build and upload the frontend artifacts to the Google Cloud Artifacts Repository.
  Artifacts are versioned based on the current Git branch/tag name and commit SHA.

  This script performs the following steps:
    1. Builds the frontend artifacts using Yarn.
    2. Compresses the build output.
    3. Uploads the artifact to the Google Cloud Artifacts Repository.
    4. Optionally uploads sourcemaps to Sentry if SENTRY_AUTH_TOKEN is set (only for main frontend).
    5. Writes a versioned report with build info.

  Requirements:
    - Must be run from within a Git repository.
    - Intended branch or tag should be checked out.
    - 'yarn install' must have been run in the frontend module directory.

  Arguments:
    region          The Google Cloud region to upload the artifacts to.
    project_id      The Google Cloud project ID (usually the root project ID).
    report_filename The file to write the summary report to (e.g., \$GITHUB_STEP_SUMMARY).
    build_run       The build run number (e.g., \$GITHUB_RUN_NUMBER).
    frontend_type   The type of frontend to build: 'frontend' or 'admin-frontend'.
EOF
    exit 1
  fi
}

#############################
# Main script starts here
#############################
check_args "$@"

#############################
# Set the variables
#############################
region=$1
echo "info: setting the region to $region"

project_id=$2
echo "info: setting the project id to $project_id"

report_filename="$(real_file_path "$3")"
echo "info: setting the report filename to $report_filename"

build_run=$4
echo "info: setting the build run to $build_run"

frontend_type=$5
echo "info: setting the frontend type to $frontend_type"

if [ -z "$ROOT_PATH" ]; then
  echo "Error: \$ROOT_PATH is required. Should be set in the common.sh script."
  exit 1
fi

# Determine the source path and artifact filename based on frontend type
if [ "$frontend_type" == "frontend" ]; then
  source_path="$ROOT_PATH/frontend-new"
  # @IMPORTANT: The filename of the build artifact must match the value used in iac/frontend/prepare_frontend.py:FRONTEND_BUILD_NAME
  frontend_build_artifact_filename="frontend-build.tar.gz"
elif [ "$frontend_type" == "admin-frontend" ]; then
  source_path="$ROOT_PATH/admin-frontend"
  # @IMPORTANT: The filename of the build artifact must match the value used in iac/admin-frontend/prepare_admin_frontend.py:ADMIN_FRONTEND_BUILD_NAME
  frontend_build_artifact_filename="admin-frontend-build.tar.gz"
else
  echo "Error: Invalid frontend_type '$frontend_type'. Must be 'frontend' or 'admin-frontend'."
  exit 1
fi

echo "info: setting the source path to $source_path"
if [ ! -d "$source_path" ]; then
  echo "Error: frontend module path ($source_path) does not exist."
  exit 1
fi

echo "info: setting the frontend build artifact filename to $frontend_build_artifact_filename"

git_branch_tag_name="$(get_git_branch_tag_name)"
echo "info: setting the git branch/tag name to $git_branch_tag_name"

git_commit_sha="$(get_git_sha)"
echo "info: setting the git commit sha to $git_commit_sha"

artifact_version="$(get_generic_artifacts_version)"
echo "info: setting the artifact version to $artifact_version"

version_json_filename="$source_path/build/data/version.json"
echo "info: setting the version json filename to $version_json_filename"

#############################
# The pipeline starts here
#############################

echo "info: building and uploading ${frontend_type}:$artifact_version artifacts to $region/$project_id from $source_path"

# Build the frontend artifacts
echo "info: building ${frontend_type} artifacts"
yarn --cwd "$source_path" run build || exit 1

# Only upload sourcemaps to Sentry for the main frontend (not admin-frontend)
if [ "$frontend_type" == "frontend" ]; then
  if [ -n "$SENTRY_AUTH_TOKEN" ]; then
    echo "info: uploading sourcemaps to sentry"
    yarn --cwd "$source_path" run sentry:sourcemaps || exit 1
  else
    echo "warning: SENTRY_AUTH_TOKEN is not set, skipping uploading sourcemaps to sentry"
  fi
fi

# Ensure the version.json directory exists (for admin-frontend which may not have it by default)
mkdir -p "$(dirname "$version_json_filename")"

# Create version.json if it doesn't exist (for admin-frontend)
if [ ! -f "$version_json_filename" ]; then
  echo "info: creating version.json file"
  cat > "$version_json_filename" << 'VERSIONJSON'
{
  "date": "###date###",
  "branch": "###GITHUB_REF_NAME###",
  "run": "###GITHUB_RUN_NUMBER###",
  "sha": "###GITHUB_SHA###"
}
VERSIONJSON
fi

# Write the version info
write_version_json "$version_json_filename" "$git_branch_tag_name" "$git_commit_sha" "$build_run"

# Compress the frontend artifacts
echo "info: compressing ${frontend_type} artifacts"
tar -czf "./$frontend_build_artifact_filename" -C "$source_path"/build . || exit 1

# shellcheck disable=SC2064
trap "echo info: cleaning up; rm \"./$frontend_build_artifact_filename\"" EXIT

# Ensure gcloud is authenticated
authenticate_gcloud

# Upload the frontend artifacts
upload_file "$region" "$project_id" "$artifact_version" . "$frontend_build_artifact_filename"

# Report the summary
save_report "$report_filename" "$artifact_version" "$version_json_filename" "$frontend_type"
