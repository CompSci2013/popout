import subprocess
import sys
import re
import json
import random
import os

VERBIAGE_PATH = os.path.join('docs', 'canned-verbiage.json')
DEFAULT_VERBIAGE = {"logic": ["General logic updates"], "ui": ["UI improvements"], "infra": ["Infrastructure updates"], "fix": ["Bug fixes"]}

def load_verbiage():
    if os.path.exists(VERBIAGE_PATH):
        try:
            with open(VERBIAGE_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"# Warning: Could not read {VERBIAGE_PATH}: {e}")
    return DEFAULT_VERBIAGE

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
    if any("service" in f or "module" in f or "config" in f for f in files):
        return "infra"
    return "logic"

def main():
    diff, files = get_staged_info()
    if not diff or not files[0]:
        print("# No staged changes.")
        return
    intent = analyze_intent(diff, files)
    verbiage = load_verbiage()
    prefixes = {"fix": "fix", "ui": "feat", "infra": "refactor", "logic": "feat"}
    header = f"{prefixes[intent]}: {intent} updates in {len(files)} files"
    options = verbiage.get(intent, verbiage.get("logic"))
    professional_lead = random.choice(options)
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
