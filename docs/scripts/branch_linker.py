import subprocess
import re
import sys

def get_branch_id():
    """Extracts numeric ID from branch names like 'feature/123-login'"""
    try:
        branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], text=True).strip()
        match = re.search(r'(\d+)', branch)
        return match.group(1) if match else None
    except:
        return None

def main():
    issue_id = get_branch_id()
    if issue_id:
        print(f"
# Suggested footer for commit message:
Closes #{issue_id}")
    else:
        print("# No issue ID found in branch name.")

if __name__ == "__main__":
    main()
