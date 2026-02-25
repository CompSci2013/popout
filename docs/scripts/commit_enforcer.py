import sys
import re

# Standard Conventional Commit types
TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']

def validate_message(msg):
    pattern = r'^(' + '|'.join(TYPES) + r')(\(.*\))?!?: .+'
    if not re.match(pattern, msg):
        return False
    return True

def main():
    # This can be used as a git 'commit-msg' hook
    if len(sys.argv) < 2:
        print("Usage: python3 commit_enforcer.py 'commit message'")
        sys.exit(1)

    msg = sys.argv[1]
    if not validate_message(msg):
        print("❌ Invalid commit format!")
        print("Expected: type(scope): message (e.g., 'feat(ui): add button')")
        sys.exit(1)
    
    print("✅ Valid commit format.")

if __name__ == "__main__":
    main()
