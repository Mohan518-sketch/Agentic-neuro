import re

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any occurrence of 'agenticRegisteredUsers' or 'registeredUsers' in localStorage with 'registeredUsers_v2'
# Replace any occurrence of 'agenticSession' or 'loggedInUser' in localStorage with 'loggedInUser_v2'

content = re.sub(r"localStorage\.getItem\(['\"](?:agenticRegisteredUsers|registeredUsers)['\"]\)", "localStorage.getItem('registeredUsers_v2')", content)
content = re.sub(r"localStorage\.setItem\(['\"](?:agenticRegisteredUsers|registeredUsers)['\"]", "localStorage.setItem('registeredUsers_v2'", content)

content = re.sub(r"localStorage\.getItem\(['\"](?:agenticSession|loggedInUser)['\"]\)", "localStorage.getItem('loggedInUser_v2')", content)
content = re.sub(r"localStorage\.setItem\(['\"](?:agenticSession|loggedInUser)['\"]", "localStorage.setItem('loggedInUser_v2'", content)
content = re.sub(r"localStorage\.removeItem\(['\"](?:agenticSession|loggedInUser)['\"]\)", "localStorage.removeItem('loggedInUser_v2')", content)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('localStorage keys updated.')
