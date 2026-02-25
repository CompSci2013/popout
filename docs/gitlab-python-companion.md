# GitLab Python Companion

## Environment Configuration

Many of the scripts in this guide interact with the GitLab API. Before running them, you must configure the following environment variables.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GITLAB_TOKEN` | Your GitLab Personal Access Token (API scope) | `PA-TOKEN` |
| `GITLAB_URL` | The base URL of your GitLab instance | `http://gitlab.minilab` |
| `PROJECT_ID` | The numeric ID of the current GitLab project | `93` |
| `CURRENT_OBJECTIVE` | The name of the current "Objective X" | `Refactor Popouts` |

### How to Set Variables

**Option 1: Export in Shell**
```bash
export GITLAB_TOKEN="your-token-here"
export GITLAB_URL="http://gitlab.minilab"
export PROJECT_ID="93"
```

**Option 2: Use a `.env` file**
Create a file named `.env` in the project root:
```
GITLAB_TOKEN=your-token-here
GITLAB_URL=http://gitlab.minilab
PROJECT_ID=93
CURRENT_OBJECTIVE=Refactor Popouts
```
*Note: Scripts that use these variables will look for them in the system environment.*

---

## [CORE-01] Semantic Commit Generator (Bash Heredoc Style)

This script analyzes your **staged** changes and generates a multi-line `git commit` command. 

> **Note**: Without an external LLM, the script uses **heuristics** (file patterns and regex) to guess what you did. It provides a structured draft that you can quickly polish before hitting Enter.

### The Python Script (`commit_gen.py`)

```python
import subprocess
import sys
import re

def get_staged_info():
    try:
        diff = subprocess.check_output(['git', 'diff', '--cached'], text=True)
        files = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], text=True).strip().split('
')
        return diff, files
    except subprocess.CalledProcessError:
        print("Error: Ensure you are in a git repository and have staged files.")
        sys.exit(1)

def extract_symbols(diff):
    """Uses regex to find Class or Function names in the diff."""
    pattern = re.compile(r'^\+.*(?:class|function|def)\s+([a-zA-Z0-9_]+)', re.MULTILINE)
    return list(set(pattern.findall(diff)))

def summarize_changes(diff, files):
    symbols = extract_symbols(diff)
    if any(f.endswith('.spec.ts') or 'test' in f for f in files):
        header = "test: update unit tests"
    elif any(f.startswith('docs/') for f in files):
        header = "docs: update documentation"
    elif any("service" in f or "component" in f for f in files):
        header = "feat: update application logic"
    else:
        header = "refactor: general improvements"

    body_lines = []
    if symbols:
        body_lines.append(f"- Impacted symbols: {', '.join(symbols)}")
    for f in files:
        if f:
            body_lines.append(f"- Refactor {f}")
    body_lines.append("- [ENTER REASON FOR CHANGE HERE]")
    return header, "
".join(body_lines)

def main():
    diff, files = get_staged_info()
    if not diff:
        print("# No staged changes. Run 'git add' first.")
        return
    header, body = summarize_changes(diff, files)
    command = f"git commit -F - <<EOF
{header}

{body}
EOF"
    print(command)

if __name__ == "__main__":
    main()
```

---

## [CORE-02] Augmented Commit Generator (Canned Verbiage Edition)

This version uses a "Canned Verbiage" engine to match changes against professional engineering phrases.

### The Python Script (`commit_pro.py`)

```python
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
```

---

## [CORE-03] Dynamic Knowledge Base (External Canned Phrases)

This version reads phrases from `docs/canned-verbiage.json`, allowing your vocabulary to grow over time.

### The Dynamic Script (`commit_dynamic.py`)

```python
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
```

---

## Appendix: Future Script Ideas

### Productivity & Insights [PROD]
*   **[PROD-01] Branch Name & Issue Linker**: Enforces branch naming (e.g., `feature/123-ui-fix`) and adds "Closes #123" to commits.
*   **[PROD-02] GitLab Issue-to-TODO Converter**: Fetches assigned issues via API and generates a local `CHECKLIST.md`.
*   **[PROD-03] Automated Dependency Auditor**: Checks for outdated packages and creates a maintenance issue.
*   **[PROD-04] "Green-Light" Commit Wrapper**: Only generates a commit command if linting and tests pass.
*   **[PROD-05] Milestone Release Note Generator**: Formats closed issues into a "What's New" list.
*   **[PROD-06] Context-Aware Reviewer Suggester**: Suggests reviewers based on `git blame` history.
*   **[PROD-07] Environment Configuration Auditor**: Validates local `.env` files against examples.
*   **[PROD-08] Merge Request Performance Analyzer**: Analyzes cycle time and latency.
*   **[PROD-09] Project "Gold Standard" Scaffolder**: Bootstraps standardized repos with CI/CD and linting.
*   **[PROD-10] Conventional Commits Enforcer**: Local hook to validate `type(scope): message` format.
*   **[PROD-11] Security Vulnerability Auto-Issuer**: Scans lockfiles and creates issues for critical CVEs.

### USE WITH CAUTION (Potentially Destructive) [OPS]
*   **[OPS-01] Stale Branch Cleanup**: Removes merged local/remote branches.
*   **[OPS-02] Cross-Project Label Synchronizer**: Bulk modifies labels across a GitLab Group.
*   **[OPS-03] Automated Documentation Sync**: Overwrites `README.md` sections with code metadata.

### Kanban & Objective Management [KAN]
*   **[KAN-01] Personal Objective Guard**: Warns if starting work on an issue not tagged for the current objective.
*   **[KAN-02] Daily Objective Update Drafter**: Generates a "Progress toward Objective X" summary.
*   **[KAN-03] The "Objective Priority" Dashboard**: Displays only tasks remaining for the current milestone.
*   **[KAN-04] Blocker Signal**: CLI tool to instantly flag an objective-path task as stalled.
*   **[KAN-05] Context-Switch Monitor**: Alerts if jumping between different objectives in one day.
*   **[KAN-06] Transition Readiness Checker**: Validates tests/docs/linting before manual board transition.
*   **[KAN-07] Objective Alignment Detector**: Identifies "shadow work" in "Doing" column.
*   **[KAN-08] Objective Bottleneck Finder (Lead)**: Highlights high density in objective-critical columns.
*   **[KAN-09] Interactive Objective Rollover (Lead)**: Suggests a rollover plan with interactive naming and issue selection.
*   **[KAN-10] Label Sanity Bot (Lead)**: Flags issues missing objective labels.

### Quality & Standards [STD]
*   **[STD-01] The Actionability Auditor**: Verifies the presence of "Definition of Done" checkboxes in issues.
*   **[STD-02] Shadow Work Detector**: Compares local history against assigned issues to ensure objective alignment.
