import re

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove sketch-border from chat-layout
content = content.replace('<div className="chat-layout sketch-border">', '<div className="chat-layout">')

# Modify Composer area to look more modern/WhatsApp like
old_composer = '''<div className="chat-composer-area">
                                      {replyingToMessage && (
                                          <div className="replying-to-bar">
                                              <div style={{fontWeight:'bold', fontSize:'0.85rem', color:'var(--accent)'}}>Replying to {replyingToMessage.sender}</div>
                                              <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{replyingToMessage.text}</div>
                                              <button type="button" className="msg-action-btn" onClick={() => setReplyingToMessage(null)} style={{position:'absolute', right:'0.5rem', top:'50%', transform:'translateY(-50%)'}}><X size={14}/></button>
                                          </div>
                                      )}
                                      <form className="composer-input-row" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                                          <button type="button" className="msg-action-btn" title="Attach"><Paperclip size={20}/></button>
                                          <input 
                                              type="text" 
                                              className="rich-textarea" 
                                              placeholder="Type a message..."
                                              value={newMessage}
                                              onChange={(e) => setNewMessage(e.target.value)}
                                          />
                                          <button type="button" className="msg-action-btn" title="Emoji"><Smile size={20}/></button>
                                          <button type="submit" className="sketch-button primary" style={{padding:'0.5rem 1rem'}}><Send size={18}/></button>
                                      </form>
                                  </div>'''

new_composer = '''<div className="chat-composer-area">
                                      {replyingToMessage && (
                                          <div className="replying-to-bar">
                                              <div style={{fontWeight:'bold', fontSize:'0.85rem', color:'var(--accent)'}}>Replying to {replyingToMessage.sender}</div>
                                              <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{replyingToMessage.text}</div>
                                              <button type="button" className="msg-action-btn" onClick={() => setReplyingToMessage(null)} style={{position:'absolute', right:'0.5rem', top:'50%', transform:'translateY(-50%)'}}><X size={14}/></button>
                                          </div>
                                      )}
                                      <form className="composer-input-row" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                                          <button type="button" className="msg-action-btn" title="Emoji"><Smile size={24}/></button>
                                          <button type="button" className="msg-action-btn" title="Attach"><Paperclip size={24}/></button>
                                          <input 
                                              type="text" 
                                              className="chat-input-field" 
                                              placeholder="Type a message"
                                              value={newMessage}
                                              onChange={(e) => setNewMessage(e.target.value)}
                                          />
                                          {newMessage ? (
                                              <button type="submit" className="msg-action-btn send-btn"><Send size={24}/></button>
                                          ) : (
                                              <button type="button" className="msg-action-btn"><Mic size={24}/></button>
                                          )}
                                      </form>
                                  </div>'''
content = content.replace(old_composer, new_composer)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated app.jsx")
