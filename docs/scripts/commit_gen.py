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
