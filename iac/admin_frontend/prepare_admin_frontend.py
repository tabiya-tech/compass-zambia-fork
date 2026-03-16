import os
import sys
import shutil
import subprocess

# Determine the absolute path to the 'iac' directory
iac_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# Add this directory to sys.path,
# so that we can import the iac/lib module when we run pulumi from within the iac/admin-frontend directory.
sys.path.insert(0, iac_folder)

from lib import getenv, get_realm_and_env_name_from_stack, \
    get_pulumi_stack_outputs, construct_artifacts_dir, save_content_in_file, \
    download_generic_artifacts_file, Version

from scripts.formatters import construct_artifacts_version

# The actual admin frontend build artifact filename is specified in the iac/scripts/build-and-upload-fe.sh script.
admin_frontend_build_artifact_filename = "admin-frontend-build.tar.gz"

# the constant directories.
current_dir = os.path.join(iac_folder, "admin_frontend")
base_artifacts_dir = os.path.join(current_dir, "_tmp", "artifacts")
deployments_dir = os.path.join(current_dir, "_tmp", "deployments")


def download_admin_frontend_bundle(
        *,
        realm_name: str,
        deployment_number: str,
        artifacts_version: Version) -> None:
    """
    Download the admin frontend build bundle given the admin frontend artifact version.

    Args:
        :param realm_name:
        :param deployment_number:
        :param artifacts_version:  The version of the admin frontend build bundle.
    """
    # 1. get the directory where to save the admin frontend build bundle.
    admin_frontend_artifacts_version = construct_artifacts_version(
        git_branch_name=artifacts_version.git_branch_name,
        git_sha=artifacts_version.git_sha
    )

    artifacts_dir = construct_artifacts_dir(
        deployment_number=deployment_number,
        fully_qualified_version=admin_frontend_artifacts_version)
    # artifacts dir, the folder to store the admin frontend build bundle.
    artifacts_destination_dir = os.path.join(base_artifacts_dir, artifacts_dir)
    os.makedirs(artifacts_destination_dir, exist_ok=False)

    # 2. Get the generic repository to download the admin frontend build bundle.
    realm_outputs = get_pulumi_stack_outputs(stack_name=realm_name, module="realm")

    # the generic repository name is defined in iac/realm/create_realm:_create_repositories method body
    # if it is not there python will raise `KeyError`, a good thing.
    realm_generic_repository = realm_outputs["generic_repository"].value

    print(f"Downloading the admin frontend build bundle... to {artifacts_destination_dir}")

    try:
        # 3. Download the admin frontend build bundle.
        download_generic_artifacts_file(
            repository=realm_generic_repository,
            version=admin_frontend_artifacts_version,
            file_name=admin_frontend_build_artifact_filename,
            output_dir=artifacts_destination_dir
        )

        # 4. extract the downloaded admin frontend build bundle.
        subprocess.run(
            [
                "tar",
                "-xf",
                admin_frontend_build_artifact_filename,
            ],
            cwd=artifacts_destination_dir,
            check=True,
            text=True
        )

        # clean up: remove the downloaded admin frontend build bundle.
        os.remove(os.path.join(artifacts_destination_dir, admin_frontend_build_artifact_filename))

        print("Done downloading the admin frontend build bundle.")
    except subprocess.CalledProcessError as e:
        print(f"Error downloading admin frontend bundle: {e}")
        raise


def prepare_admin_frontend(
        *,
        stack_name: str):
    """
    Prepare the admin frontend for deployment.
     1. Ensures that the artifact is downloaded, otherwise downloads it.
     2. Copies the downloaded artifact to the stack artifacts dir
        Specifically for the stack name, otherwise the env.js will be the same for all the stacks.
    """

    # Get the path to the admin frontend build bundle
    # This is specific to the deployment, and the stack name
    # because the admin frontend build bundle is specific to the deployment, and the stack name.
    deployment_number = getenv("DEPLOYMENT_RUN_NUMBER")
    artifacts_version = Version(
        git_branch_name=getenv("TARGET_GIT_BRANCH_NAME"),
        git_sha=getenv("TARGET_GIT_SHA")
    )

    generic_artifact_version = construct_artifacts_version(
        git_branch_name=artifacts_version.git_branch_name,
        git_sha=artifacts_version.git_sha
    )

    artifacts_dir = construct_artifacts_dir(
        deployment_number=deployment_number,
        fully_qualified_version=generic_artifact_version)

    # artifacts dir, the folder to store the admin frontend build bundle.
    artifacts_dir = os.path.join(base_artifacts_dir, artifacts_dir)

    realm_name, _ = get_realm_and_env_name_from_stack(stack_name)

    # get the required environment variables, for the admin frontend.
    print(f"preparing admin frontend for the run: {artifacts_dir}-{stack_name}...")

    # If the path (artifacts dir) already exists, skip, otherwise create it and download the admin frontend build bundle.
    # This should be the same folder for if the admin frontend deployments are on the same run.
    if not os.path.exists(artifacts_dir):
        # download the admin frontend build bundle.
        download_admin_frontend_bundle(
            realm_name=realm_name,
            deployment_number=deployment_number,
            artifacts_version=artifacts_version)

    # Have a copy of the artifacts for this deployment (the separate stack name),
    # so that we can make necessary changes to the admin frontend build bundle that are specific to the environment.
    stack_artifacts_dir = construct_artifacts_dir(
        deployment_number=deployment_number,
        fully_qualified_version=generic_artifact_version,
        stack_name=stack_name)

    # copy the artifacts to the stack artifacts dir.
    stack_artifacts_dir = os.path.join(deployments_dir, stack_artifacts_dir)
    shutil.copytree(artifacts_dir, stack_artifacts_dir, dirs_exist_ok=True)

    print(f"Done preparing admin frontend for the run: {artifacts_dir}-{stack_name}.")
