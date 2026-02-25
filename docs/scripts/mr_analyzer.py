import requests
import os
from datetime import datetime

def analyze_mr_performance():
    token = os.getenv('GITLAB_TOKEN')
    url = os.getenv('GITLAB_URL', 'http://gitlab.minilab')
    project_id = os.getenv('PROJECT_ID')

    if not all([token, project_id]):
        print("Error: GITLAB_TOKEN and PROJECT_ID must be set.")
        return

    api_url = f"{url}/api/v4/projects/{project_id}/merge_requests?state=merged&per_page=20"
    headers = {"PRIVATE-TOKEN": token}
    mrs = requests.get(api_url, headers=headers).json()
    
    print("Merge Request Performance (Last 20 Merged):")
    print(f"{'ID':<6} | {'Title':<40} | {'Cycle Time (Days)':<15}")
    print("-" * 70)

    for mr in mrs:
        created = datetime.fromisoformat(mr['created_at'].replace('Z', '+00:00'))
        merged = datetime.fromisoformat(mr['merged_at'].replace('Z', '+00:00'))
        diff = merged - created
        days = diff.days + (diff.seconds / 86400)
        print(f"{mr['iid']:<6} | {mr['title'][:40]:<40} | {days:<15.2f}")

if __name__ == "__main__":
    analyze_mr_performance()
