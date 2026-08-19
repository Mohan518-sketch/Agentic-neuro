import re
import sys

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initial registered users
initial_users_old = """        return [
            { employeeId: 'admin', name: 'System Admin', password: 'admin', role: 'Higher Authority', email: 'admin@agentic.io', _plainInit: true }
        ];"""
initial_users_new = """        return [
            { employeeId: 'admin', name: 'System Admin', password: 'admin', role: 'Higher Authority', email: 'admin@agentic.io', _plainInit: true },
            { employeeId: 'alice', name: 'Alice', password: 'password', role: 'Employee', email: 'alice@agentic.io', _plainInit: true },
            { employeeId: 'bob', name: 'Bob', password: 'password', role: 'Employee', email: 'bob@agentic.io', _plainInit: true },
            { employeeId: 'charlie', name: 'Charlie', password: 'password', role: 'Team Lead', email: 'charlie@agentic.io', _plainInit: true },
            { employeeId: 'david', name: 'David', password: 'password', role: 'Employee', email: 'david@agentic.io', _plainInit: true },
            { employeeId: 'eve', name: 'Eve', password: 'password', role: 'Team Lead', email: 'eve@agentic.io', _plainInit: true }
        ];"""
content = content.replace(initial_users_old, initial_users_new)

# 2. Update role mapping in handleRegister
reg_role_old = """            password: hashedPwd,
            role: regRole,
            jobTitle: sanitizeInput(regJobTitle.trim()),"""
reg_role_new = """            password: hashedPwd,
            role: regRole.trim().toLowerCase() === 'admin' ? 'Higher Authority' : (regRole.trim() || 'Employee'),
            designationStr: regRole.trim(),
            jobTitle: sanitizeInput(regJobTitle.trim()),"""
content = content.replace(reg_role_old, reg_role_new)

# 3. Update UI for Role Registration
reg_ui_old = """                            <div className="form-group">
                                <label>Designation <span style={{color:'var(--danger)'}}>*</span></label>
                                <select value={regRole} onChange={e=>setRegRole(e.target.value)} style={{width:'100%',padding:'0.6rem',border:'1.5px dashed var(--border-color)',borderRadius:'6px',background:'transparent',color:'var(--text-primary)',fontFamily:'inherit',fontSize:'0.9rem'}}>
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Higher Authority">Higher Authority</option>
                                </select>
                            </div>"""
reg_ui_new = """                            <div className="form-group">
                                <label>Designation (Optional)</label>
                                <input type="text" placeholder="e.g. Developer, Admin" value={regRole} onChange={e=>setRegRole(e.target.value)} style={{width:'100%',padding:'0.6rem',border:'1.5px dashed var(--border-color)',borderRadius:'6px',background:'transparent',color:'var(--text-primary)',fontFamily:'inherit',fontSize:'0.9rem'}}/>
                            </div>"""
content = content.replace(reg_ui_old, reg_ui_new)

# 4. Add Chat State
chat_state_old = "    const [agenticSearchQuery, setAgenticSearchQuery] = useState('');"
chat_state_new = """    const [agenticSearchQuery, setAgenticSearchQuery] = useState('');
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupMembers, setNewGroupMembers] = useState([]);
    const [chatGroups, setChatGroups] = useState([
        { id: 'general', type: 'group', name: 'General Team Chat', time: '10:42 AM', snippet: 'Alice: Hey team, I just uploaded the new blueprints.', unread: 3 }
    ]);"""
content = content.replace(chat_state_old, chat_state_new)

# 5. Update Chat Sidebar
sidebar_pattern = r'<div className={`chat-sidebar \$\{chatSidebarOpen \? \'open\' : \'\'\}`}>.*?</div>\s+</div>\s+</div>\s+\{/\* Main Chat View \*/\}'
sidebar_new = """<div className={`chat-sidebar ${chatSidebarOpen ? 'open' : ''}`}>
                                  <div className="chat-sidebar-header">
                                      <div className="whatsapp-top-row">
                                          <div style={{fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)'}}>Chats</div>
                                          <div style={{display:'flex', gap:'0.5rem'}}>
                                              <button className="msg-action-btn" onClick={() => setShowCreateGroup(true)} title="New Group/Chat" style={{background: 'var(--accent)', color: '#fff'}}><Plus size={16}/></button>
                                              <button className="msg-action-btn" onClick={() => setAgenticSearchOpen(true)} title="Agentic Search (Ctrl+K)"><Search size={16}/></button>
                                              <button className="msg-action-btn mobile-menu-btn" style={{display:'none'}} onClick={() => setChatSidebarOpen(false)}><X size={16}/></button>
                                          </div>
                                      </div>
                                      <div className="whatsapp-search-wrapper">
                                          <Search size={14} className="whatsapp-search-icon" />
                                          <input type="text" className="whatsapp-search" placeholder="Search..." value={chatSearchQuery} onChange={e => setChatSearchQuery(e.target.value)} />
                                      </div>
                                      {/* Removed exact filters as requested */}
                                  </div>
                                  <div className="chat-sidebar-list">
                                      {/* Dynamic Chat List (Groups and Direct Messages) */}
                                      {(() => {
                                          const sq = chatSearchQuery.toLowerCase();
                                          // 1. Combine Groups + Users (excluding Admin and self)
                                          let allChats = [
                                              ...chatGroups,
                                              ...registeredUsers.filter(u => u.role !== 'Higher Authority' && u.employeeId !== loggedInUser?.username).map(u => ({
                                                  id: u.employeeId,
                                                  type: 'dm',
                                                  name: u.name + (u.designationStr ? ` (${u.designationStr})` : ''),
                                                  time: 'Recently',
                                                  snippet: 'Tap to chat',
                                                  unread: 0
                                              }))
                                          ];
                                          // 2. Filter by search query (no exact search, just partial match)
                                          if (sq) {
                                              allChats = allChats.filter(c => c.name.toLowerCase().includes(sq));
                                          }
                                          return allChats.map(chat => (
                                              <div key={chat.id} className={`chat-convo-item ${activeConversation === chat.id ? 'active' : ''}`} onClick={() => {setActiveConversation(chat.id); setChatSidebarOpen(false);}}>
                                                  <div className="chat-avatar">
                                                      {chat.type === 'group' ? <UserCircle2 size={24}/> : chat.name.charAt(0)}
                                                      <div className={`chat-presence ${chat.type === 'dm' ? 'presence-online' : ''}`}></div>
                                                  </div>
                                                  <div className="chat-convo-details">
                                                      <div className="chat-convo-header">
                                                          <div className="chat-convo-name">{chat.name}</div>
                                                          <div className="chat-convo-time" style={{color: chat.unread ? 'var(--accent)' : 'inherit', fontWeight: chat.unread ? 'bold' : 'normal'}}>{chat.time}</div>
                                                      </div>
                                                      <div className="chat-convo-snippet">{chat.snippet}</div>
                                                  </div>
                                                  {chat.unread > 0 && <div className="chat-unread-badge">{chat.unread}</div>}
                                              </div>
                                          ));
                                      })()}
                                  </div>
                              </div>
                              
                              {showCreateGroup && (
                                  <div className="modal-overlay" style={{zIndex: 9999}}>
                                      <div className="modal-content" style={{maxWidth: '400px'}}>
                                          <div className="modal-header">
                                              Create New Group
                                              <button className="sketch-button" onClick={() => setShowCreateGroup(false)}><X size={16}/></button>
                                          </div>
                                          <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                              <div>
                                                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem'}}>Group Name</label>
                                                  <input type="text" className="agentic-search-input" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Design Team" />
                                              </div>
                                              <div>
                                                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Select Members</label>
                                                  <div style={{maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem'}}>
                                                      {registeredUsers.filter(u => u.role !== 'Higher Authority' && u.employeeId !== loggedInUser?.username).map(u => (
                                                          <label key={u.employeeId} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer'}}>
                                                              <input type="checkbox" checked={newGroupMembers.includes(u.employeeId)} onChange={(e) => {
                                                                  if (e.target.checked) setNewGroupMembers([...newGroupMembers, u.employeeId]);
                                                                  else setNewGroupMembers(newGroupMembers.filter(id => id !== u.employeeId));
                                                              }} style={{margin: 0}} />
                                                              {u.name}
                                                          </label>
                                                      ))}
                                                  </div>
                                              </div>
                                              <button className="sketch-button primary" onClick={() => {
                                                  if (!newGroupName.trim()) return alert('Please enter a group name');
                                                  const newGroup = {
                                                      id: 'g_' + Date.now(),
                                                      type: 'group',
                                                      name: newGroupName,
                                                      time: 'Just now',
                                                      snippet: 'Group created',
                                                      unread: 0
                                                  };
                                                  setChatGroups([newGroup, ...chatGroups]);
                                                  setShowCreateGroup(false);
                                                  setNewGroupName('');
                                                  setNewGroupMembers([]);
                                                  setActiveConversation(newGroup.id);
                                              }}>Create Group</button>
                                          </div>
                                      </div>
                                  </div>
                              )}

                              {/* Main Chat View */}"""
content = re.sub(sidebar_pattern, sidebar_new, content, flags=re.DOTALL)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Changes applied successfully!')
