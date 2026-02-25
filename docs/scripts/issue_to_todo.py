import requests
import os

def fetch_issues():
    token = os.getenv('GITLAB_TOKEN')
    url = os.getenv('GITLAB_URL', 'http://gitlab.minilab')
    project_id = os.getenv('PROJECT_ID')

    if not all([token, project_id]):
        print("Error: GITLAB_TOKEN and PROJECT_ID must be set.")
        return

    api_url = f"{url}/api/v4/projects/{project_id}/issues?state=opened&scope=assigned_to_me"
    headers = {"PRIVATE-TOKEN": token}
    
    response = requests.get(api_url, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching issues: {response.text}")
        return

    issues = response.json()
    with open('CHECKLIST.md', 'w') as f:
        f.write("# My Active Issues

")
        for issue in issues:
            f.write(f"- [ ] #{issue['iid']} {issue['title']}
")
            f.write(f"  - URL: {issue['web_url']}
")
    
    print(f"✅ Created CHECKLIST.md with {len(issues)} issues.")

if __name__ == "__main__":
    fetch_issues()
