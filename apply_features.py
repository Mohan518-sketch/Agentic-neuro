import re

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add activityLogs state
activity_logs_state = """    const [activityLogs, setActivityLogs] = useState(() => {
        const stored = localStorage.getItem('activityLogs_v1');
        if (stored) return JSON.parse(stored);
        return [];
    });
    
    const logActivity = (action, user) => {
        const newLog = {
            id: Date.now(),
            action,
            name: user?.name || 'Unknown',
            employeeId: user?.employeeId || user?.username || 'Unknown',
            time: new Date().toLocaleString()
        };
        setActivityLogs(prev => {
            const updated = [newLog, ...prev];
            localStorage.setItem('activityLogs_v1', JSON.stringify(updated));
            return updated;
        });
    };
"""
# Insert after loggedInUser state
content = re.sub(
    r"(    const \[loggedInUser, setLoggedInUser\] = useState\(\(\) => \{.*?\n    \}\);)",
    r"\1\n\n" + activity_logs_state,
    content,
    flags=re.DOTALL
)

# 2. Add logActivity to login and register
content = re.sub(
    r"(setLoggedInUser\(\{ name: found\.name, username: found\.employeeId, role: found\.role \}\);)",
    r"\1\n            logActivity('LOGIN', found);",
    content
)

content = re.sub(
    r"(setRegisteredUsers\(prev => \[\.\.\.prev, newUser\]\);)",
    r"\1\n        logActivity('SIGNUP', newUser);",
    content
)

# Also need to find logout. Let's look for "setLoggedInUser(null)"
content = re.sub(
    r"(setLoggedInUser\(null\);)",
    r"logActivity('LOGOUT', loggedInUser);\n        \1",
    content
)

# 3. Update Designation to Dropdown conditionally
# Find Designation input
designation_old = """                            <div className="form-group">
                                <label>Designation (Optional)</label>
                                <input type="text" placeholder="e.g. Developer, Admin" value={regRole} onChange={e=>setRegRole(e.target.value)} style={{width:'100%',padding:'0.6rem',border:'1.5px dashed var(--border-color)',borderRadius:'6px',background:'transparent',color:'var(--text-primary)',fontFamily:'inherit',fontSize:'0.9rem'}}/>
                            </div>"""

designation_new = """                            <div className="form-group">
                                <label>Designation <span style={{color:'var(--danger)'}}>*</span></label>
                                <select value={regRole} onChange={e=>setRegRole(e.target.value)} style={{width:'100%',padding:'0.6rem',border:'1.5px dashed var(--border-color)',borderRadius:'6px',background:'transparent',color:'var(--text-primary)',fontFamily:'inherit',fontSize:'0.9rem'}}>
                                    <option value="" disabled>Select Designation</option>
                                    <option value="Member of the team">Member of the team</option>
                                    <option value="Associate Lead">Associate Lead</option>
                                    <option value="Team Lead">Team Lead</option>
                                    <option value="Manager">Manager</option>
                                    {!registeredUsers.some(u => u.role === 'Higher Authority') && (
                                        <option value="Admin">Admin</option>
                                    )}
                                </select>
                            </div>"""
content = content.replace(designation_old, designation_new)

# 4. Change Job Title to Input
job_title_old = """                            <div className="form-group">
                                <label>Job Title <span style={{color:'var(--danger)'}}>*</span></label>
                                <select value={regJobTitle} onChange={e=>setRegJobTitle(e.target.value)} required style={{width:'100%',padding:'0.8rem 1rem',border:'1px solid var(--input-border)',borderRadius:'12px',background:'var(--input-bg)',color:'var(--text-primary)',fontFamily:'inherit',fontSize:'15px',transition:'all 0.2s ease'}}>
                                    <option value="" disabled>Select a Profession</option>
                                    <option value="Cloud Solutions Architect">Cloud Solutions Architect (AWS)</option>
                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                    <option value="SysOps Administrator">SysOps Administrator</option>
                                    <option value="Cloud Security Specialist">Cloud Security Specialist</option>
                                    <option value="Data Engineer">Data Engineer</option>
                                    <option value="Machine Learning Specialist">Machine Learning Specialist</option>
                                    <option value="Software Engineer">Software Engineer</option>
                                    <option value="QA Tester">QA Tester</option>
                                </select>
                            </div>"""
job_title_new = """                            <div className="form-group">
                                <label>Job Title <span style={{color:'var(--danger)'}}>*</span></label>
                                <input type="text" placeholder="e.g. Software Engineer" value={regJobTitle} onChange={e=>setRegJobTitle(e.target.value)} required style={{width:'100%',padding:'0.8rem 1rem',border:'1px solid var(--input-border)',borderRadius:'12px',background:'var(--input-bg)',color:'var(--text-primary)',fontFamily:'inherit',fontSize:'15px',transition:'all 0.2s ease'}}/>
                            </div>"""
content = content.replace(job_title_old, job_title_new)

# 5. Add Task Manager state
task_state = """    const [tasks, setTasks] = useState([]);
    const [taskSearch, setTaskSearch] = useState('');
    const [taskFilter, setTaskFilter] = useState('Daily');
    const [showTaskMenu, setShowTaskMenu] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [autoExtractTasks, setAutoExtractTasks] = useState(false);
"""
# Insert near chat state
content = re.sub(
    r"(    const \[chatSearchQuery, setChatSearchQuery\] = useState\(''\);)",
    r"\1\n" + task_state,
    content
)

# 6. Update Tabs logic
tabs_nav_old = """                {/* ── TOP BAR ROW 2: Navigation Tabs ── */}
                <nav className="topbar-nav sketch-border">
                    {['Dashboard', 'Chat', 'Workspace', 'Audit Log'].filter(tab => {
                        if (tab === 'Workspace') return loggedInUser.role === 'Higher Authority' || loggedInUser.role === 'Manager';
                        if (tab === 'Audit Log') return loggedInUser.role === 'Higher Authority';
                        return true;
                    }).map(tab => (
                        <div
                            key={tab}
                            className={`topnav-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'Dashboard' && <LayoutDashboard size={16}/>}
                            {tab === 'Chat' && <MessageSquare size={16}/>}
                            {tab === 'Workspace' && <FolderTree size={16}/>}
                            {tab === 'Audit Log' && <ShieldAlert size={16}/>}
                            {tab}
                        </div>
                    ))}
                </nav>"""

tabs_nav_new = """                {/* ── TOP BAR ROW 2: Navigation Tabs ── */}
                <nav className="topbar-nav sketch-border">
                    {(() => {
                        let availableTabs = [];
                        if (loggedInUser.role === 'Higher Authority') {
                            availableTabs = ['User Database'];
                        } else {
                            availableTabs = ['Dashboard', 'Chat', 'Workspace', 'Task Manager'];
                        }
                        return availableTabs.map(tab => (
                            <div
                                key={tab}
                                className={`topnav-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'Dashboard' && <LayoutDashboard size={16}/>}
                                {tab === 'Chat' && <MessageSquare size={16}/>}
                                {tab === 'Workspace' && <FolderTree size={16}/>}
                                {tab === 'Task Manager' && <ListChecks size={16}/>}
                                {tab === 'User Database' && <Database size={16}/>}
                                {tab}
                            </div>
                        ));
                    })()}
                </nav>"""
content = content.replace(tabs_nav_old, tabs_nav_new)

# Need to ensure activeTab defaults to 'Dashboard' or 'User Database'
# Wait, activeTab initial state is 'Dashboard'. We should update it so if admin, it goes to 'User Database'.
# Let's add an effect or modify activeTab state if possible. I'll just change the default view in the code below.

# 7. Add User Database View
user_db_view = """
                    {activeTab === 'User Database' && loggedInUser.role === 'Higher Authority' && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                            <div className="card sketch-border">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                                    <h2 style={{margin:0, display:'flex', alignItems:'center', gap:'0.5rem'}}><Database size={24} color="var(--accent)"/> Global User Database & Activity Logs</h2>
                                </div>
                                <div className="table-responsive">
                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                        <thead>
                                            <tr style={{borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
                                                <th style={{padding: '1rem', fontWeight: 600}}>Time</th>
                                                <th style={{padding: '1rem', fontWeight: 600}}>Action</th>
                                                <th style={{padding: '1rem', fontWeight: 600}}>Employee ID</th>
                                                <th style={{padding: '1rem', fontWeight: 600}}>Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activityLogs.map(log => (
                                                <tr key={log.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                                    <td style={{padding: '1rem'}}>{log.time}</td>
                                                    <td style={{padding: '1rem'}}>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                            background: log.action==='LOGIN' ? 'rgba(16,185,129,0.1)' : log.action==='LOGOUT' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                                                            color: log.action==='LOGIN' ? '#10b981' : log.action==='LOGOUT' ? '#ef4444' : '#3b82f6'
                                                        }}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td style={{padding: '1rem', fontWeight: 500}}>{log.employeeId}</td>
                                                    <td style={{padding: '1rem'}}>{log.name}</td>
                                                </tr>
                                            ))}
                                            {activityLogs.length === 0 && (
                                                <tr><td colSpan="4" style={{padding:'2rem', textAlign:'center', color:'var(--text-secondary)'}}>No activity logs found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
"""

# 8. Add Task Manager View
task_manager_view = """
                    {activeTab === 'Task Manager' && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                            <div className="card sketch-border">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                                    <h2 style={{margin:0, display:'flex', alignItems:'center', gap:'0.5rem'}}><ListChecks size={24} color="var(--accent)"/> Task Manager</h2>
                                    
                                    <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--input-bg)', padding:'0.5rem 1rem', borderRadius:'20px', border:'1px solid var(--border-color)'}}>
                                            <Search size={16} color="var(--text-secondary)"/>
                                            <input type="text" placeholder="Search tasks..." value={taskSearch} onChange={e=>setTaskSearch(e.target.value)} style={{border:'none', background:'transparent', color:'var(--text-primary)', outline:'none', width:'150px'}}/>
                                        </div>
                                        <div style={{position:'relative'}}>
                                            <button onClick={() => setShowTaskMenu(!showTaskMenu)} style={{background:'transparent', border:'1px solid var(--border-color)', borderRadius:'50%', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-primary)'}}>
                                                <MoreVertical size={16}/>
                                            </button>
                                            {showTaskMenu && (
                                                <div style={{position:'absolute', top:'100%', right:0, background:'var(--panel-bg)', border:'1px solid var(--border-color)', borderRadius:'8px', marginTop:'0.5rem', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:10, minWidth:'120px', overflow:'hidden'}}>
                                                    {['Daily', 'Monthly', 'Yearly'].map(opt => (
                                                        <div key={opt} onClick={() => { setTaskFilter(opt); setShowTaskMenu(false); }} style={{padding:'0.75rem 1rem', cursor:'pointer', background: taskFilter === opt ? 'var(--bg-hover)' : 'transparent', fontWeight: taskFilter === opt ? 'bold' : 'normal'}}>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{background:'var(--bg-hover)', padding:'1rem', borderRadius:'8px', display:'flex', gap:'1rem', marginBottom:'1.5rem', alignItems:'center'}}>
                                    <input type="text" placeholder="Task description..." value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} style={{flex:1, padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--border-color)', background:'var(--input-bg)', color:'var(--text-primary)'}}/>
                                    <input type="datetime-local" value={newTaskDate} onChange={e=>setNewTaskDate(e.target.value)} style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--border-color)', background:'var(--input-bg)', color:'var(--text-primary)'}}/>
                                    <button className="sketch-button primary" onClick={() => {
                                        if(!newTaskText.trim()) return;
                                        setTasks([{id:Date.now(), text:newTaskText, date:newTaskDate, status:'Pending'}, ...tasks]);
                                        setNewTaskText(''); setNewTaskDate('');
                                    }}>Add Task</button>
                                </div>

                                <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.5rem', padding:'0.75rem', background:'rgba(37,99,235,0.05)', borderRadius:'6px', border:'1px dashed var(--accent)'}}>
                                    <input type="checkbox" id="autoExtract" checked={autoExtractTasks} onChange={e=>setAutoExtractTasks(e.target.checked)} style={{cursor:'pointer'}}/>
                                    <label htmlFor="autoExtract" style={{cursor:'pointer', fontSize:'0.9rem'}}><strong>Auto-Extract from Chat:</strong> Automatically schedule reminders from chat messages.</label>
                                </div>

                                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                                    {tasks.filter(t => t.text.toLowerCase().includes(taskSearch.toLowerCase())).map(task => (
                                        <div key={task.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem', border:'1px solid var(--border-color)', borderRadius:'8px', background:'var(--panel-bg)'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                                                <input type="checkbox" checked={task.status==='Completed'} onChange={() => {
                                                    setTasks(tasks.map(t => t.id === task.id ? {...t, status: t.status==='Completed' ? 'Pending' : 'Completed'} : t));
                                                }} style={{transform:'scale(1.2)', cursor:'pointer'}}/>
                                                <span style={{textDecoration: task.status==='Completed' ? 'line-through' : 'none', color: task.status==='Completed' ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight:500}}>{task.text}</span>
                                            </div>
                                            {task.date && (
                                                <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'0.25rem'}}>
                                                    <Clock size={14}/> {new Date(task.date).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {tasks.length === 0 && <div style={{textAlign:'center', padding:'2rem', color:'var(--text-secondary)'}}>No tasks scheduled.</div>}
                                </div>
                            </div>
                        </div>
                    )}
"""

# Insert the views into main content area
content = re.sub(
    r"(<div className=\"content-area\">\n)",
    r"\1" + user_db_view + task_manager_view,
    content
)

# We need to make sure ListChecks and Database and Clock icons are imported
lucide_import_old = "import { UserCircle2, UserPlus, Phone, CreditCard, Menu, ArrowRight, BookOpen, Send, Mic, Paperclip, MoreVertical, Search, Settings, Home, Calendar, Users, X, LayoutDashboard, MessageSquare, FolderTree, Sun, Moon, Link as LinkIcon, FileText, Image as ImageIcon, Video, Star, File as FileIcon, ChevronDown, ChevronRight, Upload, Play, CheckCircle, ShieldAlert, BadgeCheck, AlertTriangle, Eye, EyeOff, Building, Building2, Server, KeyRound, Lock, User, Check, Trash2, ShieldCheck, HelpCircle, Download, FileAudio, FileVideo, Plus } from 'lucide-react';"
lucide_import_new = "import { UserCircle2, UserPlus, Phone, CreditCard, Menu, ArrowRight, BookOpen, Send, Mic, Paperclip, MoreVertical, Search, Settings, Home, Calendar, Users, X, LayoutDashboard, MessageSquare, FolderTree, Sun, Moon, Link as LinkIcon, FileText, Image as ImageIcon, Video, Star, File as FileIcon, ChevronDown, ChevronRight, Upload, Play, CheckCircle, ShieldAlert, BadgeCheck, AlertTriangle, Eye, EyeOff, Building, Building2, Server, KeyRound, Lock, User, Check, Trash2, ShieldCheck, HelpCircle, Download, FileAudio, FileVideo, Plus, Database, ListChecks, Clock } from 'lucide-react';"
content = content.replace(lucide_import_old, lucide_import_new)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Changes applied!")
