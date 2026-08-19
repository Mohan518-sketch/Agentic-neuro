import re
import sys

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the chat sidebar
chat_sidebar_pattern = r'\{/\* Sidebar \*/\}.*?<div className="chat-main">'

whatsapp_sidebar = '''{/* Sidebar */}
                              <div className={`chat-sidebar ${chatSidebarOpen ? 'open' : ''}`}>
                                  <div className="chat-sidebar-header">
                                      <div className="whatsapp-top-row">
                                          <div style={{fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)'}}>Chats</div>
                                          <div style={{display:'flex', gap:'0.5rem'}}>
                                              <button className="msg-action-btn" title="New Chat" style={{background: 'var(--accent)', color: '#fff'}}><Plus size={16}/></button>
                                              <button className="msg-action-btn" onClick={() => setAgenticSearchOpen(true)} title="Agentic Search (Ctrl+K)"><Search size={16}/></button>
                                              <button className="msg-action-btn mobile-menu-btn" style={{display:'none'}} onClick={() => setChatSidebarOpen(false)}><X size={16}/></button>
                                          </div>
                                      </div>
                                      <div className="whatsapp-search-wrapper">
                                          <Search size={14} className="whatsapp-search-icon" />
                                          <input type="text" className="whatsapp-search" placeholder="Search..." />
                                      </div>
                                      <div className="whatsapp-filters">
                                          <button className="whatsapp-filter-btn active">All</button>
                                          <button className="whatsapp-filter-btn">Unread</button>
                                          <button className="whatsapp-filter-btn">Favorites</button>
                                          <button className="whatsapp-filter-btn">Groups</button>
                                      </div>
                                  </div>
                                  <div className="chat-sidebar-list">
                                      {/* General Chat */}
                                      <div className={`chat-convo-item ${activeConversation === 'general' ? 'active' : ''}`} onClick={() => {setActiveConversation('general'); setChatSidebarOpen(false);}}>
                                          <div className="chat-avatar">
                                              <UserCircle2 size={24}/>
                                              <div className="chat-presence presence-online"></div>
                                          </div>
                                          <div className="chat-convo-details">
                                              <div className="chat-convo-header">
                                                  <div className="chat-convo-name">General Team Chat</div>
                                                  <div className="chat-convo-time" style={{color: 'var(--accent)', fontWeight: 'bold'}}>10:42 AM</div>
                                              </div>
                                              <div className="chat-convo-snippet">Alice: Hey team, I just uploaded the new blueprints.</div>
                                          </div>
                                          <div className="chat-unread-badge">3</div>
                                      </div>
                                      {/* Direct Messages Mock */}
                                      <div className={`chat-convo-item ${activeConversation === 'alice' ? 'active' : ''}`} onClick={() => {setActiveConversation('alice'); setChatSidebarOpen(false);}}>
                                          <div className="chat-avatar">A<div className="chat-presence presence-away"></div></div>
                                          <div className="chat-convo-details">
                                              <div className="chat-convo-header">
                                                  <div className="chat-convo-name">Alice (Employee)</div>
                                                  <div className="chat-convo-time">Yesterday</div>
                                              </div>
                                              <div className="chat-convo-snippet">Are we still on for the meeting?</div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
  
                              {/* Main Chat View */}
                              <div className="chat-main">'''

content = re.sub(chat_sidebar_pattern, whatsapp_sidebar, content, flags=re.DOTALL)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Chat sidebar replaced successfully!')
