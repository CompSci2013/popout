import os

def audit_env():
    example_path = '.env.example'
    env_path = '.env'

    if not os.path.exists(example_path):
        print("No .env.example found. Skipping audit.")
        return

    def get_keys(path):
        keys = set()
        with open(path, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    keys.add(line.split('=')[0].strip())
        return keys

    example_keys = get_keys(example_path)
    if not os.path.exists(env_path):
        print(f"⚠️  MISSING: .env file not found. Should contain: {example_keys}")
        return

    env_keys = get_keys(env_path)
    missing = example_keys - env_keys
    extra = env_keys - example_keys

    if not missing and not extra:
        print("✅ .env is perfectly aligned with .env.example")
    else:
        if missing:
            print(f"❌ MISSING keys in .env: {missing}")
        if extra:
            print(f"ℹ️  EXTRA keys in .env (not in example): {extra}")

if __name__ == "__main__":
    audit_env()
