import re

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"registeredUsers_v3", "registeredUsers_v4", content)
content = re.sub(r"loggedInUser_v3", "loggedInUser_v4", content)
content = re.sub(r"activityLogs_v2", "activityLogs_v3", content)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
