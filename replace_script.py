import re
import sys

def replace_in_file(filepath, pattern, replacement, flags=re.DOTALL):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = re.subn(pattern, replacement, content, flags=flags)
    if count == 0:
        print(f'Pattern not found in {filepath}')
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Successfully replaced {count} occurrence(s) in {filepath}')

# 1. Update Dashboard Productivity Overview
dashboard_pattern = r'({/\* Top Analytics Header \*/}.*?)let processedFiles = \[\.\.\.files\];'
dashboard_replacement = '''\\1let processedFiles = [...files];'''
# Wait, I need to update the file category removal and massive search bar. Let's do that separately.

