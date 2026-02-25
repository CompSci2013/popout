import subprocess
import json
import os

def audit_deps():
    print("Checking for outdated dependencies...")
    try:
        result = subprocess.run(['npm', 'outdated', '--json'], capture_output=True, text=True)
        if not result.stdout:
            print("✅ All dependencies are up to date.")
            return

        outdated = json.loads(result.stdout)
        print(f"
Found {len(outdated)} outdated packages:")
        for pkg, info in outdated.items():
            print(f"- {pkg}: {info['current']} -> {info['latest']} (Wanted: {info['wanted']})")
    except Exception as e:
        print(f"Error running npm: {e}")

if __name__ == "__main__":
    audit_deps()
