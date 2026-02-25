import subprocess
import sys
import os

def get_current_objective():
    return os.getenv('CURRENT_OBJECTIVE', 'Objective X')

def main():
    objective = get_current_objective()
    try:
        branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], text=True).strip()
        if objective.lower().replace(' ', '-') not in branch.lower():
            print(f"⚠️  WARNING: Current branch '{branch}' does not mention objective '{objective}'.")
            print("Ensure you are working on the right goal!")
        else:
            print(f"🎯 Aligned with objective: {objective}")
    except:
        sys.exit(0)

if __name__ == "__main__":
    main()
