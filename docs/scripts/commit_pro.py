import subprocess
import sys
import re
import random

CANNED_VERBIAGE = {
    "logic": ["Refactor core business logic for better maintainability", "Optimize data processing pipelines"],
    "ui": ["Enhance component responsiveness and layout", "Refactor UI templates to reduce boilerplate"],
    "infra": ["Update project configuration and dependencies", "Refactor framework-level services"],
    "fix": ["Resolve regression in state synchronization", "Address inconsistent behavior in edge cases"]
}

def get_staged_info():
    try:
        diff = subprocess.check_output(['git', 'diff', '--cached'], text=True)
        files = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], text=True).strip().split('
')
        return diff, files
    except subprocess.CalledProcessError:
        sys.exit(1)

def analyze_intent(diff, files):
    content = diff.lower()
    if any(re.search(r'error|bug|fix|issue', f) for f in files) or "fix" in content:
        return "fix"
    if any("component" in f or ".html" in f or ".scss" in f for f in files):
        return "ui"
    if any("service" in f or "module" in f for f in files):
        return "infra"
    return "logic"

def main():
    diff, files = get_staged_info()
    if not diff or not files[0]:
        print("# No staged changes.")
        return
    intent = analyze_intent(diff, files)
    prefixes = {"fix": "fix", "ui": "feat", "infra": "refactor", "logic": "feat"}
    header = f"{prefixes[intent]}: {intent} updates in {len(files)} files"
    professional_lead = random.choice(CANNED_VERBIAGE[intent])
    body_lines = [professional_lead, "", "Key Changes:"]
    for f in files:
        body_lines.append(f"- {f}")
    body_lines.append("
[FINISH MANUALLY: Describe the specific 'Why' here]")
    command = f"git commit -F - <<EOF
{header}

{'
'.join(body_lines)}
EOF"
    print(command)

if __name__ == "__main__":
    main()
