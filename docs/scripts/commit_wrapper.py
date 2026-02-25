import subprocess
import sys

def run_check(name, command):
    print(f"Running {name}...")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ {name} failed!")
        print(result.stdout)
        print(result.stderr)
        return False
    print(f"✅ {name} passed.")
    return True

def main():
    # Define your project's specific checks here
    checks = [
        ("Linting", "npm run lint"),
        ("Unit Tests", "npm test -- --watch=false --browsers=ChromeHeadless")
    ]

    for name, cmd in checks:
        if not run_check(name, cmd):
            print("
ABORTING: Fix issues before committing.")
            sys.exit(1)

    print("
🚀 All checks passed! You are clear to commit.")

if __name__ == "__main__":
    main()
