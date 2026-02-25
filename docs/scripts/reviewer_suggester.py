import subprocess
from collections import Counter
import sys

def suggest_reviewers():
    try:
        files = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], text=True).strip().split('
')
        if not files or not files[0]:
            print("No staged files found.")
            return

        authors = []
        for file in files:
            if not file: continue
            blame = subprocess.check_output(['git', 'blame', '--line-porcelain', file], text=True)
            for line in blame.split('
'):
                if line.startswith('author '):
                    authors.append(line.replace('author ', ''))

        counts = Counter(authors)
        print("Suggested Reviewers (based on file history):")
        for author, count in counts.most_common(3):
            print(f"- {author} ({count} lines modified in these files)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    suggest_reviewers()
