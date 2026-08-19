import re
import sys

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the workspace tree UI
tree_pattern = r'\{workspaceLevel === \'tree\' && \(\(\) => \{.*?\}\)\(\)\}'

new_tree = '''{workspaceLevel === 'tree' && (() => {
                                  const file = files.find(f => f.id === selectedFileId);
                                  if(!file) return <div>File not found.</div>;
                                  return (
                                      <div style={{padding:'1.5rem', background:'var(--panel-bg)', backdropFilter:'blur(20px)', border:'1px solid var(--border-color)', borderRadius:'16px', marginTop:'1rem', boxShadow: 'var(--shadow-md)'}}>
                                          {/* ROOT */}
                                          <div style={{display:'flex', alignItems:'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
                                              <div style={{display:'flex', alignItems:'center', gap:'0.75rem', fontWeight:'900', fontSize:'1.4rem', color:'var(--accent)'}}>
                                                  <FolderTree size={28}/> {file.name}
                                              </div>
                                              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                                  <div style={{width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)', animation: 'neuroPulse 2s infinite'}}></div>
                                                  <span style={{fontSize: '0.9rem', color: 'var(--success)', fontWeight: 'bold'}}>2 Users Currently Accessing</span>
                                              </div>
                                          </div>
                                          
                                          {/* ACTIVE USERS BRANCH */}
                                          <div style={{marginLeft:'1.5rem', paddingLeft:'2rem', borderLeft:'3px solid var(--success)', marginBottom: '2rem'}}>
                                              <div style={{position:'relative'}}>
                                                  <div style={{position:'absolute', left:'-35px', top:'20px', width:'32px', height:'3px', background:'var(--success)'}}></div>
                                                  <div style={{background:'rgba(16, 185, 129, 0.1)', border:'1px solid rgba(16, 185, 129, 0.3)', borderRadius:'8px', padding:'1rem', display:'inline-block', minWidth:'350px'}}>
                                                      <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold', color: 'var(--success)'}}>
                                                          <User size={16}/> Alice (Employee)
                                                      </div>
                                                      <div style={{fontSize:'0.9rem', marginTop: '0.25rem'}}><strong>Status:</strong> Currently Viewing...</div>
                                                  </div>
                                              </div>
                                              <div style={{position:'relative', marginTop: '1rem'}}>
                                                  <div style={{position:'absolute', left:'-35px', top:'20px', width:'32px', height:'3px', background:'var(--success)'}}></div>
                                                  <div style={{background:'rgba(16, 185, 129, 0.1)', border:'1px solid rgba(16, 185, 129, 0.3)', borderRadius:'8px', padding:'1rem', display:'inline-block', minWidth:'350px'}}>
                                                      <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold', color: 'var(--success)'}}>
                                                          <User size={16}/> Bob (Team Lead)
                                                      </div>
                                                      <div style={{fontSize:'0.9rem', marginTop: '0.25rem'}}><strong>Status:</strong> Modifying...</div>
                                                  </div>
                                              </div>
                                          </div>

                                          {/* HISTORY BRANCHES */}
                                          <div style={{marginLeft:'1.5rem', paddingLeft:'2rem', borderLeft:'3px solid var(--accent)', display:'flex', flexDirection:'column', gap:'1.5rem'}}>
                                              <div style={{color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Historical Activity</div>
                                              {file.history.map((hist, idx) => (
                                                  <div key={idx} style={{position:'relative'}}>
                                                      <div style={{position:'absolute', left:'-35px', top:'20px', width:'32px', height:'3px', background:'var(--accent)'}}></div>
                                                      <div style={{background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:'8px', padding:'1rem', display:'inline-block', minWidth:'350px', transition: 'all 0.2s', cursor: 'pointer'}} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                                                          <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'bold', marginBottom:'0.25rem'}}>
                                                              <User size={16} color="var(--accent)"/> {hist.user}
                                                          </div>
                                                          <div style={{fontSize:'0.9rem', marginBottom:'0.5rem'}}><strong>Action:</strong> {hist.action}</div>
                                                          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>
                                                              <Clock size={12} style={{verticalAlign:'middle', marginRight:'4px'}}/>
                                                              Started/Ended: {hist.date} at {hist.time}
                                                          </div>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  )
                              })()}'''

content = re.sub(tree_pattern, new_tree, content, flags=re.DOTALL)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Tree replaced successfully!')
