import requests
import os
import sys

def generate_release_notes(milestone_title):
    token = os.getenv('GITLAB_TOKEN')
    url = os.getenv('GITLAB_URL', 'http://gitlab.minilab')
    project_id = os.getenv('PROJECT_ID')

    if not all([token, project_id]):
        print("Error: GITLAB_TOKEN and PROJECT_ID must be set.")
        return

    api_url = f"{url}/api/v4/projects/{project_id}/milestones?title={milestone_title}"
    headers = {"PRIVATE-TOKEN": token}
    resp = requests.get(api_url, headers=headers)
    milestones = resp.json()
    
    if not milestones:
        print(f"Milestone '{milestone_title}' not found.")
        return

    m_id = milestones[0]['id']
    issues_url = f"{url}/api/v4/projects/{project_id}/milestones/{m_id}/issues?state=closed"
    issues = requests.get(issues_url, headers=headers).json()

    print(f"# Release Notes: {milestone_title}
")
    print("## Changes in this release
")
    for issue in issues:
        print(f"- {issue['title']} (#{issue['iid']})")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 release_notes.py <milestone_title>")
    else:
        generate_release_notes(sys.argv[1])
