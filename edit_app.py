import re
import sys

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Recharts import
if 'from recharts' not in content:
    content = content.replace(
        'const { useState, useEffect, useRef, useMemo } = React;',
        'const { useState, useEffect, useRef, useMemo } = React;\nconst { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip: RechartsTooltip, ResponsiveContainer } = window.Recharts || {};'
    )

# 1. Update Dashboard
# Remove category logic
content = re.sub(r'if \(fileCategory !== \'All\'\) \{.*?\}\n', '', content, flags=re.DOTALL)

# Update Recent Files UI
recent_files_ui = '''<div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                                      <h3 style={{margin:0}}>Recent File Modifications</h3>
                                      <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                                          <div style={{position:'relative', width: '300px'}}>
                                              <Search size={16} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)'}}/>
                                              <input type="text" placeholder="Search billions of files..." value={fileSearch} onChange={e => setFileSearch(e.target.value)} style={{width:'100%', padding:'0.5rem 1rem 0.5rem 2.2rem', borderRadius:'20px', border:'1px solid var(--input-border)', background:'var(--input-bg)', color:'var(--text-primary)', outline:'none'}}/>
                                          </div>
                                      </div>
                                  </div>'''
content = re.sub(r'<div style={{display:\'flex\', justifyContent:\'space-between\', alignItems:\'center\', marginBottom:\'1\.5rem\'}}>\s*<h3 style={{margin:0}}>Recent File Modifications</h3>.*?</div>\s*</div>', recent_files_ui, content, flags=re.DOTALL)

# Update Productivity Lists
team_leads_ui = '''<div className="card sketch-border">
                                      <h3 style={{marginBottom:'1rem', color:'var(--accent)'}}>Team Leads</h3>
                                      <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                                          {TEAM_DATA.filter(t => t.role === 'Team Lead').map(member => (
                                              <div key={member.name} style={{display:'flex', justifyContent:'space-between', padding:'0.75rem', background:'var(--bg-surface)', borderRadius:'8px', border:'1px solid var(--border-color)', cursor:'pointer'}} onClick={() => setSelectedMemberForGraph(member)}>
                                                  <div style={{fontWeight:600}}>{member.team} Team</div>
                                                  <div style={{fontWeight:800, color:'var(--accent)'}}>{getFilteredHours(member.weeklyData, productivityTimeFilter)}h</div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>'''
content = re.sub(r'<div className="card sketch-border">\s*<h3 style={{marginBottom:\'1rem\', color:\'var\(--accent\)\'}}>Team Lead Hours</h3>.*?</div>\s*</div>', team_leads_ui + '\n</div>', content, flags=re.DOTALL)

employees_ui = '''<div className="card sketch-border">
                                      <h3 style={{marginBottom:'1rem', color:'var(--secondary-accent)'}}>Employees</h3>
                                      <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                                          {TEAM_DATA.filter(t => t.role === 'Employee').map(member => (
                                              <div key={member.name} style={{display:'flex', justifyContent:'space-between', padding:'0.75rem', background:'var(--bg-surface)', borderRadius:'8px', border:'1px solid var(--border-color)', cursor:'pointer'}} onClick={() => setSelectedMemberForGraph(member)}>
                                                  <div style={{fontWeight:600}}>{member.name}</div>
                                                  <div style={{fontWeight:800, color:'var(--secondary-accent)'}}>{getFilteredHours(member.weeklyData, productivityTimeFilter)}h</div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>'''
content = re.sub(r'<div className="card sketch-border">\s*<h3 style={{marginBottom:\'1rem\', color:\'var\(--secondary-accent\)\'}}>Employee Hours</h3>.*?</div>\s*</div>', employees_ui + '\n</div>', content, flags=re.DOTALL)


with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
