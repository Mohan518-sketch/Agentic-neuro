import re

with open('index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Make chat area background WhatsApp-like with a pattern or distinct color
if '.chat-messages-area {' in content:
    content = content.replace(
        '''  .chat-messages-area {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    background: var(--bg-subtle);
  }''',
        '''  .chat-messages-area {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #0b141a; /* Dark whatsapp background */
    background-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z" fill="rgba(255,255,255,0.02)" fill-rule="evenodd"/></svg>');
    position: relative;
  }'''
    )

# Fix msg-wrapper self/other alignment
if '.msg-wrapper {' in content:
    content = content.replace(
        '''  .msg-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 75%;
    position: relative;
  }''',
        '''  .msg-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 65%;
    position: relative;
    clear: both;
  }'''
    )

# Fix chat composer styling for new input
css_additions = '''
.chat-input-field {
    flex: 1;
    background: #2a3942;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    color: #d1d7db;
    font-size: 0.95rem;
    outline: none;
}
.chat-input-field::placeholder {
    color: #8696a0;
}
.msg-action-btn {
    background: transparent;
    border: none;
    color: #8696a0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    transition: color 0.2s;
}
.msg-action-btn:hover {
    color: #d1d7db;
}
.msg-action-btn.send-btn {
    color: var(--accent);
}
.msg-action-btn.send-btn:hover {
    color: var(--secondary-accent);
}
'''
if '.chat-input-field' not in content:
    content += css_additions

with open('index.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.css")
