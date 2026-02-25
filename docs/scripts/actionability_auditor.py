import sys
import requests
import os
import re

def audit_issue(issue_id):
    token = os.getenv('GITLAB_TOKEN')
    url = os.getenv('GITLAB_URL', 'http://gitlab.minilab')
    project_id = os.getenv('PROJECT_ID')

    if not all([token, project_id]):
        print("Error: GITLAB_TOKEN and PROJECT_ID must be set.")
        return

    api_url = f"{url}/api/v4/projects/{project_id}/issues/{issue_id}"
    headers = {"PRIVATE-TOKEN": token}
    
    response = requests.get(api_url, headers=headers)
    if response.status_code != 200:
        print(f"❌ Error fetching issue: {response.text}")
        return

    issue = response.json()
    description = issue.get('description', '')
    has_todos = bool(re.search(r'- \[[ x]\]', description))
    
    print(f"Auditing Issue #{issue_id}: {issue['title']}")
    if has_todos:
        print("✅ Definition of Done (checkboxes) found.")
    else:
        print("⚠️  MISSING: No 'Actionable' checkboxes found in description.")
        print("   A good issue should have: - [ ] Task to complete")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 actionability_auditor.py <issue_id>")
    else:
        audit_issue(sys.argv[1])
