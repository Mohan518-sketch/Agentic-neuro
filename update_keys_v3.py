import re

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"registeredUsers_v2", "registeredUsers_v3", content)
content = re.sub(r"loggedInUser_v2", "loggedInUser_v3", content)
content = re.sub(r"activityLogs_v1", "activityLogs_v2", content)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
