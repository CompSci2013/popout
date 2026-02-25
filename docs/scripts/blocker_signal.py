import sys
import requests
import os

def signal_blocker(issue_id, reason):
    token = os.getenv('GITLAB_TOKEN')
    url = os.getenv('GITLAB_URL', 'http://gitlab.minilab')
    project_id = os.getenv('PROJECT_ID')

    if not all([token, project_id]):
        print("Error: GITLAB_TOKEN and PROJECT_ID must be set.")
        return

    api_url = f"{url}/api/v4/projects/{project_id}/issues/{issue_id}/notes"
    headers = {"PRIVATE-TOKEN": token}
    data = {"body": f"/label ~Blocked

**BLOCKER DETECTED**: {reason}"}

    response = requests.post(api_url, headers=headers, data=data)
    if response.status_code == 201:
        print(f"✅ Issue #{issue_id} flagged as BLOCKED.")
    else:
        print(f"❌ Failed to flag issue: {response.text}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 blocker_signal.py <issue_id> <reason>")
        sys.exit(1)

    signal_blocker(sys.argv[1], sys.argv[2])

if __name__ == "__main__":
    main()
