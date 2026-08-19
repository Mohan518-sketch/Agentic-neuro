import re
import time

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

v = str(int(time.time()))

content = re.sub(r'href="index\.css[^"]*"', f'href="index.css?v={v}"', content)
content = re.sub(r'src="app\.jsx[^"]*"', f'src="app.jsx?v={v}"', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added cache-busters to index.html")
