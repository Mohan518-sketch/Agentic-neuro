import re
import sys

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add selectedMemberForGraph state
if 'const [selectedMemberForGraph, setSelectedMemberForGraph] = useState(null);' not in content:
    content = content.replace(
        'const [agenticSearchOpen, setAgenticSearchOpen] = useState(false);',
        'const [agenticSearchOpen, setAgenticSearchOpen] = useState(false);\n    const [selectedMemberForGraph, setSelectedMemberForGraph] = useState(null);'
    )

# Add Modal JSX before the final </div> of the app
modal_jsx = '''
          {selectedMemberForGraph && (
              <div className="modal-overlay" onClick={(e) => {
                  if(e.target.className === 'modal-overlay') setSelectedMemberForGraph(null);
              }}>
                  <div className="modal-content" style={{width: '90%', maxWidth: '800px'}}>
                      <div className="modal-header">
                          <div>
                              <div style={{color: 'var(--accent)', fontSize: '1.5rem'}}>{selectedMemberForGraph.role === 'Team Lead' ? `${selectedMemberForGraph.team} Team` : selectedMemberForGraph.name}</div>
                              <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>8-Hour Workday Bit-by-Bit Productivity Analysis</div>
                          </div>
                          <button className="msg-action-btn" onClick={() => setSelectedMemberForGraph(null)}><X size={24}/></button>
                      </div>
                      <div className="modal-body" style={{height: '400px'}}>
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={[
                                  {time: '09:00', productivity: Math.floor(Math.random() * 40) + 60},
                                  {time: '10:00', productivity: Math.floor(Math.random() * 40) + 60},
                                  {time: '11:00', productivity: Math.floor(Math.random() * 40) + 60},
                                  {time: '12:00', productivity: Math.floor(Math.random() * 40) + 60},
                                  {time: '13:00', productivity: Math.floor(Math.random() * 40) + 40},
                                  {time: '14:00', productivity: Math.floor(Math.random() * 40) + 60},
                                  {time: '15:00', productivity: Math.floor(Math.random() * 40) + 60},
                                  {time: '16:00', productivity: Math.floor(Math.random() * 40) + 60},
                                  {time: '17:00', productivity: Math.floor(Math.random() * 40) + 50},
                              ]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                  <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                                  <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} domain={[0, 100]} />
                                  <RechartsTooltip contentStyle={{backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)'}} />
                                  <Line type="monotone" dataKey="productivity" stroke="var(--accent)" strokeWidth={3} dot={{r: 4, fill: 'var(--bg-color)', stroke: 'var(--accent)', strokeWidth: 2}} activeDot={{r: 6}} animationDuration={1500} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
};
'''
content = re.sub(r'</div>\s*<FlashMessages />\s*</div>\s*\);\s*};\s*', '</div>\n<FlashMessages />\n' + modal_jsx, content, flags=re.DOTALL)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Modal replaced successfully!')
