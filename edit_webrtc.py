import re
import sys

with open('app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states
if 'const [isCalling, setIsCalling] = useState(false);' not in content:
    content = content.replace(
        'const [selectedMemberForGraph, setSelectedMemberForGraph] = useState(null);',
        'const [selectedMemberForGraph, setSelectedMemberForGraph] = useState(null);\n    const [isCalling, setIsCalling] = useState(false);\n    const [callType, setCallType] = useState(\'video\');\n    const [isScreenSharing, setIsScreenSharing] = useState(false);\n    const [mockSubtitle, setMockSubtitle] = useState(\'Connecting to Gemini 3.1 Pro...\');\n    const videoRef = useRef(null);\n    const streamRef = useRef(null);'
    )

# Add WebRTC functions inside App component (let's insert right after the state declarations)
if 'const startCall =' not in content:
    webrtc_funcs = '''
    const startCall = (type) => {
        setIsCalling(true);
        setCallType(type);
        setMockSubtitle('Connecting to Gemini 3.1 Pro...');
        setTimeout(() => setMockSubtitle('Hello! I am Gemini 3.1 Pro (Test Agent). How can I assist you today?'), 2000);
    };

    const endCall = () => {
        setIsCalling(false);
        setIsScreenSharing(false);
        setMockSubtitle('');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setIsScreenSharing(false);
            setMockSubtitle('Screen sharing stopped.');
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                streamRef.current = stream;
                setIsScreenSharing(true);
                setMockSubtitle('I can see your screen now. What would you like to discuss?');
                
                // Handle native "Stop sharing" button in browser UI
                stream.getVideoTracks()[0].onended = () => {
                    setIsScreenSharing(false);
                    streamRef.current = null;
                    setMockSubtitle('Screen sharing stopped.');
                };

                // Attach stream to video element once it renders
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                }, 100);

            } catch (err) {
                console.error("Error sharing screen: ", err);
                setMockSubtitle('Screen sharing was denied or failed.');
            }
        }
    };
    '''
    content = content.replace(
        'const [sidebarOpen, setSidebarOpen] = useState(true);',
        webrtc_funcs + '\n    const [sidebarOpen, setSidebarOpen] = useState(true);'
    )

# Replace the chat buttons to actually call the functions
# The chat buttons were:
# <button className="sketch-button" onClick={() => startCall('voice')} title="Voice Call"><Phone size={18}/></button>
# <button className="sketch-button" onClick={() => startCall('video')} title="Video Call"><Video size={18}/></button>
# Wait, they are already named `startCall('voice')` and `startCall('video')` in the original code, but no `startCall` function existed.
# Let's verify they exist and update them.
content = content.replace(
    '<button className="sketch-button" onClick={() => startCall(\'voice\')}',
    '<button className="sketch-button" onClick={() => startCall(\'audio\')}'
)

# Add Call Overlay JSX before the end of the app
call_overlay_jsx = '''
          {isCalling && (
              <div className="call-overlay">
                  <div style={{position: 'absolute', top: '2rem', left: '2rem', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <Shield size={24} color="var(--success)" /> End-to-End Encrypted Test Call
                  </div>
                  
                  <div className="call-avatar-container">
                      <div className="call-avatar-pulse"></div>
                      {callType === 'video' ? <Video size={64} /> : <Phone size={64} />}
                  </div>
                  <div style={{color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                      Gemini 3.1 Pro (Test Agent)
                  </div>
                  <div className="call-subtitle">
                      {mockSubtitle}
                  </div>

                  <div className="call-controls">
                      <button className="call-btn" title="Mute/Unmute"><Mic size={24}/></button>
                      <button className="call-btn" title="Enable/Disable Video"><Video size={24}/></button>
                      <button className={`call-btn ${isScreenSharing ? 'active' : ''}`} onClick={toggleScreenShare} title="Share Screen"><Monitor size={24}/></button>
                      <button className="call-btn end" onClick={endCall} title="End Call"><PhoneOff size={24}/></button>
                  </div>

                  {isScreenSharing && (
                      <video ref={videoRef} autoPlay playsInline muted className="screen-share-video" />
                  )}
              </div>
          )}
'''
content = re.sub(r'</div>\s*<FlashMessages />', '</div>\n' + call_overlay_jsx + '\n<FlashMessages />', content, flags=re.DOTALL)

with open('app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('App updated with WebRTC call logic!')
