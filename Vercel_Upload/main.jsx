const { useState, useEffect, useRef, useCallback } = React;

// ═══════════════════════════════════════════════════════
// SECURITY LAYER 1: Password Hashing (SHA-256)
// ═══════════════════════════════════════════════════════
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '__agentic_salt_2026__');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ═══════════════════════════════════════════════════════
// SECURITY LAYER 2: Input Sanitization (XSS Prevention)
// ═══════════════════════════════════════════════════════
function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// ═══════════════════════════════════════════════════════
// SECURITY LAYER 3: Password Strength Checker
// ═══════════════════════════════════════════════════════
function getPasswordStrength(pwd) {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
        { label: 'Very Weak', color: '#ef4444' },
        { label: 'Weak', color: '#f97316' },
        { label: 'Fair', color: '#eab308' },
        { label: 'Strong', color: '#22c55e' },
        { label: 'Very Strong', color: '#16a34a' },
    ];
    const idx = Math.min(score, 5) - 1;
    return idx < 0 ? { score: 0, label: 'Too Short', color: '#ef4444' } : { score, ...levels[idx] };
}

function PasswordStrengthBar({ password }) {
    const strength = getPasswordStrength(password);
    if (!password) return null;
    return React.createElement('div', { style: { marginTop: '0.4rem' } },
        React.createElement('div', { style: { display: 'flex', gap: '3px', marginBottom: '0.25rem' } },
            [1,2,3,4,5].map(i =>
                React.createElement('div', {
                    key: i,
                    style: {
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= strength.score ? strength.color : 'var(--border-color)',
                        transition: 'background 0.3s ease'
                    }
                })
            )
        ),
        React.createElement('div', {
            style: { fontSize: '0.75rem', color: strength.color, fontWeight: 600 }
        }, strength.label)
    );
}

// ═══════════════════════════════════════════════════════
// SECURITY CONSTANTS
// ═══════════════════════════════════════════════════════
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_WARNING_MS = 30 * 1000; // warn 30s before timeout

// Helper: create React icon components from lucide UMD data
// lucide exports icons as arrays of [tag, attrs] child tuples
function makeLucideIcon(name) {
    return function LucideIcon({ size = 24, color = 'currentColor', style, className, ...props }) {
        const iconChildren = lucide[name];
        if (!iconChildren) return null;
        const children = iconChildren.map(([childTag, childAttrs], i) =>
            React.createElement(childTag, { key: i, ...childAttrs })
        );
        return React.createElement('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: size, height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style },
            className,
            ...props
        }, ...children);
    };
}

const LayoutDashboard = makeLucideIcon('LayoutDashboard');
const MessageSquare  = makeLucideIcon('MessageSquare');
const FolderTree     = makeLucideIcon('FolderTree');
const ShieldAlert    = makeLucideIcon('ShieldAlert');
const Sun            = makeLucideIcon('Sun');
const Moon           = makeLucideIcon('Moon');
const Phone          = makeLucideIcon('Phone');
const Video          = makeLucideIcon('Video');
const Paperclip      = makeLucideIcon('Paperclip');
const Send           = makeLucideIcon('Send');
const Trash2         = makeLucideIcon('Trash2');
const Settings       = makeLucideIcon('Settings');
const FileText       = makeLucideIcon('FileText');
const User           = makeLucideIcon('User');
const Shield         = makeLucideIcon('Shield');
const LogOut         = makeLucideIcon('LogOut');
const Plus           = makeLucideIcon('Plus');
const Mic            = makeLucideIcon('Mic');
const MicOff         = makeLucideIcon('MicOff');
const Camera         = makeLucideIcon('Camera');
const CameraOff      = makeLucideIcon('CameraOff');
const MonitorUp      = makeLucideIcon('MonitorUp');
const PhoneOff       = makeLucideIcon('PhoneOff');
const Search         = makeLucideIcon('Search');
const Lock           = makeLucideIcon('Lock');
const Info           = makeLucideIcon('Info');
const CheckCircle    = makeLucideIcon('CheckCircle');
const Clock          = makeLucideIcon('Clock');
const Download       = makeLucideIcon('Download');

const UserPlus     = makeLucideIcon('UserPlus');
const Mail         = makeLucideIcon('Mail');
const Eye          = makeLucideIcon('Eye');
const EyeOff       = makeLucideIcon('EyeOff');
const KeyRound     = makeLucideIcon('KeyRound');
const ChevronDown  = makeLucideIcon('ChevronDown');
const BadgeCheck   = makeLucideIcon('BadgeCheck');
const ScanFace     = makeLucideIcon('ScanFace');
const Languages    = makeLucideIcon('Languages');
const Pin          = makeLucideIcon('Pin');
const CheckCheck   = makeLucideIcon('CheckCheck');
const Smile        = makeLucideIcon('Smile');
const Bot          = makeLucideIcon('Bot');
const Reply        = makeLucideIcon('Reply');
const MoreVertical = makeLucideIcon('MoreVertical');

const filterOptions = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Present Day', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Quarterly', value: 'Quarterly' },
    { label: 'Yearly', value: 'Yearly' }
];

const FilterDropdown = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{position: 'relative', display: 'inline-block'}}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    cursor: 'pointer',
                    padding: '0.4rem',
                    borderRadius: '50%',
                    background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                }}
            >
                <MoreVertical size={20} color="var(--text-secondary)" />
            </div>
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    zIndex: 50,
                    minWidth: '150px',
                    overflow: 'hidden'
                }}>
                    {options.map(opt => (
                        <div 
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '0.6rem 1rem',
                                cursor: 'pointer',
                                background: value === opt.value ? 'rgba(255,255,255,0.05)' : 'transparent',
                                color: value === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                                fontWeight: value === opt.value ? 600 : 400,
                                transition: 'background 0.2s, color 0.2s',
                                fontSize: '0.9rem'
                            }}
                            onMouseEnter={e => {
                                if (value !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }}
                            onMouseLeave={e => {
                                if (value !== opt.value) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const X            = makeLucideIcon('X');
const Sparkles     = makeLucideIcon('Sparkles');
const UserCircle2  = makeLucideIcon('UserCircle2');
const Menu         = makeLucideIcon('Menu');
const Database     = makeLucideIcon('Database');
const ListChecks   = makeLucideIcon('ListChecks');
const Users        = makeLucideIcon('Users');
const MessageSquarePlus = makeLucideIcon('MessageSquarePlus');

const CameraCapture = ({ onCapture, onCancel, mode = 'register' }) => {
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const thumbRef = React.useRef(null);
    const isMounted = React.useRef(true);
    const [stream, setStream] = React.useState(null);
    const [errorMsg, setErrorMsg] = React.useState('');
    const [scanState, setScanState] = React.useState('idle');
    const [statusText, setStatusText] = React.useState('');

    React.useEffect(() => {
        isMounted.current = true;
        let activeStream = null;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } } })
            .then(s => {
                activeStream = s;
                setStream(s);
                if (videoRef.current) videoRef.current.srcObject = s;
            })
            .catch(err => {
                console.error("Camera access denied", err);
                setErrorMsg("Camera access denied. Please allow camera permissions.");
            });
        return () => { 
            isMounted.current = false;
            if (activeStream) activeStream.getTracks().forEach(t => t.stop()); 
        };
    }, []);

    // ============================================================
    //  BIOMETRIC FINGERPRINT ENGINE v3 — Pixel-Level RGB Identity
    // ============================================================
    // Instead of averaging pixels into grids (which loses critical detail),
    // we downscale the face to 48×48 and store EVERY pixel's R, G, B values.
    // This gives us 48×48×3 = 6,912 identity values per face.
    // Two different people produce vastly different 6912-dim vectors.
    
    const THUMB_SIZE = 48; // 48x48 thumbnail for fingerprinting
    
    const extractFingerprint = (ctx, canvas) => {
        const w = canvas.width, h = canvas.height;
        const fullData = ctx.getImageData(0, 0, w, h).data;
        
        // === Quality Gate 1: Check for blank/black/overexposed ===
        let totalLum = 0;
        const pixCount = w * h;
        const lumArr = new Float32Array(pixCount);
        for (let i = 0; i < pixCount; i++) {
            const idx = i * 4;
            const lum = 0.299 * fullData[idx] + 0.587 * fullData[idx+1] + 0.114 * fullData[idx+2];
            lumArr[i] = lum;
            totalLum += lum;
        }
        const avgLum = totalLum / pixCount;
        
        if (avgLum < 20) return { valid: false, reason: 'Screen is too dark or camera is covered.' };
        if (avgLum > 248) return { valid: false, reason: 'Image is overexposed (too bright).' };
        
        // Variance check
        let varSum = 0;
        for (let i = 0; i < pixCount; i++) varSum += (lumArr[i] - avgLum) ** 2;
        const variance = varSum / pixCount;
        if (variance < 350) return { valid: false, reason: 'No face detected — image is blank/uniform.' };
        
        // === Quality Gate 2: Edge density (face must have features) ===
        let edgeCount = 0, edgeTotal = 0;
        for (let y = 1; y < h - 1; y += 3) {
            for (let x = 1; x < w - 1; x += 3) {
                const c = lumArr[y * w + x];
                const dx = lumArr[y * w + x + 1] - lumArr[y * w + x - 1];
                const dy = lumArr[(y + 1) * w + x] - lumArr[(y - 1) * w + x];
                const mag = Math.sqrt(dx * dx + dy * dy);
                if (mag > 15) edgeCount++;
                edgeTotal++;
            }
        }
        const edgeDensity = edgeCount / edgeTotal;
        if (edgeDensity < 0.08) return { valid: false, reason: 'No facial features detected.' };
        
        // === Create 48×48 RGB Thumbnail Fingerprint ===
        // Use a hidden canvas to downscale properly with browser's built-in anti-aliasing
        if (!thumbRef.current) {
            thumbRef.current = document.createElement('canvas');
        }
        const tc = thumbRef.current;
        tc.width = THUMB_SIZE;
        tc.height = THUMB_SIZE;
        const tctx = tc.getContext('2d');
        tctx.drawImage(canvas, 0, 0, THUMB_SIZE, THUMB_SIZE);
        const thumbData = tctx.getImageData(0, 0, THUMB_SIZE, THUMB_SIZE).data;
        
        // Extract separate R, G, B channels as normalized 0-1 arrays
        const n = THUMB_SIZE * THUMB_SIZE;
        const rChannel = new Float32Array(n);
        const gChannel = new Float32Array(n);
        const bChannel = new Float32Array(n);
        
        for (let i = 0; i < n; i++) {
            const idx = i * 4;
            rChannel[i] = thumbData[idx] / 255;
            gChannel[i] = thumbData[idx + 1] / 255;
            bChannel[i] = thumbData[idx + 2] / 255;
        }
        
        return {
            valid: true,
            metrics: {
                brightness: avgLum,
                variance,
                edgeDensity,
                rChannel: Array.from(rChannel),  // 2304 values
                gChannel: Array.from(gChannel),  // 2304 values
                bChannel: Array.from(bChannel),  // 2304 values (total: 6912)
            }
        };
    };
    
    // ============================================================
    //  IDENTITY COMPARISON ENGINE — Per-Channel Cosine Similarity
    // ============================================================
    // Compares two 6912-dimensional fingerprints.
    // Cosine similarity on 2304-dim R/G/B channels independently.
    // ALL THREE channels must match above threshold — an impostor
    // cannot simultaneously fake red, green, AND blue pixel patterns.
    
    const compareFaces = (registered, captured) => {
        if (!registered || !captured) return { match: false, score: 0, details: 'Missing biometric data.' };
        
        // Handle legacy single-object biometric profiles and new multi-angle arrays
        const regProfiles = Array.isArray(registered) ? registered : [registered];
        
        // Cosine similarity: dot(a,b) / (|a| * |b|)
        const cosineSim = (a, b) => {
            let dot = 0, magA = 0, magB = 0;
            for (let i = 0; i < a.length; i++) {
                dot += a[i] * b[i];
                magA += a[i] * a[i];
                magB += b[i] * b[i];
            }
            const denom = Math.sqrt(magA) * Math.sqrt(magB);
            return denom === 0 ? 0 : dot / denom;
        };
        
        // Mean Absolute Error per pixel
        const mae = (a, b) => {
            let sum = 0;
            for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
            return sum / a.length;
        };
        
        const CHANNEL_THRESHOLD = 0.88; // Strict: same person re-scanned is typically >0.93
        const MAE_THRESHOLD = 0.12;     // Strict: same person is typically <0.07

        let bestScore = 0;
        let bestDetails = 'No matching profile found.';
        let bestScores = null;
        
        for (let i = 0; i < regProfiles.length; i++) {
            const reg = regProfiles[i];
            if (!reg.rChannel || !captured.rChannel) continue;
            
            const rSim = cosineSim(reg.rChannel, captured.rChannel);
            const gSim = cosineSim(reg.gChannel, captured.gChannel);
            const bSim = cosineSim(reg.bChannel, captured.bChannel);
            
            const rMAE = mae(reg.rChannel, captured.rChannel);
            const gMAE = mae(reg.gChannel, captured.gChannel);
            const bMAE = mae(reg.bChannel, captured.bChannel);
            
            const avgSim = (rSim + gSim + bSim) / 3;
            const avgMAE = (rMAE + gMAE + bMAE) / 3;
            
            const match = rSim >= CHANNEL_THRESHOLD && gSim >= CHANNEL_THRESHOLD && bSim >= CHANNEL_THRESHOLD && avgMAE <= MAE_THRESHOLD;
            
            if (match) {
                console.log(`[FaceID] Match found on profile ${i+1}! avgSim:${avgSim.toFixed(3)} avgMAE:${avgMAE.toFixed(4)}`);
                return {
                    match: true,
                    score: avgSim,
                    details: 'Identity verified.',
                    scores: { rSim, gSim, bSim, rMAE, gMAE, bMAE, avgSim, avgMAE }
                };
            }
            
            if (avgSim > bestScore) {
                bestScore = avgSim;
                bestScores = { rSim, gSim, bSim, rMAE, gMAE, bMAE, avgSim, avgMAE };
                let failReasons = [];
                if (rSim < CHANNEL_THRESHOLD) failReasons.push(`Red mismatch (${(rSim*100).toFixed(0)}%)`);
                if (gSim < CHANNEL_THRESHOLD) failReasons.push(`Green mismatch (${(gSim*100).toFixed(0)}%)`);
                if (bSim < CHANNEL_THRESHOLD) failReasons.push(`Blue mismatch (${(bSim*100).toFixed(0)}%)`);
                if (avgMAE > MAE_THRESHOLD) failReasons.push(`Pixel diff (${(avgMAE*100).toFixed(1)}%)`);
                bestDetails = failReasons.join('; ');
            }
        }
        
        return {
            match: false,
            score: bestScore,
            details: bestDetails,
            scores: bestScores
        };
    };

    const handleCapture = () => {
        if (!canvasRef.current || !videoRef.current) return;
        const ctx = canvasRef.current.getContext('2d');

        if (mode === 'register') {
            setScanState('analyzing');
            let currentStep = 0;
            let currentMetrics = [];
            
            const regSequence = [
                { label: 'Center', prompt: 'Look straight at the camera...' },
                { label: 'Left', prompt: 'Slowly turn your head LEFT...' },
                { label: 'Right', prompt: 'Slowly turn your head RIGHT...' },
                { label: 'Up', prompt: 'Tilt your head slightly UP...' },
                { label: 'Down', prompt: 'Tilt your head slightly DOWN...' }
            ];

            const captureNext = () => {
                if (!isMounted.current) return;
                
                if (currentStep >= regSequence.length) {
                    setScanState('success');
                    setStatusText('Face Registered Successfully');
                    const dataUrl = canvasRef.current.toDataURL('image/jpeg');
                    setTimeout(() => {
                        if (isMounted.current) onCapture({ image: dataUrl, metrics: currentMetrics });
                    }, 800);
                    return;
                }
                
                setStatusText(regSequence[currentStep].prompt);
                
                setTimeout(() => {
                    if (!isMounted.current || !canvasRef.current || !videoRef.current) return;
                    ctx.drawImage(videoRef.current, 0, 0, 400, 400);
                    const result = extractFingerprint(ctx, canvasRef.current);
                    
                    if (result.valid) {
                        currentMetrics.push(result.metrics);
                        currentStep++;
                        captureNext();
                    } else {
                        setStatusText(`Retrying: ${result.reason}`);
                        setTimeout(() => {
                            if (isMounted.current) captureNext(); 
                        }, 1500);
                    }
                }, 2000);
            };
            
            captureNext();

        } else {
            // LOGIN mode: Single capture
            ctx.drawImage(videoRef.current, 0, 0, 400, 400);
            setScanState('analyzing');
            setStatusText('Scanning facial identity...');
            setTimeout(() => {
                if (!isMounted.current) return;
                setStatusText('Extracting biometric signature...');
                setTimeout(() => {
                    if (!isMounted.current || !canvasRef.current) return;
                    const result = extractFingerprint(ctx, canvasRef.current);
                    if (result.valid) {
                        setScanState('analyzing');
                        setStatusText('Comparing identity...');
                        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
                        setTimeout(() => {
                            if (isMounted.current) onCapture({ image: dataUrl, metrics: result.metrics, compareFn: compareFaces });
                        }, 400);
                    } else {
                        setScanState('failed');
                        setStatusText(result.reason);
                        setTimeout(() => { 
                            if (isMounted.current) { setScanState('idle'); setStatusText(''); } 
                        }, 3000);
                    }
                }, 500);
            }, 500);
        }
    };

    return (
        <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'center', background:'var(--bg-subtle)', padding:'1rem', borderRadius:'var(--radius)', marginTop: '0.5rem'}}>
            {errorMsg ? (
                <div style={{color:'var(--danger)', fontSize:'0.85rem', textAlign:'center'}}>{errorMsg}</div>
            ) : (
                <div style={{
                    position: 'relative', width:'200px', height:'200px', borderRadius:'50%', overflow:'hidden', backgroundColor:'var(--bg-color)', 
                    border: `3px solid ${scanState === 'failed' ? 'var(--danger)' : scanState === 'success' ? 'var(--success, #16a34a)' : scanState === 'analyzing' ? 'var(--accent)' : 'var(--border-color)'}`,
                    transition: 'border-color 0.3s ease'
                }}>
                    <video ref={videoRef} autoPlay playsInline style={{width:'100%', height:'100%', objectFit: 'cover'}} />
                    {scanState !== 'idle' && (
                        <div style={{
                            position:'absolute', top:0, left:0, width:'100%', height:'100%', 
                            background: scanState === 'failed' ? 'var(--danger-bg)' : scanState === 'success' ? 'var(--success)' : 'rgba(0, 0, 0, 0.5)',
                            display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'1rem', boxSizing:'border-box',
                            color: 'white', fontWeight:'bold', fontSize:'0.9rem', textShadow:'0 0 5px var(--bg-color)'
                        }}>
                            {statusText}
                        </div>
                    )}
                </div>
            )}
            <canvas ref={canvasRef} width="400" height="400" style={{display:'none'}} />
            <div style={{display:'flex', gap:'1rem', marginTop:'0.5rem'}}>
                <button type="button" className="sketch-button primary" onClick={handleCapture} disabled={!stream || scanState === 'analyzing' || scanState === 'success'}>
                    {mode === 'register' ? 'Capture Face' : 'Scan & Sign In'}
                </button>
                <button type="button" className="sketch-button" onClick={onCancel} disabled={scanState === 'analyzing' || scanState === 'success'}>Cancel</button>
            </div>
        </div>
    );
};
const SECURITY_QUESTION_OPTIONS = [
    'What is your vehicle number?',
    'What is your favourite colour?',
    'What is the name of your school?',
    'What is your mother\'s maiden name?',
    'What is the name of your first pet?',
    'What is the name of your hometown?',
    '-- Add your own question --'
];

// Mock Data
const generateINITIAL_FILES = () => {
    const teams = ['Alpha Team Group', 'Finance Group', 'Architecture Group'];
    const groupIds = ['g1', 'g2', 'g3'];
    const users = ['Alice (Employee)', 'Bob (Employee)', 'Charlie (Team Lead)', 'David (Employee)', 'Eve (Team Lead)'];
    
    const files = [
        { 
            id: 1, name: 'Project_Alpha_Blueprint.pdf', groupId: 'g1', owner: 'Alice (Employee)', date: '2026-08-10', size: '2.4 MB', hoursLogged: 12.5, lastModified: '2 hrs ago',
            teamName: 'Alpha Team Group', members: ['Bob (Employee)', 'David (Employee)'],
            history: [
                { user: 'Alice (Employee)', date: '2026-08-13', time: '10:30 AM', action: 'Modified section 2' },
                { user: 'Charlie (Team Lead)', date: '2026-08-11', time: '02:15 PM', action: 'Reviewed and commented' },
                { user: 'Alice (Employee)', date: '2026-08-10', time: '09:00 AM', action: 'Created file' }
            ]
        },
        { 
            id: 2, name: 'Q3_Financials_Draft.xlsx', groupId: 'g2', owner: 'Bob (Employee)', date: '2026-08-11', size: '1.1 MB', hoursLogged: 8.0, lastModified: '5 hrs ago',
            teamName: 'Finance Group', members: ['Charlie (Team Lead)'],
            history: [
                { user: 'Bob (Employee)', date: '2026-08-13', time: '07:30 AM', action: 'Updated Q3 metrics' },
                { user: 'Bob (Employee)', date: '2026-08-11', time: '11:45 AM', action: 'Created file' }
            ]
        },
        { 
            id: 3, name: 'System_Architecture.vsdx', groupId: 'g3', owner: 'Charlie (Team Lead)', date: '2026-08-12', size: '4.5 MB', hoursLogged: 22.0, lastModified: '1 day ago',
            teamName: 'Architecture Group', members: ['Eve (Team Lead)', 'Alice (Employee)'],
            history: [
                { user: 'Charlie (Team Lead)', date: '2026-08-12', time: '04:20 PM', action: 'Finalized diagrams' },
                { user: 'Eve (Team Lead)', date: '2026-08-12', time: '01:00 PM', action: 'Added security layer' }
            ]
        }
    ];

    for (let i = 4; i <= 500; i++) {
        const rGroup = Math.floor(Math.random() * 3);
        const rUser = Math.floor(Math.random() * 5);
        
        const memberCount = Math.floor(Math.random() * 3) + 1;
        const members = [];
        for (let j = 0; j < memberCount; j++) {
            const m = users[Math.floor(Math.random() * 5)];
            if (!members.includes(m) && m !== users[rUser]) members.push(m);
        }

        files.push({
            id: i,
            name: `Project_Data_${i}_${Math.random().toString(36).substring(7)}.docx`,
            groupId: groupIds[rGroup],
            owner: users[rUser],
            teamName: teams[rGroup],
            members: members.length > 0 ? members : ['David (Employee)'],
            date: `2026-08-${String(Math.floor(Math.random() * 14) + 1).padStart(2, '0')}`,
            size: `${(Math.random() * 10).toFixed(1)} MB`,
            hoursLogged: Math.floor(Math.random() * 50),
            lastModified: `${Math.floor(Math.random() * 24) + 1} hrs ago`,
            history: [
                { user: users[rUser], date: `2026-08-01`, time: '09:00 AM', action: 'Created project file' }
            ]
        });
    }
    return files;
};

const INITIAL_FILES = generateINITIAL_FILES();

const WORKSPACE_GROUPS = [
    { id: 'g1', name: 'Alpha Team Group', icon: 'FolderTree' },
    { id: 'g2', name: 'Finance Group', icon: 'FolderTree' },
    { id: 'g3', name: 'Architecture Group', icon: 'FolderTree' }
];

// Helper for random data
const genWeeklyData = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const apps = ['VS Code', 'Figma', 'Terminal', 'Chrome', 'Slack'];
    const files = ['app.jsx', 'Dashboard_Design.fig', 'server.py', 'index.css', 'Documentation'];
    const actions = ['Refactoring UI components', 'Updating mockups', 'Debugging endpoints', 'Reviewing PRs', 'Writing tests'];
    
    return days.map(day => {
        const numLogs = Math.floor(Math.random() * 3) + 2; // 2 to 4 logs
        const logs = [];
        let startHour = 9;
        for (let i = 0; i < numLogs; i++) {
            const endHour = startHour + Math.floor(Math.random() * 2) + 1;
            const app = apps[Math.floor(Math.random() * apps.length)];
            const file = files[Math.floor(Math.random() * files.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            logs.push({ 
                time: `${startHour}:00 - ${endHour}:00`, 
                app, 
                file, 
                action 
            });
            startHour = endHour + 1; // 1 hour break or gap
        }
        return {
            day,
            hours: logs.reduce((acc, l) => acc + parseInt(l.time.split('-')[1]) - parseInt(l.time.split('-')[0]), 0),
            logs
        };
    });
};

const genChartData = () => {
    const currentYear = new Date().getFullYear();
    return {
        'Daily': {
            labels: ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
            values: Array.from({length: 8}, () => Math.floor(Math.random() * 50) + 10)
        },
        'Weekly': {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: Array.from({length: 7}, () => Math.floor(Math.random() * 8) + 2)
        },
        'Monthly': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: Array.from({length: 4}, () => Math.floor(Math.random() * 30) + 15)
        },
        'Quarterly': {
            labels: ['Jan', 'Feb', 'Mar'],
            values: Array.from({length: 3}, () => Math.floor(Math.random() * 120) + 40)
        },
        'Yearly': {
            labels: [`${currentYear-4}`, `${currentYear-3}`, `${currentYear-2}`, `${currentYear-1}`, `${currentYear}`],
            values: Array.from({length: 5}, () => Math.floor(Math.random() * 1500) + 500)
        }
    };
};

const TEAM_DATA = [
    { id: 'emp_1', name: 'Alice', role: 'Employee', weeklyData: genWeeklyData(), chartData: genChartData() },
    { id: 'emp_2', name: 'Bob', role: 'Employee', weeklyData: genWeeklyData(), chartData: genChartData() },
    { id: 'emp_3', name: 'David', role: 'Employee', weeklyData: genWeeklyData(), chartData: genChartData() },
    { id: 'lead_1', name: 'Charlie', role: 'Team Lead', weeklyData: genWeeklyData(), chartData: genChartData() },
    { id: 'lead_2', name: 'Eve', role: 'Team Lead', weeklyData: genWeeklyData(), chartData: genChartData() },
    { id: 'team_1', name: 'Frontend Squad', role: 'Team', weeklyData: genWeeklyData(), chartData: genChartData() },
    { id: 'team_2', name: 'Backend Masters', role: 'Team', weeklyData: genWeeklyData(), chartData: genChartData() },
    { id: 'team_3', name: 'Design Crew', role: 'Team', weeklyData: genWeeklyData(), chartData: genChartData() },
];

const getFilteredHours = (chartData, filter) => {
    if (!chartData || !chartData[filter]) return 0;
    return chartData[filter].values.reduce((acc, val) => acc + val, 0);
};

const getAggregatedChartData = (role, filter) => {
    let members = TEAM_DATA;
    if (role) members = members.filter(m => m.role === role);
    if (members.length === 0) return null;
    const baseData = members[0].chartData[filter];
    const aggregatedValues = new Array(baseData.values.length).fill(0);
    members.forEach(member => {
        member.chartData[filter].values.forEach((v, i) => {
            aggregatedValues[i] += v;
        });
    });
    return { labels: baseData.labels, values: aggregatedValues };
};

const ProductivityBarChart = ({ dataset, filterLabel }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    if (!dataset) return null;
    const maxVal = Math.max(...dataset.values, 1);
    
    return (
        <div style={{
            background: 'var(--panel-bg)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '1rem',
            border: '1px solid var(--border-color)',
            position: 'relative'
        }}>
            {/* Y-axis labels and grid lines */}
            <div style={{position: 'absolute', top: '1.5rem', left: '1.5rem', bottom: '2rem', right: '1.5rem'}}>
                {[1, 0.75, 0.5, 0.25, 0].map(step => (
                    <div key={step} style={{position: 'absolute', top: `${(1-step)*100}%`, left: '40px', right: 0, borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex'}}>
                         <span style={{position: 'absolute', left: '-40px', fontSize: '12px', color: 'var(--text-secondary)', transform: 'translateY(-50%)'}}>
                            {Math.round(maxVal * step)}{filterLabel === 'Daily' ? 'm' : 'h'}
                         </span>
                    </div>
                ))}
            </div>

            {/* Bars container */}
            <div style={{
                display: 'flex', 
                alignItems: 'flex-end', 
                justifyContent: 'space-between', 
                height: '150px', 
                position: 'relative',
                zIndex: 2,
                marginLeft: '50px',
                marginRight: '10px',
                marginBottom: '0.5rem'
            }}>
                {dataset.values.map((val, i) => (
                    <div key={i} 
                         onMouseEnter={() => setHoveredIdx(i)}
                         onMouseLeave={() => setHoveredIdx(null)}
                         style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1, height: '100%', margin: '0 2px', position: 'relative', cursor: 'pointer'}}>
                        
                        {/* Custom Tooltip */}
                        <div style={{
                            position: 'absolute',
                            top: `${100 - (val/maxVal)*100}%`,
                            transform: `translateY(-150%) scale(${hoveredIdx === i ? 1 : 0.8})`,
                            background: 'var(--text-color)',
                            color: 'var(--bg-color)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            opacity: hoveredIdx === i ? 1 : 0,
                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            pointerEvents: 'none',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                            {val} {filterLabel === 'Daily' ? 'mins' : 'hours'}
                        </div>

                        {/* Bar */}
                        <div style={{
                            width: 'min(40px, 80%)',
                            height: `${(val / maxVal) * 100}%`,
                            background: 'var(--accent)',
                            borderRadius: '4px 4px 0 0',
                            opacity: hoveredIdx === i ? 1 : 0.8,
                            transform: `scaleY(${hoveredIdx === i ? 1.05 : 1})`,
                            transformOrigin: 'bottom',
                            boxShadow: hoveredIdx === i ? '0 0 15px rgba(37,99,235,0.5)' : 'none',
                            transition: 'all 0.2s ease-out'
                        }}></div>
                    </div>
                ))}
            </div>

            {/* X-axis labels */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                marginLeft: '50px',
                marginRight: '10px'
            }}>
                {dataset.labels.map((label, i) => (
                    <div key={i} style={{flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PREVIOUS_PROJECTS = [
    { 
        id: 101, name: 'Project_Zeta_Core_Logic.js', locked: true, 
        team: 'Zeta Team', lead: 'Sarah T.', manager: 'System Admin', members: 'Tom, Jerry, Spike'
    },
    { 
        id: 102, name: 'Archived_2025_Schema.sql', locked: true, 
        team: 'Database Team', lead: 'Mike R.', manager: 'System Admin', members: 'Anna, Elsa'
    }
];

const INITIAL_TASKS = [
    { id: 1, text: 'Review Q3 Financials Draft', status: 'Pending', date: new Date().toISOString() },
    { id: 2, text: 'Update Project Alpha Blueprints', status: 'Pending', date: new Date(Date.now() + 86400000).toISOString() },
    { id: 3, text: 'Schedule team sync for Friday', status: 'Completed', date: new Date(Date.now() - 86400000).toISOString() }
];

const INITIAL_MESSAGES = [
    { id: 1, sender: 'Alice', text: 'Hey team, I just uploaded the new blueprints.', time: '09:15 AM', type: 'other', file: 'Project_Alpha_Blueprint.pdf' },
    { id: 2, sender: 'System Admin', text: 'Thanks. Please ensure we check cross-team dependencies.', time: '09:20 AM', type: 'other', reactions: [{emoji: '👍', count: 2}, {emoji: '🚀', count: 1}] },
    { id: 3, sender: 'Bob', text: 'Will do! We should review them tomorrow.', time: '10:40 AM', type: 'self', quoted: {sender: 'System Admin', text: 'Thanks. Please ensure we check cross-team dependencies.'} },
    { id: 4, sender: 'Alice', text: 'Hey team, I just uploaded the new blueprints.', time: '10:42 AM', type: 'other' }
];

const INITIAL_AUDITS = [
    { id: 1, action: 'UPLOAD', user: 'Alice', detail: 'Uploaded Project_Alpha_Blueprint.pdf', time: '2026-08-10 14:22' },
];

const INITIAL_LEDGER = [
    { id: 1, granter: 'System Admin', grantee: 'Bob', file: 'Q3_Financials_Draft.xlsx', timeLimit: 'None', download: 'Enabled', modified: '2026-08-11 10:00' }
];

const HoverMindTree = ({ data }) => {
    if (!data || !data.project) return null;
    const { x, y, project } = data;
    
    // Position slightly offset from cursor so it doesn't block the element
    const style = {
        left: Math.min(x + 15, window.innerWidth - 300) + 'px', // Keep on screen
        top: y + 15 + 'px',
    };

    return (
        <div className="mind-tree-tooltip" style={style}>
            <div className="tree-root">
                Creator: {project.owner}
            </div>
            <div className="tree-branch-container">
                <div className="tree-stem"></div>
                <div className="tree-team">Team: {project.teamName || 'N/A'}</div>
                <div className="tree-stem"></div>
                <div className="tree-members-container">
                    {project.members && project.members.map((member, i) => (
                        <div key={i} className="tree-member">{member}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const App = () => {
    // Auth State
    const [loggedInUser, setLoggedInUser] = useState(() => {
        const saved = localStorage.getItem('agenticLoggedInUser');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        return null;
    });

    const [activityLogs, setActivityLogs] = useState(() => {
        const stored = localStorage.getItem('activityLogs_v3');
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
            localStorage.setItem('activityLogs_v3', JSON.stringify(updated));
            return updated;
        });
    };


    useEffect(() => {
        if (loggedInUser) {
            localStorage.setItem('agenticLoggedInUser', JSON.stringify(loggedInUser));
        } else {
            localStorage.removeItem('agenticLoggedInUser');
        }
    }, [loggedInUser]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showLoginPwd, setShowLoginPwd] = useState(false);
    const [showLoginCamera, setShowLoginCamera] = useState(false);
    const [faceIdFailed, setFaceIdFailed] = useState(false);

    // WORKSPACE NEW STATES
    // DASHBOARD PRODUCTIVITY DRILL-DOWN STATES
    const [employeeTimeFilter, setEmployeeTimeFilter] = useState('Weekly');
    const [leadTimeFilter, setLeadTimeFilter] = useState('Weekly');
    const [teamTimeFilter, setTeamTimeFilter] = useState('Weekly');
    const [productivityTimeFilter, setProductivityTimeFilter] = useState('Weekly');
    const [workspaceFilter, setWorkspaceFilter] = useState('All');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedWorkDay, setSelectedWorkDay] = useState(null);
    const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
    const [selectedEmployeeTimeFilter, setSelectedEmployeeTimeFilter] = useState('Weekly');
    
    const [fileSortBy, setFileSortBy] = useState('Recent');
    const [fileCategory, setFileCategory] = useState('All');
    const [fileSearch, setFileSearch] = useState('');
    const [showFileFilterMenu, setShowFileFilterMenu] = useState(false);
    const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);
    const [showLeadMenu, setShowLeadMenu] = useState(false);
    const [showProdMenu, setShowProdMenu] = useState(false);
    const [workspaceLevel, setWorkspaceLevel] = useState('groups'); // 'groups', 'files', 'tree'
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [deletedFiles, setDeletedFiles] = useState([]);
    const [isWorkspaceSearchExpanded, setIsWorkspaceSearchExpanded] = useState(false);
    const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');
    const [hoveredProject, setHoveredProject] = useState(null);

    // SECURITY LAYER 4: Login Attempt Lockout
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(null);
    const [lockoutRemaining, setLockoutRemaining] = useState(0);

    // SECURITY LAYER 5: Session Timeout
    const [sessionWarning, setSessionWarning] = useState(false);
    const lastActivityRef = useRef(Date.now());
    const sessionTimerRef = useRef(null);
    const warningTimerRef = useRef(null);

    // Registered users store (starts empty, everyone must sign up)
    const [registeredUsers, setRegisteredUsers] = useState(() => {
        const saved = localStorage.getItem('registeredUsers_v9');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                if (parsed && parsed.length > 0) return parsed;
            } catch (e) {}
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('registeredUsers_v9', JSON.stringify(registeredUsers));
    }, [registeredUsers]);

    // Hash the default admin password on first load
    useEffect(() => {
        const initPasswords = async () => {
            const updated = await Promise.all(registeredUsers.map(async u => {
                if (u._plainInit) {
                    const hashed = await hashPassword(u.password);
                    return { ...u, password: hashed, _plainInit: false };
                }
                return u;
            }));
            if (updated.some((u, i) => u.password !== registeredUsers[i].password)) {
                setRegisteredUsers(updated);
            }
        };
        initPasswords();
    }, []);

    // Lockout countdown timer
    useEffect(() => {
        if (!lockoutUntil) return;
        const interval = setInterval(() => {
            const remaining = Math.max(0, lockoutUntil - Date.now());
            setLockoutRemaining(remaining);
            if (remaining <= 0) {
                setLockoutUntil(null);
                setLoginAttempts(0);
                setLockoutRemaining(0);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [lockoutUntil]);

    // Session timeout: track activity and auto-logout
    const resetSessionTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setSessionWarning(false);
    }, []);

    useEffect(() => {
        if (!loggedInUser) return;

        // Track user activity
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
        const handleActivity = () => { resetSessionTimer(); };
        activityEvents.forEach(e => window.addEventListener(e, handleActivity));

        // Check session every 5 seconds
        const checkSession = setInterval(() => {
            const elapsed = Date.now() - lastActivityRef.current;
            if (elapsed >= SESSION_TIMEOUT_MS) {
                setSessionWarning(false);
                handleLogout();
                alert('⏱️ Session expired due to inactivity. Please login again.');
            } else if (elapsed >= SESSION_TIMEOUT_MS - SESSION_WARNING_MS) {
                setSessionWarning(true);
            } else {
                setSessionWarning(false);
            }
        }, 5000);

        return () => {
            activityEvents.forEach(e => window.removeEventListener(e, handleActivity));
            clearInterval(checkSession);
        };
    }, [loggedInUser]);

    // Register view state
    const [showRegister, setShowRegister] = useState(false);
    const [regEmployeeId, setRegEmployeeId] = useState('');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regRole, setRegRole] = useState('Employee');
    const [regJobTitle, setRegJobTitle] = useState('');
    const [regFaceIdEnabled, setRegFaceIdEnabled] = useState(false);
    const [regFaceData, setRegFaceData] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [showRegPwd, setShowRegPwd] = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtpInput, setEmailOtpInput] = useState('');
    const [emailOtpValue, setEmailOtpValue] = useState('');
    const [regStep, setRegStep] = useState(1); // 1 = form, 2 = success
    const [securityQs, setSecurityQs] = useState([
        { question: SECURITY_QUESTION_OPTIONS[0], custom: '', answer: '' },
        { question: SECURITY_QUESTION_OPTIONS[1], custom: '', answer: '' },
        { question: SECURITY_QUESTION_OPTIONS[2], custom: '', answer: '' },
    ]);

    // Forgot password state
    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmployeeId, setForgotEmployeeId] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotUser, setForgotUser] = useState(null);
    const [forgotAnswers, setForgotAnswers] = useState(['', '', '']);
    const [forgotNewPwd, setForgotNewPwd] = useState('');
    const [forgotShowPwd, setForgotShowPwd] = useState(false);
    const [forgotConfirmPwd, setForgotConfirmPwd] = useState('');
    const [forgotShowConfirm, setForgotShowConfirm] = useState(false);
    // Forgot OTP state
    const [forgotOtpSent, setForgotOtpSent] = useState(false);
    const [forgotOtpValue, setForgotOtpValue] = useState('');
    const [forgotOtpInput, setForgotOtpInput] = useState('');
    const [forgotOtpVerified, setForgotOtpVerified] = useState(false);
    // Final confirm OTP state (step 4)
    const [forgotFinalOtpSent, setForgotFinalOtpSent] = useState(false);
    const [forgotFinalOtpValue, setForgotFinalOtpValue] = useState('');
    const [forgotFinalOtpInput, setForgotFinalOtpInput] = useState('');
    const [forgotFinalOtpVerified, setForgotFinalOtpVerified] = useState(false);

    const updateSecQ = (idx, field, value) => {
        setSecurityQs(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
    };

    // Global States
    const [theme, setTheme] = useState('light');
    const [activeTab, setActiveTab] = useState('Dashboard');

    // Data States
    const [files, setFiles] = useState(INITIAL_FILES);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [expandedFileId, setExpandedFileId] = useState(null);
    const [audits, setAudits] = useState(INITIAL_AUDITS);
    const [ledger, setLedger] = useState(INITIAL_LEDGER);
    const [chatInput, setChatInput] = useState('');
    
    // UI Modals & Overlays
    const [activeCall, setActiveCall] = useState(null); // { type, isMuted, isCameraOff, isScreenSharing }
    const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
    const [filePickerTab, setFilePickerTab] = useState('Recent');
    const [fileSearchQuery, setFileSearchQuery] = useState('');
    const [pendingPermitReq, setPendingPermitReq] = useState(null); // Holds message info for Manager Approval Modal
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showSettingsCamera, setShowSettingsCamera] = useState(false);
    const [showFaceIdSettings, setShowFaceIdSettings] = useState(false);
    
    // Language Dropdown
    const availableLanguages = [
        { code: 'en', label: 'English - EN', flag: '🇬🇧' },
        { code: 'es', label: 'Spanish - ES', flag: '🇪🇸' },
        { code: 'fr', label: 'French - FR', flag: '🇫🇷' },
        { code: 'de', label: 'German - DE', flag: '🇩🇪' },
        { code: 'hi', label: 'Hindi - HI', flag: '🇮🇳' },
        { code: 'zh-CN', label: 'Chinese - ZH', flag: '🇨🇳' },
        { code: 'ar', label: 'Arabic - AR', flag: '🇸🇦' },
        { code: 'ru', label: 'Russian - RU', flag: '🇷🇺' }
    ];

    const getInitialLang = () => {
        const match = document.cookie.match(/googtrans=\/[^\/]+\/([a-zA-Z-]+)/);
        const code = match ? match[1] : 'en';
        return availableLanguages.find(l => l.code === code) || availableLanguages[0];
    };

    const [isLangOpen, setIsLangOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(getInitialLang());

    const handleLanguageChange = (lang) => {
        setSelectedLang(lang);
        setIsLangOpen(false);
        // Force Google Translate by setting cookie and reloading
        document.cookie = `googtrans=/en/${lang.code}; path=/;`;
        document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
        window.location.reload();
    };
    

    // --- CHAT UPGRADE STATES ---
    const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
    const [agenticSearchOpen, setAgenticSearchOpen] = useState(false);
    const [selectedMemberForGraph, setSelectedMemberForGraph] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [callType, setCallType] = useState('video');
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [mockSubtitle, setMockSubtitle] = useState('Connecting to Gemini 3.1 Pro...');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [agenticSearchQuery, setAgenticSearchQuery] = useState('');
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [showChatNewMenu, setShowChatNewMenu] = useState(false);
    const [showChatOptionsMenu, setShowChatOptionsMenu] = useState(false);
    const [chatFilter, setChatFilter] = useState('All');
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [taskSearch, setTaskSearch] = useState('');
    const [taskFilter, setTaskFilter] = useState('Daily');
    const [showTaskMenu, setShowTaskMenu] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [autoExtractTasks, setAutoExtractTasks] = useState(true);

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupMembers, setNewGroupMembers] = useState([]);
    const [chatGroups, setChatGroups] = useState([
        { id: 'general', type: 'group', name: 'General Team Chat', time: '10:42 AM', snippet: 'Alice: Hey team, I just uploaded the new blueprints.', unread: 3 }
    ]);
    const [activeConversation, setActiveConversation] = useState('general');
    const [replyingToMessage, setReplyingToMessage] = useState(null);
    const [showAiAssistantMenu, setShowAiAssistantMenu] = useState(false);
    const [aiAssistantSummary, setAiAssistantSummary] = useState(null);
    
    // Global Keyboard listener for Agentic Search (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setAgenticSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    
    // Contact & Support
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
    const [isSupportIconVisible, setIsSupportIconVisible] = useState(true);

    const [supportMessages, setSupportMessages] = useState([
        { text: "Hello! I am your Agentic Virtual Assistant. How can I help you today? You can ask me about what facilities we provide, or share feedback and complaints.", isBot: true }
    ]);
    const [supportInput, setSupportInput] = useState('');

    const handleSupportSend = (e) => {
        e.preventDefault();
        if (!supportInput.trim()) return;
        const newMsg = supportInput.trim();
        setSupportMessages(prev => [...prev, { text: newMsg, isBot: false }]);
        setSupportInput('');

        setTimeout(() => {
            let botReply = "I'm sorry, I didn't understand that. Could you please specify if you need facility information or want to register a complaint/feedback?";
            const lowerMsg = newMsg.toLowerCase();
            if (lowerMsg.includes('facility') || lowerMsg.includes('provide') || lowerMsg.includes('feature') || lowerMsg.includes('service')) {
                botReply = "We provide an Agentic Neuro system with secure audit logs, real-time file sharing, role-based access control, face ID login, and collaborative workspaces.";
            } else if (lowerMsg.includes('complaint') || lowerMsg.includes('feedback') || lowerMsg.includes('issue') || lowerMsg.includes('problem')) {
                botReply = "Thank you for sharing your feedback. I have recorded your complaint in our Agentic tracking system, and our support team will review it shortly. Is there anything else I can help with?";
            }
            setSupportMessages(prev => [...prev, { text: botReply, isBot: true }]);
        }, 800);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!username) return alert('Enter username.');
        
        const matchedUser = registeredUsers.find(u => u.employeeId.toLowerCase() === username.toLowerCase());
        
        if (matchedUser && matchedUser.faceIdEnabled && !faceIdFailed) {
            setShowLoginCamera(true);
            return; 
        }

        if (!password) return alert('Enter password.');

        // Check lockout
        if (lockoutUntil && Date.now() < lockoutUntil) {
            return alert(`🔒 Account locked. Please wait ${Math.ceil((lockoutUntil - Date.now()) / 1000)} seconds.`);
        }

        const hashedPwd = await hashPassword(password);
        const found = registeredUsers.find(
            u => (u.employeeId.toLowerCase() === username.toLowerCase()) && u.password === hashedPwd
        );
        if (found) {
            setLoginAttempts(0);
            setLockoutUntil(null);
            resetSessionTimer();
            setLoggedInUser({ name: found.name, username: found.employeeId, role: found.role });
            logActivity('LOGIN', found);
            // Audit login
            setAudits(prev => [{ id: Date.now(), action: 'LOGIN', user: found.name, detail: `${found.name} logged in successfully`, time: new Date().toLocaleString() }, ...prev]);
            if (found.role === 'Higher Authority') {
                setActiveTab('User Database');
            }
        } else {
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                const until = Date.now() + LOCKOUT_DURATION_MS;
                setLockoutUntil(until);
                alert(`🔒 Too many failed attempts (${MAX_LOGIN_ATTEMPTS}). Account locked for 30 seconds.`);
            } else {
                alert(`Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempt(s) remaining.`);
            }
        }
    };

    const handleSendOtp = () => {
        if (!regEmail || !/\S+@\S+\.\S+/.test(regEmail)) return alert('Enter a valid email address.');
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setEmailOtpValue(otp);
        setEmailOtpSent(true);
        alert(`📧 OTP sent to ${regEmail}\n\n[DEMO] Your OTP is: ${otp}`);
    };

    const handleVerifyOtp = () => {
        if (emailOtpInput === emailOtpValue) {
            setEmailVerified(true);
            alert('✅ Email verified successfully!');
        } else {
            alert('❌ Incorrect OTP. Please try again.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!regEmployeeId.trim()) return alert('Employee ID is required.');
        if (!regName.trim()) return alert('Full Name is required.');
        if (!regEmail.trim()) return alert('Email is required.');
        if (!emailVerified) return alert('Please verify your email first.');
        if (regPassword.length < 6) return alert('Password must be at least 6 characters.');
        if (getPasswordStrength(regPassword).score < 2) return alert('Password is too weak. Add uppercase, numbers, or special characters.');
        if (regPassword !== regConfirmPassword) return alert('Passwords do not match.');
        const anyBlank = securityQs.some(q => {
            const label = q.question === '-- Add your own question --' ? q.custom.trim() : q.question;
            return !label || !q.answer.trim();
        });
        if (anyBlank) return alert('Please fill all 3 security questions and answers.');
        const duplicate = registeredUsers.find(u => u.employeeId.toLowerCase() === regEmployeeId.toLowerCase());
        if (duplicate) return alert('Employee ID already registered. Please login.');
        const duplicateEmail = registeredUsers.find(u => u.email.toLowerCase() === regEmail.toLowerCase());
        if (duplicateEmail) return alert('Email already registered! It is recommended to use the "Forgot Password" option if you cannot log in.');
        const hashedPwd = await hashPassword(regPassword);
        const newUser = {
            employeeId: sanitizeInput(regEmployeeId.trim()),
            name: sanitizeInput(regName.trim()),
            email: regEmail.trim(),
            password: hashedPwd,
            role: regRole.trim().toLowerCase() === 'admin' ? 'Higher Authority' : (regRole.trim() || 'Employee'),
            designationStr: regRole.trim(),
            jobTitle: sanitizeInput(regJobTitle.trim()),
            faceIdEnabled: regFaceIdEnabled && !!regFaceData,
            faceData: regFaceData,
            securityQs
        };
        setRegisteredUsers(prev => [...prev, newUser]);
        logActivity('SIGNUP', newUser);
        setRegStep(2);
    };

    const resetRegister = () => {
        setShowRegister(false); setRegStep(1);
        setRegEmployeeId(''); setRegName(''); setRegEmail(''); setRegPassword(''); setRegConfirmPassword(''); setRegJobTitle('');
        setRegFaceIdEnabled(false); setRegFaceData(null); setShowCamera(false);
        setEmailVerified(false); setEmailOtpSent(false); setEmailOtpInput(''); setEmailOtpValue('');
        setSecurityQs([
            { question: SECURITY_QUESTION_OPTIONS[0], custom: '', answer: '' },
            { question: SECURITY_QUESTION_OPTIONS[1], custom: '', answer: '' },
            { question: SECURITY_QUESTION_OPTIONS[2], custom: '', answer: '' },
        ]);
    };

    const resetForgot = () => {
        setShowForgot(false); setForgotStep(1);
        setForgotEmployeeId(''); setForgotEmail(''); setForgotUser(null);
        setForgotAnswers(['', '', '']); setForgotNewPwd('');
        setForgotShowPwd(false); setForgotConfirmPwd(''); setForgotShowConfirm(false);
        setForgotOtpSent(false); setForgotOtpValue(''); setForgotOtpInput(''); setForgotOtpVerified(false);
        setForgotFinalOtpSent(false); setForgotFinalOtpValue(''); setForgotFinalOtpInput(''); setForgotFinalOtpVerified(false);
    };

    const handleForgotSendFinalOtp = () => {
        if (!forgotUser) return;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setForgotFinalOtpValue(otp);
        setForgotFinalOtpSent(true);
        setForgotFinalOtpVerified(false);
        setForgotFinalOtpInput('');
        alert(`📧 Confirmation OTP sent to ${forgotUser.email}\n\n[DEMO] Your OTP is: ${otp}`);
    };

    const handleForgotVerifyFinalOtp = () => {
        if (forgotFinalOtpInput === forgotFinalOtpValue) {
            setForgotFinalOtpVerified(true);
            alert('✅ OTP confirmed!');
        } else {
            alert('❌ Incorrect OTP. Please try again.');
        }
    };

    const handleForgotSendOtp = () => {
        if (!forgotUser) return;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setForgotOtpValue(otp);
        setForgotOtpSent(true);
        setForgotOtpVerified(false);
        setForgotOtpInput('');
        alert(`📧 OTP sent to ${forgotUser.email}\n\n[DEMO] Your OTP is: ${otp}`);
    };

    const handleForgotVerifyOtp = () => {
        if (forgotOtpInput === forgotOtpValue) {
            setForgotOtpVerified(true);
            alert('✅ Email verified successfully!');
        } else {
            alert('❌ Incorrect OTP. Please try again.');
        }
    };

    const handleForgotNext = async (e) => {
        e.preventDefault();
        if (forgotStep === 1) {
            // Find by Employee ID or Email
            const searchVal = forgotEmployeeId.trim().toLowerCase();
            const user = registeredUsers.find(u => 
                (u.employeeId && u.employeeId.toLowerCase() === searchVal) || 
                (u.email && u.email.toLowerCase() === searchVal)
            );
            if (!user) return alert('No account found with that Employee ID or Email.');
            if (!user.securityQs || user.securityQs.length !== 3) return alert('This user has no security questions set up.');
            setForgotUser(user);
            setForgotStep(2);
        } else if (forgotStep === 2) {
            // Email OTP must be verified before proceeding
            if (!forgotOtpVerified) return alert('Please verify your email with the OTP first.');
            setForgotStep(3);
        } else if (forgotStep === 3) {
            // Verify security answers (User only needs to answer 1 correctly)
            const correctCount = forgotUser.securityQs.filter((q, i) => {
                const ans = forgotAnswers[i].trim().toLowerCase();
                return ans && q.answer.toLowerCase() === ans;
            }).length;
            if (correctCount < 1) return alert('You must answer at least 1 security question correctly.');
            setForgotStep(4);
        } else if (forgotStep === 4) {
            if (forgotNewPwd.length < 6) return alert('Password must be at least 6 characters.');
            if (getPasswordStrength(forgotNewPwd).score < 2) return alert('Password is too weak. Add uppercase, numbers, or special characters.');
            if (forgotNewPwd !== forgotConfirmPwd) return alert('Passwords do not match.');
            if (!forgotFinalOtpVerified) return alert('Please verify the confirmation OTP sent to your email before resetting.');
            // Hash and update password
            const hashedPwd = await hashPassword(forgotNewPwd);
            setRegisteredUsers(prev => prev.map(u => u.employeeId === forgotUser.employeeId ? { ...u, password: hashedPwd } : u));
            alert('✅ Password reset successful! You can now login.');
            resetForgot();
        }
    };

    const handleLogout = () => {
        logActivity('LOGOUT', loggedInUser);
        setLoggedInUser(null);
        setUsername(''); setPassword(''); setActiveTab('Dashboard'); setShowLoginPwd(false);
        setSessionWarning(false);
        // Audit logout
        setAudits(prev => [{ id: Date.now(), action: 'LOGOUT', user: 'User', detail: 'User logged out', time: new Date().toLocaleString() }, ...prev]);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        
        const newMsg = {
            id: Date.now(), 
            sender: loggedInUser.name, 
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            type: 'self'
        };

        if (replyingToMessage) {
            newMsg.quoted = { sender: replyingToMessage.sender, text: replyingToMessage.text };
        }

        setMessages([...messages, newMsg]);
        setChatInput('');
        setReplyingToMessage(null);
    };

    // CALL LOGIC
    const startCall = (type) => {
        setActiveCall({ type, isMuted: false, isCameraOff: false, isScreenSharing: false });
    };

    const toggleCallState = (key) => {
        setActiveCall({ ...activeCall, [key]: !activeCall[key] });
    };

    // FILE PICKER & ACCESS REQUEST
    const handleRequestAccess = (file) => {
        // Send a system message simulating a request to manager
        const newMsg = {
            id: Date.now(),
            sender: 'System',
            text: `${loggedInUser.name} requested access to ${file.name}.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'system',
            permitRequest: { fileId: file.id, fileName: file.name, requestor: loggedInUser.name, status: 'pending' }
        };
        setMessages([...messages, newMsg]);
        setIsFilePickerOpen(false);
        alert(`Access request for ${file.name} sent to Manager! (Switch to Admin to approve)`);
    };

    // MANAGER APPROVAL
    const grantAccess = (req, config) => {
        // Update message status
        const updatedMessages = messages.map(m => {
            if (m.id === req.msgId) {
                return { ...m, text: `Access granted to ${req.requestor} for ${req.fileName}.`, permitRequest: { ...m.permitRequest, status: 'approved' }};
            }
            return m;
        });
        
        // Push file to chat
        updatedMessages.push({
            id: Date.now(),
            sender: 'System Admin',
            text: `Here is the requested file. (Time Limit: ${config.timeLimit}, Download: ${config.allowDownload ? 'Yes' : 'No'})`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'other',
            file: req.fileName
        });

        // Add to ledger
        setLedger([{
            id: Date.now(),
            granter: loggedInUser.name,
            grantee: req.requestor,
            file: req.fileName,
            timeLimit: config.timeLimit,
            download: config.allowDownload ? 'Enabled' : 'Disabled',
            modified: 'Just now'
        }, ...ledger]);

        setMessages(updatedMessages);
        setPendingPermitReq(null);
    };

    // -- VIEWS --
    if (!loggedInUser) {

        // ── REGISTRATION SUCCESS ──
        if (showRegister && regStep === 2) {
            return (
                <div className="login-container">
                    <div className="login-card sketch-border" style={{textAlign:'center',maxWidth:'440px'}}>
                        <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>🎉</div>
                        <h2 style={{color:'var(--accent)', fontFamily: 'var(--font-professional)', letterSpacing: '-0.5px'}}>Sign Up Successful!</h2>
                        <p style={{margin:'1rem 0',color:'var(--text-secondary)'}}>Welcome, <strong>{regName}</strong>! Your account has been created.</p>
                        <p style={{marginBottom:'1.5rem',color:'var(--text-secondary)',fontSize:'0.9rem'}}>You can now login with your Employee ID and password.</p>
                        <button className="sketch-button primary" style={{justifyContent:'center',width:'100%'}} onClick={resetRegister}>
                            <LogOut size={16}/> Go to Login
                        </button>
                    </div>
                </div>
            );
        }

        // ── REGISTRATION FORM ──
        if (showRegister) {
            return (
                <div className="login-container" style={{alignItems:'flex-start',overflowY:'auto',padding:'2rem 0'}}>
                    <div style={{position: 'absolute', top: '2rem', right: '2rem'}}>
                        <button type="button" className="sketch-button primary" onClick={toggleTheme} style={{display:'flex', alignItems:'center', justifyContent:'center', width:'40px', height:'40px', borderRadius:'50%', padding:0}}>
                            {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
                        </button>
                    </div>
                    <form className="login-card sketch-border" style={{maxWidth:'520px',width:'100%'}} onSubmit={handleRegister}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.5rem'}}>
                            <UserPlus size={28} color="var(--accent)"/>
                            <div>
                                <h2 style={{margin:0, fontFamily: 'var(--font-professional)', letterSpacing: '-0.5px'}}>Sign Up</h2>
                                <p style={{margin:0,fontSize:'0.85rem',color:'var(--text-secondary)'}}>Create your employee account</p>
                            </div>
                        </div>

                        {/* ── STEP INDICATOR ── */}
                        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
                            {['Personal Info','Security','Email Verify'].map((s,i) => (
                                <div key={i} style={{flex:1,textAlign:'center',fontSize:'0.75rem',padding:'0.35rem',borderRadius:'4px',background: i===0?'var(--accent)':'transparent',color:i===0?'white':'var(--text-secondary)',border:'1.5px dashed var(--border-color)'}}>{s}</div>
                            ))}
                        </div>

                        {/* ── PERSONAL INFO ── */}
                        <div style={{background:'transparent',border:'1.5px dashed var(--border-color)',borderRadius:'8px',padding:'1rem',marginBottom:'1rem'}}>
                            <div style={{fontWeight:700,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                <User size={16} color="var(--accent)"/> Personal Information
                            </div>
                            <div className="form-group">
                                <label>Employee ID <span style={{color:'var(--danger)'}}>*</span></label>
                                <input type="text" placeholder="e.g. EMP-001" value={regEmployeeId} onChange={e=>setRegEmployeeId(e.target.value)} required/>
                            </div>
                            <div className="form-group">
                                <label>Full Name <span style={{color:'var(--danger)'}}>*</span></label>
                                <input type="text" placeholder="Enter your full name" value={regName} onChange={e=>setRegName(e.target.value)} required/>
                            </div>
                            <div className="form-group">
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
                            </div>
                            <div className="form-group">
                                <label>Job Title {regRole !== 'Admin' && <span style={{color:'var(--danger)'}}>*</span>}</label>
                                <input type="text" placeholder={regRole === 'Admin' ? "e.g. System Admin (Optional)" : "e.g. Software Engineer"} value={regJobTitle} onChange={e=>setRegJobTitle(e.target.value)} required={regRole !== 'Admin'} style={{width:'100%',padding:'0.8rem 1rem',border:'1px solid var(--input-border)',borderRadius:'12px',background:'var(--input-bg)',color:'var(--text-primary)',fontFamily:'inherit',fontSize:'15px',transition:'all 0.2s ease'}}/>
                            </div>
                            <div className="form-group">
                                <label>Enroll Face ID (Optional)</label>
                                <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.5rem'}}>
                                    <input type="checkbox" checked={regFaceIdEnabled} onChange={e => {
                                        setRegFaceIdEnabled(e.target.checked);
                                        if (e.target.checked) setShowCamera(true);
                                        else { setShowCamera(false); setRegFaceData(null); }
                                    }} style={{width:'auto', margin:0, cursor:'pointer'}} id="regFaceIdCb" /> 
                                    <label htmlFor="regFaceIdCb" style={{fontSize:'0.9rem', margin:0, cursor:'pointer', display:'inline-block'}}>Enable Face ID for Login</label>
                                </div>
                                {showCamera && (
                                    <CameraCapture 
                                        onCapture={(data) => { setRegFaceData(data); setShowCamera(false); }}
                                        onCancel={() => { setShowCamera(false); setRegFaceIdEnabled(false); }}
                                    />
                                )}
                                {regFaceData && (
                                    <div style={{color:'var(--success, #16a34a)', fontSize:'0.85rem', marginTop:'0.5rem', display:'flex', alignItems:'center', gap:'0.25rem'}}>
                                        <CheckCircle size={14}/> Face enrolled successfully
                                        <button type="button" onClick={() => { setRegFaceData(null); setShowCamera(true); }} style={{background:'none', border:'none', cursor:'pointer', color:'var(--danger)', marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.8rem'}}>
                                            <Trash2 size={14}/> Delete &amp; Re-register
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="form-group" style={{position:'relative'}}>
                                <label>Password <span style={{color:'var(--danger)'}}>*</span></label>
                                <div style={{position:'relative'}}>
                                    <input type={showRegPwd?'text':'password'} placeholder="Min. 6 characters" value={regPassword} onChange={e=>setRegPassword(e.target.value)} style={{width: '100%', boxSizing: 'border-box', paddingRight:'2.5rem'}} required/>
                                    <button type="button" onClick={()=>setShowRegPwd(p=>!p)} style={{position:'absolute',right:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                                        {showRegPwd?<EyeOff size={16}/>:<Eye size={16}/>}
                                    </button>
                                </div>
                                <PasswordStrengthBar password={regPassword}/>
                            </div>
                            <div className="form-group" style={{position:'relative'}}>
                                <label>Confirm Password <span style={{color:'var(--danger)'}}>*</span></label>
                                <div style={{position:'relative'}}>
                                    <input type={showRegConfirm?'text':'password'} placeholder="Re-enter password" value={regConfirmPassword} onChange={e=>setRegConfirmPassword(e.target.value)} style={{width: '100%', boxSizing: 'border-box', paddingRight:'2.5rem'}} required/>
                                    <button type="button" onClick={()=>setShowRegConfirm(p=>!p)} style={{position:'absolute',right:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                                        {showRegConfirm?<EyeOff size={16}/>:<Eye size={16}/>}
                                    </button>
                                </div>
                                {regConfirmPassword && regPassword!==regConfirmPassword && <div style={{color:'var(--danger)',fontSize:'0.8rem',marginTop:'0.25rem'}}>⚠ Passwords do not match</div>}
                                {regConfirmPassword && regPassword===regConfirmPassword && regPassword && <div style={{color:'var(--success,#16a34a)',fontSize:'0.8rem',marginTop:'0.25rem'}}>✓ Passwords match</div>}
                            </div>
                        </div>

                        {/* ── SECURITY QUESTIONS ── */}
                        <div style={{background:'transparent',border:'1.5px dashed var(--border-color)',borderRadius:'8px',padding:'1rem',marginBottom:'1rem'}}>
                            <div style={{fontWeight:700,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                <KeyRound size={16} color="var(--accent)"/> Security Questions
                            </div>
                            {securityQs.map((sq, idx) => (
                                <div key={idx} style={{marginBottom:'1rem',paddingBottom:'1rem',borderBottom: idx<2?'1px dashed var(--border-color)':'none'}}>
                                    <div style={{fontSize:'0.8rem',fontWeight:600,color:'var(--text-secondary)',marginBottom:'0.4rem'}}>Question {idx+1}</div>
                                    <div className="form-group" style={{marginBottom:'0.5rem'}}>
                                        <select
                                            value={sq.question}
                                            onChange={e=>updateSecQ(idx,'question',e.target.value)}
                                            style={{width:'100%',padding:'0.6rem',border:'1.5px dashed var(--border-color)',borderRadius:'6px',background:'transparent',color:'var(--text-primary)',fontFamily:'inherit',fontSize:'0.9rem'}}
                                        >
                                            {SECURITY_QUESTION_OPTIONS.map(opt=>(<option key={opt} value={opt}>{opt}</option>))}
                                        </select>
                                    </div>
                                    {sq.question==='-- Add your own question --' && (
                                        <div className="form-group" style={{marginBottom:'0.5rem'}}>
                                            <input type="text" placeholder="Type your own security question..." value={sq.custom} onChange={e=>updateSecQ(idx,'custom',e.target.value)}/>
                                        </div>
                                    )}
                                    <div className="form-group" style={{marginBottom:0}}>
                                        <input type="text" placeholder="Your answer..." value={sq.answer} onChange={e=>updateSecQ(idx,'answer',e.target.value)}/>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── EMAIL VERIFICATION ── */}
                        <div style={{background:'transparent',border:'1.5px dashed var(--border-color)',borderRadius:'8px',padding:'1rem',marginBottom:'1.5rem'}}>
                            <div style={{fontWeight:700,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                <Mail size={16} color="var(--accent)"/> Email Verification
                                {emailVerified && <span style={{marginLeft:'auto',color:'var(--success,#16a34a)',display:'flex',alignItems:'center',gap:'0.25rem',fontSize:'0.85rem'}}><BadgeCheck size={16}/>Verified</span>}
                            </div>
                            <div className="form-group">
                                <label>Email Address <span style={{color:'var(--danger)'}}>*</span></label>
                                <div style={{display:'flex',gap:'0.5rem'}}>
                                    <input type="email" placeholder="you@company.com" value={regEmail} onChange={e=>{setRegEmail(e.target.value);setEmailVerified(false);setEmailOtpSent(false);}} style={{flex:1}} disabled={emailVerified}/>
                                    {!emailVerified && (
                                        <button type="button" className="sketch-button primary" onClick={handleSendOtp} style={{whiteSpace:'nowrap',fontSize:'0.82rem'}}>
                                            {emailOtpSent?'Resend OTP':'Send OTP'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {emailOtpSent && !emailVerified && (
                                <div className="form-group" style={{marginBottom:0}}>
                                    <label>Enter OTP</label>
                                    <div style={{display:'flex',gap:'0.5rem'}}>
                                        <input type="text" placeholder="6-digit OTP" maxLength={6} value={emailOtpInput} onChange={e=>setEmailOtpInput(e.target.value)} style={{flex:1,letterSpacing:'0.25rem',fontWeight:700}}/>
                                        <button type="button" className="sketch-button primary" onClick={handleVerifyOtp} style={{whiteSpace:'nowrap',fontSize:'0.82rem'}}>Verify</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="sketch-button primary" style={{justifyContent:'center',width:'100%',fontSize:'1rem',padding:'0.75rem'}}>
                            <UserPlus size={18}/> Create Account
                        </button>
                        <div style={{textAlign:'center',marginTop:'1rem',fontSize:'0.9rem',color:'var(--text-secondary)'}}>
                            Already have an account?{' '}
                            <span onClick={resetRegister} style={{color:'var(--accent)',cursor:'pointer',fontWeight:700,textDecoration:'underline'}}>Sign In</span>
                        </div>
                    </form>
                </div>
            );
        }

        // ── FORGOT PASSWORD FORM ──
        if (showForgot) {
            const forgotStepLabels = ['Employee ID', 'Verify Email', 'Security Q\'s', 'New Password'];
            return (
                <div className="login-container" style={{alignItems:'flex-start',overflowY:'auto',padding:'2rem 0'}}>
                    <div style={{position: 'absolute', top: '2rem', right: '2rem'}}>
                        <button type="button" className="sketch-button primary" onClick={toggleTheme} style={{display:'flex', alignItems:'center', justifyContent:'center', width:'40px', height:'40px', borderRadius:'50%', padding:0}}>
                            {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
                        </button>
                    </div>
                    <form className="login-card sketch-border" style={{maxWidth:'520px',width:'100%'}} onSubmit={handleForgotNext}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.5rem'}}>
                            <Lock size={28} color="var(--accent)"/>
                            <div>
                                <h2 style={{margin:0, fontFamily: 'var(--font-professional)', letterSpacing: '-0.5px'}}>Reset Password</h2>
                                <p style={{margin:0,fontSize:'0.85rem',color:'var(--text-secondary)'}}>Verify your identity to reset your password</p>
                            </div>
                        </div>

                        {/* ── STEP INDICATOR ── */}
                        <div style={{display:'flex',gap:'0.35rem',marginBottom:'1.5rem'}}>
                            {forgotStepLabels.map((s, i) => (
                                <div key={i} style={{
                                    flex:1, textAlign:'center', fontSize:'0.7rem', padding:'0.35rem 0.2rem', borderRadius:'4px',
                                    background: i < forgotStep ? 'var(--accent)' : 'transparent',
                                    color: i < forgotStep ? 'white' : 'var(--text-secondary)',
                                    border: '1.5px dashed var(--border-color)',
                                    fontWeight: i === forgotStep - 1 ? 700 : 400,
                                    transition: 'all 0.3s ease'
                                }}>{s}</div>
                            ))}
                        </div>

                        {/* ── STEP 1: EMPLOYEE ID OR EMAIL ── */}
                        {forgotStep === 1 && (
                            <div style={{background:'transparent',border:'1.5px dashed var(--border-color)',borderRadius:'8px',padding:'1rem',marginBottom:'1rem'}}>
                                <div style={{fontWeight:700,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <User size={16} color="var(--accent)"/> Find Your Account
                                </div>
                                <div className="form-group">
                                    <label>Employee ID or Email <span style={{color:'var(--danger)'}}>*</span></label>
                                    <input type="text" placeholder="e.g. EMP-001 or you@company.com" value={forgotEmployeeId} onChange={e=>setForgotEmployeeId(e.target.value)} required/>
                                </div>
                                <div style={{fontSize:'0.82rem',color:'var(--text-secondary)',marginTop:'0.5rem'}}>
                                    We'll look up your account using your Employee ID or Email.
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: EMAIL OTP VERIFICATION ── */}
                        {forgotStep === 2 && forgotUser && (
                            <div style={{background:'transparent',border:'1.5px dashed var(--border-color)',borderRadius:'8px',padding:'1rem',marginBottom:'1rem'}}>
                                <div style={{fontWeight:700,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <Mail size={16} color="var(--accent)"/> Email Verification
                                    {forgotOtpVerified && <span style={{marginLeft:'auto',color:'var(--success,#16a34a)',display:'flex',alignItems:'center',gap:'0.25rem',fontSize:'0.85rem'}}><BadgeCheck size={16}/>Verified</span>}
                                </div>
                                <div style={{fontSize:'0.88rem',color:'var(--text-secondary)',marginBottom:'0.75rem'}}>
                                    Account found: <strong>{forgotUser.name}</strong> — verifying via registered email.
                                </div>
                                <div className="form-group">
                                    <label>Send verification code to registered email</label>
                                    <div style={{display:'flex',gap:'0.5rem'}}>
                                        <input type="email" value={forgotUser.email} disabled style={{flex:1,opacity:0.7}}/>
                                        {!forgotOtpVerified && (
                                            <button type="button" className="sketch-button primary" onClick={handleForgotSendOtp} style={{whiteSpace:'nowrap',fontSize:'0.82rem'}}>
                                                {forgotOtpSent ? 'Resend OTP' : 'Send OTP'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {forgotOtpSent && !forgotOtpVerified && (
                                    <div className="form-group" style={{marginBottom:0}}>
                                        <label>Enter OTP</label>
                                        <div style={{display:'flex',gap:'0.5rem'}}>
                                            <input type="text" placeholder="6-digit OTP" maxLength={6} value={forgotOtpInput} onChange={e=>setForgotOtpInput(e.target.value)} style={{flex:1,letterSpacing:'0.25rem',fontWeight:700}}/>
                                            <button type="button" className="sketch-button primary" onClick={handleForgotVerifyOtp} style={{whiteSpace:'nowrap',fontSize:'0.82rem'}}>Verify</button>
                                        </div>
                                    </div>
                                )}
                                {forgotOtpVerified && (
                                    <div style={{marginTop:'0.75rem',padding:'0.6rem',background:'rgba(22,163,106,0.08)',border:'1.5px dashed var(--success,#16a34a)',borderRadius:'6px',color:'var(--success,#16a34a)',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                        <BadgeCheck size={16}/> Email verified! Click "Next" to answer security questions.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── STEP 3: SECURITY QUESTIONS ── */}
                        {forgotStep === 3 && forgotUser && (
                            <div style={{background:'transparent',border:'1.5px dashed var(--border-color)',borderRadius:'8px',padding:'1rem',marginBottom:'1rem'}}>
                                <div style={{fontWeight:700,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <KeyRound size={16} color="var(--accent)"/> Security Questions for {forgotUser.name} <span style={{fontWeight:400,fontSize:'0.85rem',color:'var(--text-secondary)'}}>(Answer at least 1)</span>
                                </div>
                                {forgotUser.securityQs.map((sq, idx) => (
                                    <div key={idx} className="form-group" style={{marginBottom:'1rem',paddingBottom: idx < 2 ? '1rem' : 0, borderBottom: idx < 2 ? '1px dashed var(--border-color)' : 'none'}}>
                                        <label style={{fontWeight:600}}>Q{idx+1}: {sq.question === '-- Add your own question --' ? sq.custom : sq.question}</label>
                                        <input type="text" placeholder="Enter your answer" value={forgotAnswers[idx]} onChange={e=>{
                                            const newAns = [...forgotAnswers];
                                            newAns[idx] = e.target.value;
                                            setForgotAnswers(newAns);
                                        }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── STEP 4: NEW PASSWORD + FINAL EMAIL OTP ── */}
                        {forgotStep === 4 && (
                            <React.Fragment>
                            <div style={{background:'transparent',border:'1.5px dashed var(--border-color)',borderRadius:'8px',padding:'1rem',marginBottom:'1rem'}}>
                                <div style={{fontWeight:700,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <Lock size={16} color="var(--accent)"/> Set New Password
                                </div>
                                <div className="form-group" style={{position:'relative'}}>
                                    <label>New Password <span style={{color:'var(--danger)'}}>*</span></label>
                                    <div style={{position:'relative'}}>
                                        <input type={forgotShowPwd?'text':'password'} placeholder="Min. 6 characters" value={forgotNewPwd} onChange={e=>setForgotNewPwd(e.target.value)} style={{width: '100%', boxSizing: 'border-box', paddingRight:'2.5rem'}} required/>
                                        <button type="button" onClick={()=>setForgotShowPwd(p=>!p)} style={{position:'absolute',right:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                                            {forgotShowPwd?<EyeOff size={16}/>:<Eye size={16}/>}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group" style={{position:'relative'}}>
                                    <label>Confirm New Password <span style={{color:'var(--danger)'}}>*</span></label>
                                    <div style={{position:'relative'}}>
                                        <input type={forgotShowConfirm?'text':'password'} placeholder="Re-enter new password" value={forgotConfirmPwd} onChange={e=>setForgotConfirmPwd(e.target.value)} style={{width: '100%', boxSizing: 'border-box', paddingRight:'2.5rem'}} required/>
                                        <button type="button" onClick={()=>setForgotShowConfirm(p=>!p)} style={{position:'absolute',right:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                                            {forgotShowConfirm?<EyeOff size={16}/>:<Eye size={16}/>}
                                        </button>
                                    </div>
                                    {forgotConfirmPwd && forgotNewPwd !== forgotConfirmPwd && <div style={{color:'var(--danger)',fontSize:'0.8rem',marginTop:'0.25rem'}}>⚠ Passwords do not match</div>}
                                    {forgotConfirmPwd && forgotNewPwd === forgotConfirmPwd && forgotNewPwd && <div style={{color:'var(--success,#16a34a)',fontSize:'0.8rem',marginTop:'0.25rem'}}>✓ Passwords match</div>}
                                </div>
                            </div>
                            <div style={{background:'transparent',border:'1.5px dashed var(--border-color)',borderRadius:'8px',padding:'1rem',marginBottom:'1rem'}}>
                                <div style={{fontWeight:700,marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <Mail size={16} color="var(--accent)"/> Confirm via Email OTP
                                    {forgotFinalOtpVerified && <span style={{marginLeft:'auto',color:'var(--success,#16a34a)',display:'flex',alignItems:'center',gap:'0.25rem',fontSize:'0.85rem'}}><BadgeCheck size={16}/>Confirmed</span>}
                                </div>
                                <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',marginBottom:'0.75rem'}}>
                                    Final step — confirm your identity with a code sent to <strong>{forgotUser && forgotUser.email}</strong>.
                                </div>
                                {!forgotFinalOtpVerified && (
                                    <div className="form-group" style={{marginBottom: forgotFinalOtpSent ? '0.75rem' : 0}}>
                                        <div style={{display:'flex',gap:'0.5rem'}}>
                                            <input type="email" value={forgotUser && forgotUser.email} disabled style={{flex:1,opacity:0.7}}/>
                                            <button type="button" className="sketch-button primary" onClick={handleForgotSendFinalOtp} style={{whiteSpace:'nowrap',fontSize:'0.82rem'}}>
                                                {forgotFinalOtpSent ? 'Resend OTP' : 'Send OTP'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {forgotFinalOtpSent && !forgotFinalOtpVerified && (
                                    <div className="form-group" style={{marginBottom:0}}>
                                        <label>Enter Confirmation OTP</label>
                                        <div style={{display:'flex',gap:'0.5rem'}}>
                                            <input type="text" placeholder="6-digit OTP" maxLength={6} value={forgotFinalOtpInput} onChange={e=>setForgotFinalOtpInput(e.target.value)} style={{flex:1,letterSpacing:'0.25rem',fontWeight:700}}/>
                                            <button type="button" className="sketch-button primary" onClick={handleForgotVerifyFinalOtp} style={{whiteSpace:'nowrap',fontSize:'0.82rem'}}>Confirm</button>
                                        </div>
                                    </div>
                                )}
                                {forgotFinalOtpVerified && (
                                    <div style={{padding:'0.6rem',background:'rgba(22,163,106,0.08)',border:'1.5px dashed var(--success,#16a34a)',borderRadius:'6px',color:'var(--success,#16a34a)',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                        <BadgeCheck size={16}/> Identity confirmed! Click "Reset Password" to finish.
                                    </div>
                                )}
                            </div>
                            </React.Fragment>
                        )}

                        <button type="submit" className="sketch-button primary" style={{justifyContent:'center',width:'100%',marginTop:'1.5rem'}}>
                            {forgotStep === 1 ? 'Find Account' : forgotStep === 2 ? 'Next' : forgotStep === 3 ? 'Verify Answers' : 'Reset Password'}
                        </button>
                        <div style={{textAlign:'center',marginTop:'1rem',fontSize:'0.9rem',color:'var(--text-secondary)'}}>
                            Remembered your password?{' '}
                            <span onClick={resetForgot} style={{color:'var(--accent)',cursor:'pointer',fontWeight:700,textDecoration:'underline'}}>Sign In</span>
                        </div>
                    </form>
                </div>
            );
        }

        // ── LOGIN FORM ──
        return (
            <div className="login-container">
                <div style={{position: 'absolute', top: '2rem', right: '2rem'}}>
                    <button type="button" className="sketch-button primary" onClick={toggleTheme} style={{display:'flex', alignItems:'center', justifyContent:'center', width:'40px', height:'40px', borderRadius:'50%', padding:0}}>
                        {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
                    </button>
                </div>
                <form className="login-card sketch-border" onSubmit={handleLogin}>
                    <h2 style={{fontFamily: 'var(--font-professional)', letterSpacing: '-0.5px', fontWeight: 800, marginBottom: '1.5rem'}}>Agentic Neuro</h2>

                    {/* Lockout Warning */}
                    {lockoutUntil && lockoutRemaining > 0 && (
                        <div style={{padding:'0.75rem',marginBottom:'1rem',background:'rgba(239,68,68,0.1)',border:'1.5px solid var(--danger)',borderRadius:'8px',color:'var(--danger)',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                            <Lock size={16}/>
                            <div>
                                <strong>Account Locked</strong>
                                <div>Too many failed attempts. Try again in <strong>{Math.ceil(lockoutRemaining / 1000)}s</strong></div>
                            </div>
                        </div>
                    )}

                    {/* Attempt Counter */}
                    {loginAttempts > 0 && !lockoutUntil && (
                        <div style={{padding:'0.5rem 0.75rem',marginBottom:'1rem',background:'rgba(234,179,8,0.1)',border:'1.5px dashed #eab308',borderRadius:'6px',color:'#eab308',fontSize:'0.82rem'}}>
                            {MAX_LOGIN_ATTEMPTS - loginAttempts} login attempt(s) remaining
                        </div>
                    )}

                    <div className="form-group">
                        <label>Employee ID</label>
                        <input type="text" placeholder="Enter your Employee ID" value={username} onChange={e => {
                            setUsername(e.target.value);
                            setFaceIdFailed(false);
                        }} />
                    </div>
                    <div className="form-group">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <label>Password</label>
                            <span onClick={()=>setShowForgot(true)} style={{fontSize:'0.85rem',color:'var(--accent)',cursor:'pointer',fontWeight:600}}>Forgot Password?</span>
                        </div>
                        <div style={{position:'relative'}}>
                            <input type={showLoginPwd?'text':'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%', boxSizing: 'border-box', paddingRight:'2.5rem'}} />
                            <button type="button" onClick={()=>setShowLoginPwd(p=>!p)} style={{position:'absolute',right:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                                {showLoginPwd?<EyeOff size={16}/>:<Eye size={16}/>}
                            </button>
                        </div>
                    </div>
                    <div style={{display:'flex', flexDirection: 'column', gap:'0.75rem', marginTop: '1rem'}}>
                        <button type="submit" className="sketch-button primary" style={{justifyContent: 'center', width: '100%', opacity: lockoutUntil && lockoutRemaining > 0 ? 0.5 : 1}} disabled={lockoutUntil && lockoutRemaining > 0}>
                            {lockoutUntil && lockoutRemaining > 0 ? `Locked (${Math.ceil(lockoutRemaining / 1000)}s)` : 'Login'}
                        </button>
                        {registeredUsers.find(u => u.employeeId.toLowerCase() === username.toLowerCase())?.faceIdEnabled && (
                            <button type="button" className="sketch-button" onClick={() => setShowLoginCamera(true)} style={{justifyContent: 'center', width: '100%'}} title="Scan Face to Sign In">
                                <Camera size={16}/> Scan Face to Sign In
                            </button>
                        )}
                    </div>
                    <div style={{textAlign:'center',marginTop:'1.25rem',padding:'1rem',border:'1.5px dashed var(--border-color)',borderRadius:'8px',background:'transparent'}}>
                        <div style={{fontSize:'0.85rem',color:'var(--text-secondary)',marginBottom:'0.75rem'}}>New to Agentic Neuro?</div>
                        <button type="button" className={`sketch-button ${theme === 'dark' ? 'primary' : ''}`} style={{justifyContent:'center',width:'100%',fontWeight:700}} onClick={()=>setShowRegister(true)}>
                            <UserPlus size={16}/> Sign Up
                        </button>
                    </div>
                </form>

                {/* LOGIN CAMERA MODAL */}
                {showLoginCamera && (
                    <div className="modal-overlay">
                        <div className="modal-content sketch-border" style={{maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <h3 style={{fontFamily:'var(--font-professional)', margin:'0 0 1rem 0'}}>Face ID Authentication</h3>
                            <CameraCapture 
                                mode="login"
                                onCapture={(scannedData) => {
                                    let foundUser = null;

                                    const targetUser = registeredUsers.find(u => u.employeeId.toLowerCase() === username.toLowerCase());
                                    
                                    if (targetUser && targetUser.faceIdEnabled && targetUser.faceData) {
                                        if (typeof targetUser.faceData === 'string') {
                                            console.warn(`Legacy Face ID format detected for user ${targetUser.employeeId}.`);
                                        } else {
                                            const registeredMetrics = targetUser.faceData.metrics;
                                            const currentMetrics = scannedData.metrics;
                                            
                                            if (scannedData.compareFn) {
                                                const result = scannedData.compareFn(registeredMetrics, currentMetrics);
                                                if (result.match) {
                                                    foundUser = targetUser;
                                                }
                                            }
                                        }
                                    }

                                    if (foundUser) {
                                        setShowLoginCamera(false);
                                        setLoggedInUser(foundUser);
                                        setUsername('');
                                        setPassword('');
                                        setFaceIdFailed(false);
                                        if (foundUser.role === 'Higher Authority') {
                                            setActiveTab('User Database');
                                        }
                                    } else {
                                        alert("Face ID rejected: Identity not recognized.\nPlease make sure your face is clearly visible or use your password to sign in.");
                                        setShowLoginCamera(false);
                                        setFaceIdFailed(true);
                                    }
                                }}
                                onCancel={() => {
                                    setShowLoginCamera(false);
                                    setFaceIdFailed(true);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const filteredProjects = PREVIOUS_PROJECTS.filter(p => p.name.toLowerCase().includes(fileSearchQuery.toLowerCase()));

    return (
        <div className="app-container">
            {/* ACTIVE CALL MODAL */}
            {activeCall && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '800px', backgroundColor: '#1a1a1a', border: 'none', color: 'white'}}>
                        <div className="modal-header" style={{borderBottomColor: '#333'}}>
                            Team {activeCall.type === 'video' ? 'Video' : 'Voice'} Call
                        </div>
                        <div className="modal-body">
                            <div className="active-call-grid">
                                <div className="call-participant">You {activeCall.isCameraOff ? '(Camera Off)' : '(Video Active)'}</div>
                                <div className="call-participant">Team Member</div>
                            </div>
                            {activeCall.isScreenSharing && <div style={{textAlign:'center', color:'#4dabf7', marginBottom:'1rem'}}>You are sharing your screen</div>}
                            <div className="call-controls">
                                <button className="control-btn sketch-button" onClick={() => toggleCallState('isMuted')} title={activeCall.isMuted ? "Unmute" : "Mute"}>
                                    {activeCall.isMuted ? <MicOff size={24} color="#ef4444"/> : <Mic size={24}/>}
                                </button>
                                {activeCall.type === 'video' && (
                                    <button className="control-btn sketch-button" onClick={() => toggleCallState('isCameraOff')} title={activeCall.isCameraOff ? "Turn On Camera" : "Turn Off Camera"}>
                                        {activeCall.isCameraOff ? <CameraOff size={24} color="#ef4444"/> : <Camera size={24}/>}
                                    </button>
                                )}
                                <button className="control-btn sketch-button" onClick={() => toggleCallState('isScreenSharing')} title={activeCall.isScreenSharing ? "Stop Sharing" : "Share Screen"}>
                                    <MonitorUp size={24} color={activeCall.isScreenSharing ? "#4dabf7" : "inherit"}/>
                                </button>
                                <button className="control-btn sketch-button danger" onClick={() => setActiveCall(null)} title="End Call">
                                    <PhoneOff size={24}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FILE PICKER MODAL */}
            {isFilePickerOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            Agentic Neuro Access
                            <button className="sketch-button" onClick={() => setIsFilePickerOpen(false)}>X</button>
                        </div>
                        <div className="modal-body">
                            <div className="search-bar" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                <Search size={18}/>
                                <input 
                                    type="text" placeholder="Search Agentic Neuro..." 
                                    style={{flex:1, border:'none', background:'transparent', outline:'none', color:'inherit'}}
                                    value={fileSearchQuery} onChange={e => setFileSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="file-picker-tabs">
                                <div className={`file-picker-tab ${filePickerTab === 'Recent' ? 'active' : ''}`} onClick={() => setFilePickerTab('Recent')}>Recent Files</div>
                                <div className={`file-picker-tab ${filePickerTab === 'Previous' ? 'active' : ''}`} onClick={() => setFilePickerTab('Previous')}>Previous Projects (Cross-Team)</div>
                            </div>
                            
                            {filePickerTab === 'Recent' && (
                                <div>
                                    {files.map(f => (
                                        <div key={f.id} className="file-list-item">
                                            <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><FileText size={16}/> {f.name}</div>
                                            <button className="sketch-button primary" onClick={() => {
                                                setMessages([...messages, { id: Date.now(), sender: 'You', type: 'self', text: 'Sent a file.', time: new Date().toLocaleTimeString(), file: f.name }]);
                                                setIsFilePickerOpen(false);
                                            }}>Attach</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {filePickerTab === 'Previous' && (
                                <div>
                                    {filteredProjects.map(f => (
                                        <div key={f.id} className="file-list-item">
                                            <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                {f.locked && <Lock size={16} color="var(--danger)"/>}
                                                {f.name}
                                                <div className="tooltip">
                                                    <Info size={16} className="file-info-icon"/>
                                                    <span className="tooltiptext">
                                                        <strong>{f.team}</strong><br/>
                                                        Lead: {f.lead}<br/>
                                                        Manager: {f.manager}<br/>
                                                        Members: {f.members}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="sketch-button" onClick={() => handleRequestAccess(f)}>
                                                Request Access
                                            </button>
                                        </div>
                                    ))}
                                    {filteredProjects.length === 0 && <div style={{textAlign:'center', padding:'1rem', color:'var(--text-secondary)'}}>No matches found.</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MANAGER APPROVAL MODAL */}
            {pendingPermitReq && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            Configure Access Permit
                            <button className="sketch-button" onClick={() => setPendingPermitReq(null)}>X</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Requestor:</strong> {pendingPermitReq.requestor}</p>
                            <p><strong>File:</strong> {pendingPermitReq.fileName}</p>
                            
                            <div style={{marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem'}}>
                                <div className="form-group">
                                    <label>Time Limitation</label>
                                    <select id="timeLimit" className="search-bar" style={{margin:0}}>
                                        <option value="No Limit">No Limit</option>
                                        <option value="24 Hours">24 Hours</option>
                                        <option value="7 Days">7 Days</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{flexDirection:'row', alignItems:'center'}}>
                                    <input type="checkbox" id="allowDownload" defaultChecked style={{width:'20px', height:'20px'}}/>
                                    <label htmlFor="allowDownload">Allow Download</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="sketch-button" onClick={() => setPendingPermitReq(null)}>Cancel</button>
                            <button className="sketch-button primary" onClick={() => {
                                grantAccess(pendingPermitReq, {
                                    timeLimit: document.getElementById('timeLimit').value,
                                    allowDownload: document.getElementById('allowDownload').checked
                                });
                            }}>Grant Access</button>
                        </div>
                    </div>
                </div>
            )}

            {/* USER PROFILE MODAL */}
            {isProfileOpen && (
                <div className="modal-overlay" onClick={() => setIsProfileOpen(false)}>
                    <div className="modal-content" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>
                            <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                                <div style={{fontWeight: 'bold', color: 'var(--accent)', display:'flex', alignItems:'center', gap:'0.5rem', paddingBottom:'0.25rem', borderBottom: '2px solid var(--accent)'}}>
                                    <User size={18}/> Profile Details
                                </div>
                            </div>
                            <button className="sketch-button" onClick={() => setIsProfileOpen(false)}>X</button>
                        </div>
                        <div className="modal-body" style={{paddingTop: '1rem'}}>
                            <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                                <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'var(--accent)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem auto', fontSize:'2rem', fontWeight:800}}>
                                    {loggedInUser.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 style={{margin:0, fontFamily:'var(--font-professional)', letterSpacing:'-0.5px'}}>{loggedInUser.name}</h2>
                                <p style={{margin:'0.25rem 0 0 0', color:'var(--text-secondary)'}}>{loggedInUser.role}</p>
                            </div>
                            
                            <div style={{background:'transparent', border:'1.5px dashed var(--border-color)', borderRadius:'8px', padding:'1rem', marginBottom:'1rem'}}>
                                <div style={{fontWeight:700, marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--accent)'}}>
                                    <FileText size={16}/> Employee Information
                                </div>
                                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', fontSize:'0.9rem'}}>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <span style={{color:'var(--text-secondary)'}}>Employee ID:</span>
                                        <strong>{loggedInUser.employeeId || 'EMP-001'}</strong>
                                    </div>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <span style={{color:'var(--text-secondary)'}}>Job Title:</span>
                                        <strong>{loggedInUser.jobTitle || 'Not specified'}</strong>
                                    </div>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <span style={{color:'var(--text-secondary)'}}>Status:</span>
                                        <strong style={{color:'var(--success,#16a34a)'}}>Active</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{background:'transparent', border:'1.5px dashed var(--border-color)', borderRadius:'8px', padding:'1rem', marginBottom:'1rem'}}>
                                <div style={{fontWeight:700, marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--accent)'}}>
                                    <BadgeCheck size={16}/> Recruitment & Company Details
                                </div>
                                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', fontSize:'0.9rem'}}>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <span style={{color:'var(--text-secondary)'}}>Company:</span>
                                        <strong>Agentic Neuro</strong>
                                    </div>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <span style={{color:'var(--text-secondary)'}}>Date of Joining:</span>
                                        <strong>August 10, 2026</strong>
                                    </div>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <span style={{color:'var(--text-secondary)'}}>Hired By (Employer):</span>
                                        <strong>System Admin (Higher Authority)</strong>
                                    </div>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <span style={{color:'var(--text-secondary)'}}>Recruitment Channel:</span>
                                        <strong>Direct Referral</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)'}}>
                                <button className="sketch-button danger" onClick={handleLogout} style={{width: '100%', justifyContent: 'center', fontWeight: 'bold'}}>
                                    <LogOut size={16}/> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SETTINGS MODAL */}
            {isSettingsOpen && (
                <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
                    <div className="modal-content" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>
                            <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                                <div style={{fontWeight: 'bold', color: 'var(--accent)', display:'flex', alignItems:'center', gap:'0.5rem', paddingBottom:'0.25rem', borderBottom: '2px solid var(--accent)'}}>
                                    <Lock size={18}/> Settings
                                </div>
                            </div>
                            <button className="sketch-button" onClick={() => setIsSettingsOpen(false)}>X</button>
                        </div>
                        <div className="modal-body" style={{paddingTop: '1rem'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', paddingBottom:'1.5rem', borderBottom:'1px dashed var(--border-color)'}}>
                                <div>
                                    <strong style={{display:'block', marginBottom:'0.25rem'}}>Theme</strong>
                                    <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>Switch between Light and Dark mode</span>
                                </div>
                                <button className="sketch-button primary" onClick={toggleTheme} style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                                    {theme === 'light' ? <Moon size={16}/> : <Sun size={16}/>}
                                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                </button>
                            </div>

                            {/* Face ID Settings Section */}
                            <div style={{border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden'}}>
                                <div 
                                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--panel-bg)', cursor: 'pointer'}}
                                    onClick={() => setShowFaceIdSettings(!showFaceIdSettings)}
                                >
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                        <div style={{background: 'var(--accent)', color: 'white', padding: '0.4rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <ScanFace size={18} />
                                        </div>
                                        <div>
                                            <strong style={{display: 'block'}}>Face ID</strong>
                                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Manage facial recognition identity</span>
                                        </div>
                                    </div>
                                    <ChevronDown size={18} style={{transform: showFaceIdSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-secondary)'}} />
                                </div>
                                
                                {showFaceIdSettings && (
                                    <div style={{padding: '1rem', borderTop: '1px solid var(--border-color)'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <div>
                                                <strong style={{display:'block', marginBottom:'0.25rem'}}>Face ID Lock</strong>
                                                <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>Turn on or off the Face ID feature</span>
                                            </div>
                                            <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                <label style={{display:'inline-flex', alignItems:'center', cursor:'pointer', margin:0, background: 'var(--panel-bg)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                                    <label className="toggle-switch">
                                                        <input type="checkbox" checked={loggedInUser.faceIdEnabled || false} onChange={(e) => {
                                                            const enabled = e.target.checked;
                                                            if(enabled) {
                                                                setShowSettingsCamera(true);
                                                            } else {
                                                                const updatedUsers = registeredUsers.map(u => u.employeeId === loggedInUser.employeeId ? {...u, faceIdEnabled: false, faceData: null} : u);
                                                                setRegisteredUsers(updatedUsers);
                                                                setLoggedInUser({...loggedInUser, faceIdEnabled: false, faceData: null});
                                                            }
                                                        }} />
                                                        <span className="toggle-slider"></span>
                                                    </label>
                                                    <span style={{fontWeight:'bold', color: loggedInUser.faceIdEnabled ? 'var(--success, #16a34a)' : 'var(--text-secondary)'}}>
                                                        {loggedInUser.faceIdEnabled ? 'ON' : 'OFF'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {loggedInUser.faceIdEnabled && !showSettingsCamera && (
                                            <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.1)'}}>
                                                <strong style={{fontSize: '0.9rem', marginBottom: '0.25rem'}}>Identity Management</strong>
                                                <button className="sketch-button" onClick={(e) => { e.preventDefault(); setShowSettingsCamera(true); }} style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent)', color: 'var(--accent)'}}>
                                                    Re-register Facial Identity
                                                </button>
                                                <button className="sketch-button danger" onClick={(e) => {
                                                    e.preventDefault();
                                                    const updatedUsers = registeredUsers.map(u => u.employeeId === loggedInUser.employeeId ? {...u, faceIdEnabled: false, faceData: null} : u);
                                                    setRegisteredUsers(updatedUsers);
                                                    setLoggedInUser({...loggedInUser, faceIdEnabled: false, faceData: null});
                                                }} style={{width: '100%', justifyContent: 'center'}}>
                                                    Delete Facial Identity
                                                </button>
                                            </div>
                                        )}

                                        {showSettingsCamera && (
                                            <div style={{marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                                                <h4 style={{margin: '0 0 1rem 0', fontFamily: 'var(--font-professional)'}}>Register Face ID</h4>
                                                <CameraCapture 
                                                    onCapture={(data) => { 
                                                        const updatedUsers = registeredUsers.map(u => u.employeeId === loggedInUser.employeeId ? {...u, faceIdEnabled: true, faceData: data} : u);
                                                        setRegisteredUsers(updatedUsers);
                                                        setLoggedInUser({...loggedInUser, faceIdEnabled: true, faceData: data});
                                                        setShowSettingsCamera(false); 
                                                    }}
                                                    onCancel={() => { 
                                                        setShowSettingsCamera(false); 
                                                        if (!loggedInUser.faceData) {
                                                            const updatedUsers = registeredUsers.map(u => u.employeeId === loggedInUser.employeeId ? {...u, faceIdEnabled: false, faceData: null} : u);
                                                            setRegisteredUsers(updatedUsers);
                                                            setLoggedInUser({...loggedInUser, faceIdEnabled: false, faceData: null});
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HIGHER AUTHORITY LEDGER MODAL */}
            {isLedgerOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '700px'}}>
                        <div className="modal-header" style={{color: 'var(--danger)'}}>
                            <ShieldAlert size={24} style={{marginRight: '0.5rem'}}/> Higher Authority Ledger
                            <button className="sketch-button" onClick={() => setIsLedgerOpen(false)}>X</button>
                        </div>
                        <div className="modal-body">
                            <p style={{marginBottom: '1rem'}}>Audit trail of cross-team permissions granted and recent file modifications.</p>
                            {ledger.map(entry => (
                                <div key={entry.id} className="ledger-entry">
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                                        <strong>Granted to: {entry.grantee}</strong>
                                        <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}><Clock size={12}/> Last Modified: {entry.modified}</span>
                                    </div>
                                    <div><strong>File:</strong> <FileText size={14}/> {entry.file}</div>
                                    <div style={{fontSize:'0.9rem', marginTop:'0.5rem', display:'flex', gap:'1rem'}}>
                                        <span><strong>By:</strong> {entry.granter}</span>
                                        <span><strong>Limit:</strong> {entry.timeLimit}</span>
                                        <span><strong>Download:</strong> {entry.download}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN APP LAYOUT */}
            <div className="app-shell">
                {/* ── TOP BAR ROW 1: Brand + Language + Contact + Profile ── */}
                <header className="topbar-brand sketch-border">
                    <div className="topbar-brand-logo">
                        <span style={{color:'var(--accent)', fontWeight:900, fontSize:'1.3rem', letterSpacing:'-0.5px'}}>Agentic Neuro</span>
                    </div>
                    <div className="topbar-brand-right">
                        {/* Language Selector (Custom Dropdown) */}
                        <div style={{position:'relative'}}>
                            <div 
                                style={{display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.35rem 0.5rem', border:'1px solid transparent', borderRadius:'6px', fontSize:'0.85rem', fontWeight:600, cursor:'pointer'}}
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="lang-selector-btn"
                            >
                                <span style={{fontSize:'1.1rem'}}>{selectedLang.flag}</span>
                                <span style={{fontWeight:'bold'}}>{selectedLang.code.toUpperCase()}</span>
                                <ChevronDown size={14} />
                            </div>
                            
                            {isLangOpen && (
                                <div style={{position:'absolute', top:'calc(100% + 5px)', left:0, background:'var(--panel-bg)', border:'1px solid var(--border-color)', borderRadius:'8px', padding:'0.5rem', minWidth:'220px', zIndex:100, boxShadow:'0 8px 16px rgba(0,0,0,0.1)'}}>
                                    <div style={{fontSize:'0.75rem', color:'var(--text-secondary)', padding:'0.5rem', marginBottom:'0.25rem', borderBottom:'1px solid var(--border-color)'}}>
                                        Change Language
                                    </div>
                                    <div style={{maxHeight:'250px', overflowY:'auto'}}>
                                        {availableLanguages.map(lang => (
                                            <div 
                                                key={lang.code}
                                                onClick={() => handleLanguageChange(lang)}
                                                style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem', cursor:'pointer', borderRadius:'4px', background: selectedLang.code === lang.code ? 'var(--bg-hover)' : 'transparent'}}
                                            >
                                                <input type="radio" checked={selectedLang.code === lang.code} readOnly style={{margin:0}} />
                                                <span style={{fontSize:'1rem'}}>{lang.flag}</span>
                                                <span style={{fontSize:'0.85rem'}}>{lang.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{fontSize:'0.75rem', padding:'0.5rem', marginTop:'0.25rem', borderTop:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:'0.25rem', color:'var(--text-secondary)'}}>
                                        {selectedLang.flag} You are currently browsing from {selectedLang.label.split(' -')[0]}
                                    </div>
                                    <div style={{padding:'0.5rem 0.5rem 0 0.5rem'}}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); alert("You are currently assigned to the Global Region. Changing region requires Administrator privileges."); }} style={{color:'var(--accent)', fontSize:'0.8rem', textDecoration:'none'}}>Change country/region</a>
                                    </div>
                                </div>
                            )}
                            <div id="google_translate_element" style={{display:'none'}}></div>
                        </div>
                        {/* Contact Us */}
                        <button className="sketch-button" onClick={() => setIsContactOpen(true)} style={{display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.35rem 0.75rem', fontSize:'0.85rem', fontWeight:600}}>
                            <Phone size={14}/> Contact Us
                        </button>
                        {/* Employee Profile */}
                        <div
                            style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.35rem 0.85rem', border:'1.5px solid var(--accent)', borderRadius:'6px', cursor:'pointer', background:'rgba(67,160,71,0.08)'}}
                            onClick={() => setIsProfileOpen(true)}
                            title="View Profile"
                        >
                            <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'var(--accent)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.85rem'}}>
                                {loggedInUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{lineHeight:1.2}}>
                                <div style={{fontWeight:700, fontSize:'0.85rem', color:'var(--accent)'}}>{loggedInUser.name}</div>
                                <div style={{fontSize:'0.72rem', color:'var(--text-secondary)'}}>{loggedInUser.role}</div>
                            </div>
                            <ChevronDown size={14} color="var(--text-secondary)"/>
                        </div>

                        {/* Settings Button */}
                        <button className="modern-icon-btn" onClick={() => setIsSettingsOpen(true)} title="Settings">
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                {/* ── TOP BAR ROW 2: Navigation Tabs ── */}
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
                </nav>

                {/* ── MAIN CONTENT AREA ── */}
                <main className="main-content">
                <div className="content-area">

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
                                                <div style={{position:'absolute', top:'100%', right:0, background:'var(--panel-bg)', border:'1px solid var(--border-color)', borderRadius:'8px', marginTop:'0.5rem', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:10, minWidth:'180px', overflow:'hidden'}}>
                                                    {['Daily', 'Monthly', 'Yearly'].map(opt => (
                                                        <div key={opt} onClick={() => { setTaskFilter(opt); setShowTaskMenu(false); }} style={{padding:'0.75rem 1rem', cursor:'pointer', background: taskFilter === opt ? 'var(--bg-hover)' : 'transparent', fontWeight: taskFilter === opt ? 'bold' : 'normal'}}>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                    <div style={{borderTop: '1px solid var(--border-color)', padding: '0.75rem 1rem'}}>
                                                        <label style={{display:'flex', alignItems:'center', justifyContent: 'space-between', cursor:'pointer', margin:0}}>
                                                            <span style={{fontSize:'0.85rem'}}>Auto-Extract</span>
                                                            <label className="toggle-switch">
                                                                <input type="checkbox" checked={autoExtractTasks} onChange={(e) => setAutoExtractTasks(e.target.checked)} />
                                                                <span className="toggle-slider"></span>
                                                            </label>
                                                        </label>
                                                    </div>
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
                    {activeTab === 'Dashboard' && (() => {
                        const employeeHours = TEAM_DATA.filter(t => t.role === 'Employee').reduce((acc, curr) => acc + getFilteredHours(curr.chartData, productivityTimeFilter), 0);
                        const leadHours = TEAM_DATA.filter(t => t.role === 'Team Lead').reduce((acc, curr) => acc + getFilteredHours(curr.chartData, productivityTimeFilter), 0);
                        const totalHours = employeeHours + leadHours;

                        let processedFiles = [...files];
                        if (fileSearch) {
                            processedFiles = processedFiles.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()));
                        }
                                                if (fileSortBy === 'A-Z') {
                            processedFiles.sort((a, b) => a.name.localeCompare(b.name));
                        } else if (fileSortBy === 'Z-A') {
                            processedFiles.sort((a, b) => b.name.localeCompare(a.name));
                        }
                        processedFiles = processedFiles.slice(0, 10);

                        return (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                                {/* Top Analytics Header with Employee Search Bar */}
                                <div className="card sketch-border" style={{background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.15) 100%)', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'visible', zIndex: 10}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div>
                                            <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>Team Productivity Overview</h2>
                                            <p style={{margin: '0.5rem 0 0 0', color: 'var(--text-secondary)'}}>Live working hours and file modification analytics</p>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                            <div style={{fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1}}>{Math.round(totalHours / Math.max(TEAM_DATA.length, 1))}</div>
                                            <div style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px'}}>Avg Hrs/Employee ({productivityTimeFilter})</div>
                                        </div>
                                    </div>
                                    
                                    {/* Employee Search Bar */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', background: 'var(--panel-bg)', backdropFilter: 'blur(10px)',
                                        border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.8rem 1.2rem', position: 'relative',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                                    }}>
                                        <Search size={20} color="var(--accent)" />
                                        <input 
                                            type="text" 
                                            value={dashboardSearchQuery} 
                                            onChange={e => setDashboardSearchQuery(e.target.value)} 
                                            placeholder="Search employees or team leads..." 
                                            style={{background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '1rem', width: '100%', outline: 'none', marginLeft: '1rem'}} 
                                        />
                                        {dashboardSearchQuery && (
                                            <div style={{
                                                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: 'var(--bg-surface)',
                                                border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 50, maxHeight: '300px', overflowY: 'auto',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                                            }}>
                                                {TEAM_DATA.filter(t => t.name.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) || t.role.toLowerCase().includes(dashboardSearchQuery.toLowerCase())).map(member => (
                                                    <div 
                                                        key={member.id} 
                                                        onClick={() => { setSelectedEmployee(member); setDashboardSearchQuery(''); }} 
                                                        style={{padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid var(--border-color)'}}
                                                    >
                                                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                                            <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>{member.name.charAt(0)}</div>
                                                            <div>
                                                                <div style={{fontWeight: 'bold', fontSize: '1rem'}}>{member.name}</div>
                                                                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{member.role}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {TEAM_DATA.filter(t => t.name.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) || t.role.toLowerCase().includes(dashboardSearchQuery.toLowerCase())).length === 0 && (
                                                    <div style={{padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center'}}>No members found matching "{dashboardSearchQuery}"</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Filters */}
                                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative'}}>
                                        <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem'}}>
                                            {filterOptions.find(o => o.value === productivityTimeFilter)?.label}
                                        </span>
                                        <FilterDropdown 
                                            value={productivityTimeFilter} 
                                            onChange={setProductivityTimeFilter} 
                                            options={filterOptions} 
                                        />
                                    </div>
                                </div>
                                {/* Working Hours Grid */}
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                                    <div className="card sketch-border" style={{borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                                            <div>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                                    <User size={24} color="#10b981" />
                                                    <h3 style={{margin: 0}}>Employee working timeline</h3>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center', marginTop: '0.5rem'}}>
                                                    <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.5rem'}}>
                                                        {filterOptions.find(o => o.value === employeeTimeFilter)?.label}
                                                    </span>
                                                    <FilterDropdown 
                                                        value={employeeTimeFilter} 
                                                        onChange={setEmployeeTimeFilter} 
                                                        options={filterOptions} 
                                                    />
                                                </div>
                                            </div>
                                            <div style={{textAlign: 'right'}}>
                                                <div style={{fontSize: '2rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1}}>
                                                    {(() => {
                                                        const roleData = TEAM_DATA.filter(t => t.role === 'Employee');
                                                        const total = roleData.reduce((acc, curr) => acc + getFilteredHours(curr.chartData, employeeTimeFilter), 0);
                                                        return Math.round(total / Math.max(roleData.length, 1));
                                                    })()}
                                                </div>
                                                <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px'}}>avg hrs logged</div>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                            {TEAM_DATA.filter(t => t.role === 'Employee').map(emp => {
                                                const total = getFilteredHours(emp.chartData, employeeTimeFilter);
                                                const days = emp.chartData[employeeTimeFilter]?.values.length || 1;
                                                return (
                                                    <div key={emp.id} onClick={() => setSelectedEmployee(emp)} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s'}}>
                                                        <strong>{emp.name}</strong>
                                                        <span>{total} hrs (Avg: {Math.round(total / days)} hrs)</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="card sketch-border" style={{borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                                            <div>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                                    <BadgeCheck size={24} color="#f59e0b" />
                                                    <h3 style={{margin: 0}}>Team LEAD working timeline</h3>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center', marginTop: '0.5rem'}}>
                                                    <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.5rem'}}>
                                                        {filterOptions.find(o => o.value === leadTimeFilter)?.label}
                                                    </span>
                                                    <FilterDropdown 
                                                        value={leadTimeFilter} 
                                                        onChange={setLeadTimeFilter} 
                                                        options={filterOptions} 
                                                    />
                                                </div>
                                            </div>
                                            <div style={{textAlign: 'right'}}>
                                                <div style={{fontSize: '2rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1}}>
                                                    {(() => {
                                                        const roleData = TEAM_DATA.filter(t => t.role === 'Team Lead');
                                                        const total = roleData.reduce((acc, curr) => acc + getFilteredHours(curr.chartData, leadTimeFilter), 0);
                                                        return Math.round(total / Math.max(roleData.length, 1));
                                                    })()}
                                                </div>
                                                <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px'}}>avg hrs logged</div>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                            {TEAM_DATA.filter(t => t.role === 'Team Lead').map(lead => {
                                                const total = getFilteredHours(lead.chartData, leadTimeFilter);
                                                const days = lead.chartData[leadTimeFilter]?.values.length || 1;
                                                return (
                                                    <div key={lead.id} onClick={() => setSelectedEmployee(lead)} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s'}}>
                                                        <strong>{lead.name}</strong>
                                                        <span>{total} hrs (Avg: {Math.round(total / days)} hrs)</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="card sketch-border" style={{borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                                            <div>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                                    <Users size={24} color="#3b82f6" />
                                                    <h3 style={{margin: 0}}>Team timeline</h3>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center', marginTop: '0.5rem'}}>
                                                    <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.5rem'}}>
                                                        {filterOptions.find(o => o.value === teamTimeFilter)?.label}
                                                    </span>
                                                    <FilterDropdown 
                                                        value={teamTimeFilter} 
                                                        onChange={setTeamTimeFilter} 
                                                        options={filterOptions} 
                                                    />
                                                </div>
                                            </div>
                                            <div style={{textAlign: 'right'}}>
                                                <div style={{fontSize: '2rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1}}>
                                                    {(() => {
                                                        const roleData = TEAM_DATA.filter(t => t.role === 'Team');
                                                        const total = roleData.reduce((acc, curr) => acc + getFilteredHours(curr.chartData, teamTimeFilter), 0);
                                                        return Math.round(total / Math.max(roleData.length, 1));
                                                    })()}
                                                </div>
                                                <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px'}}>avg hrs logged</div>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                            {TEAM_DATA.filter(t => t.role === 'Team').map(team => {
                                                const total = getFilteredHours(team.chartData, teamTimeFilter);
                                                const days = team.chartData[teamTimeFilter]?.values.length || 1;
                                                return (
                                                    <div key={team.id} onClick={() => setSelectedEmployee(team)} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.4rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s'}}>
                                                        <strong>{team.name}</strong>
                                                        <span>{total} hrs (Avg: {Math.round(total / days)} hrs)</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* File Modification Analytics */}
                                <div className="card sketch-border">
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                            <FolderTree size={24} color="var(--accent)" />
                                            <h3 style={{margin: 0}}>File Modification & Working Hours</h3>
                                        </div>
                                        <div style={{position: 'relative'}}>
                                            <MoreVertical size={20} style={{cursor:'pointer', color:'var(--text-secondary)'}} onClick={() => setShowFileFilterMenu(!showFileFilterMenu)}/>
                                            {showFileFilterMenu && (
                                                <div style={{position:'absolute', top:'100%', right:0, background:'var(--panel-bg)', border:'1px solid var(--border-color)', borderRadius:'4px', zIndex:10, padding: '0.5rem', minWidth: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                                                    <div style={{marginBottom: '0.5rem'}}>
                                                        <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem'}}>Search</label>
                                                        <input type="text" value={fileSearch} onChange={e => setFileSearch(e.target.value)} placeholder="Search files..." style={{width: '100%', padding: '0.3rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)'}} />
                                                    </div>
                                                    <div style={{marginBottom: '0.5rem'}}>
                                                        <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem'}}>Category</label>
                                                        <select value={fileCategory} onChange={e => setFileCategory(e.target.value)} style={{width: '100%', padding: '0.3rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)'}}>
                                                            {['All', 'Code', 'Design', 'Document'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem'}}>Sort By</label>
                                                        <select value={fileSortBy} onChange={e => setFileSortBy(e.target.value)} style={{width: '100%', padding: '0.3rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)'}}>
                                                            {['Recent', 'A-Z', 'Z-A'].map(sort => <option key={sort} value={sort}>{sort}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{overflowX: 'auto'}}>
                                        <table className="file-table">
                                            <thead>
                                                <tr>
                                                    <th style={{textAlign: 'left'}}>File Name</th>
                                                    <th style={{textAlign: 'left'}}>Last Modified</th>
                                                    <th style={{textAlign: 'right'}}>Hours Logged</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {processedFiles.map(file => (
                                                    <React.Fragment key={file.id}>
                                                        <tr 
                                                            style={{cursor: 'pointer', background: expandedFileId === file.id ? 'rgba(37,99,235,0.05)' : 'transparent'}}
                                                            onClick={() => setExpandedFileId(expandedFileId === file.id ? null : file.id)}
                                                        >
                                                            <td style={{fontWeight: 600}}>
                                                                <FileText size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'8px', color:'var(--text-secondary)'}}/>
                                                                {file.name}
                                                                <ChevronDown size={14} style={{marginLeft: '8px', transition: 'transform 0.2s', transform: expandedFileId === file.id ? 'rotate(180deg)' : 'rotate(0deg)'}}/>
                                                            </td>
                                                            <td style={{color: 'var(--text-secondary)'}}>{file.lastModified}</td>
                                                            <td style={{textAlign: 'right'}}>
                                                                <span style={{background: 'var(--accent)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600}}>
                                                                    {file.hoursLogged} hrs
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        {expandedFileId === file.id && (
                                                            <tr>
                                                                <td colSpan="3" style={{padding: 0, borderBottom: 'none'}}>
                                                                    <div style={{padding: '1rem', background: 'var(--bg-color)', borderLeft: '4px solid var(--accent)', margin: '0.5rem 0 1rem 1rem', borderRadius: '4px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'}}>
                                                                        <h4 style={{marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)'}}><Clock size={14}/> Modification History</h4>
                                                                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                                                            {file.history.map((hist, idx) => (
                                                                                <div key={idx} style={{display: 'flex', gap: '1rem', position: 'relative'}}>
                                                                                    {/* Tree line */}
                                                                                    {idx !== file.history.length - 1 && <div style={{position: 'absolute', left: '11px', top: '24px', bottom: '-16px', width: '2px', background: 'var(--border-color)'}}></div>}
                                                                                    
                                                                                    <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1}}>
                                                                                        <User size={12}/>
                                                                                    </div>
                                                                                    <div style={{flex: 1, paddingBottom: '0.5rem'}}>
                                                                                        <div style={{fontWeight: 700, fontSize: '0.95rem'}}>{hist.user}</div>
                                                                                        <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem'}}>
                                                                                            <span>{hist.date}</span> &bull; <span>{hist.time}</span>
                                                                                        </div>
                                                                                        <div style={{fontSize: '0.9rem', marginTop: '0.3rem', background: 'var(--border-color)', padding: '0.3rem 0.6rem', borderRadius: '4px', display: 'inline-block'}}>
                                                                                            {hist.action}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {activeTab === 'Chat' && (
                        <div className="chat-layout">
                            {/* Agentic Search Overlay */}
                            {agenticSearchOpen && (
                                <div className="agentic-search-overlay" onClick={(e) => {
                                    if (e.target.className === 'agentic-search-overlay') setAgenticSearchOpen(false);
                                }}>
                                    <div className="agentic-search-modal">
                                        <div className="agentic-search-input-wrap">
                                            <Search size={24} color="var(--accent)" style={{marginRight: '1rem'}}/>
                                            <input 
                                                type="text" 
                                                className="agentic-search-input" 
                                                placeholder="Ask Agentic AI to find anything..."
                                                value={agenticSearchQuery}
                                                onChange={(e) => setAgenticSearchQuery(e.target.value)}
                                                autoFocus
                                            />
                                            <button type="button" className="msg-action-btn" onClick={() => setAgenticSearchOpen(false)}><X size={20}/></button>
                                        </div>
                                        {agenticSearchQuery && (
                                            <div className="agentic-search-results">
                                                <div className="ai-summary-banner">
                                                    <Sparkles size={20} color="var(--accent)"/>
                                                    <div>
                                                        <strong>Agentic AI Summary:</strong> Found 3 matching messages across Team Chat discussing "{agenticSearchQuery}".
                                                    </div>
                                                </div>
                                                <div className="search-result-item">
                                                    <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>General Team Chat • Alice</div>
                                                    <div>Let's review the <span className="search-highlight">{agenticSearchQuery}</span> files tomorrow.</div>
                                                </div>
                                                <div className="search-result-item">
                                                    <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Workspace • Blueprint.pdf</div>
                                                    <div>Matching document reference for <span className="search-highlight">{agenticSearchQuery}</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Sidebar */}
                              <div className={`chat-sidebar ${chatSidebarOpen ? 'open' : ''}`}>
                                  <div className="chat-sidebar-header" style={{padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column'}}>
                                      <div className="whatsapp-top-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem'}}>
                                          <div style={{fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)'}}>Chats</div>
                                          <div style={{display:'flex', gap:'0.8rem', position: 'relative'}}>
                                              <button className="msg-action-btn" onClick={() => {setShowChatNewMenu(!showChatNewMenu); setShowChatOptionsMenu(false);}} title="New" style={{background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                                                  <MessageSquarePlus size={20}/>
                                              </button>
                                              {showChatNewMenu && (
                                                  <div style={{position: 'absolute', top: '100%', right: '30px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 20, minWidth: '150px', padding: '0.5rem 0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                                                      <div onClick={() => {setShowChatNewMenu(false); /* New Chat Logic */}} style={{padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)'}}>New chat</div>
                                                      <div onClick={() => {setShowChatNewMenu(false); setShowCreateGroup(true);}} style={{padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)'}}>New group</div>
                                                  </div>
                                              )}
                                              
                                              <button className="msg-action-btn" onClick={() => {setShowChatOptionsMenu(!showChatOptionsMenu); setShowChatNewMenu(false);}} title="More" style={{background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                                                  <MoreVertical size={20}/>
                                              </button>
                                              {showChatOptionsMenu && (
                                                  <div style={{position: 'absolute', top: '100%', right: 0, background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 20, minWidth: '150px', padding: '0.5rem 0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                                                      <div onClick={() => setShowChatOptionsMenu(false)} style={{padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)'}}>Starred msg</div>
                                                      <div onClick={() => setShowChatOptionsMenu(false)} style={{padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)'}}>Select chats</div>
                                                      <div onClick={() => setShowChatOptionsMenu(false)} style={{padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)'}}>Mark All as read</div>
                                                  </div>
                                              )}

                                              <button className="msg-action-btn mobile-menu-btn" style={{display:'none'}} onClick={() => setChatSidebarOpen(false)}><X size={16}/></button>
                                          </div>
                                      </div>
                                      <div className="whatsapp-search-wrapper" style={{position: 'relative', width: '100%', marginBottom: '1rem'}}>
                                          <Search size={16} className="whatsapp-search-icon" style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                                          <input type="text" className="whatsapp-search" placeholder="Search or start a new chat" value={chatSearchQuery} onChange={e => setChatSearchQuery(e.target.value)} style={{width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.95rem'}} />
                                      </div>
                                      <div style={{display: 'flex', gap: '0.6rem', width: '100%', overflowX: 'auto', paddingBottom: '0.2rem', alignItems: 'center'}}>
                                          {['All', 'Unread 13', 'Favourites'].map(f => (
                                              <div key={f} 
                                                   onClick={() => setChatFilter(f)}
                                                   style={{
                                                       padding: '0.4rem 1rem', 
                                                       fontSize: '0.85rem',
                                                       cursor: 'pointer',
                                                       borderRadius: '20px',
                                                       whiteSpace: 'nowrap',
                                                       fontWeight: 500,
                                                       background: chatFilter === f ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                                       color: chatFilter === f ? '#fff' : 'var(--text-secondary)'
                                                   }}>{f}</div>
                                          ))}
                                          <div style={{
                                               padding: '0.4rem 0.6rem', 
                                               cursor: 'pointer',
                                               borderRadius: '20px',
                                               background: 'rgba(255,255,255,0.05)',
                                               color: 'var(--text-secondary)',
                                               display: 'flex', alignItems: 'center', justifyContent: 'center'
                                           }}><ChevronDown size={14}/></div>
                                      </div>
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

                              {/* Main Chat View */}
                              <div className="chat-main">
                                <div className="chat-main-header">
                                    <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                                        <button className="msg-action-btn mobile-menu-btn" style={{display:'none'}} onClick={() => setChatSidebarOpen(true)}>
                                            <Menu size={20}/>
                                        </button>
                                        <div className="chat-avatar" style={{width:'40px', height:'40px', fontSize:'1rem'}}>
                                            {activeConversation === 'general' ? <UserCircle2 size={20}/> : 'A'}
                                            <div className={`chat-presence ${activeConversation === 'general' ? 'presence-online' : 'presence-away'}`}></div>
                                        </div>
                                        <div>
                                            <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{activeConversation === 'general' ? 'General Team Chat' : 'Alice (Employee)'}</div>
                                            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>
                                                {activeConversation === 'general' ? '12 members • 5 online' : 'Away for 2 hours'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{display:'flex', gap:'0.5rem'}}>
                                        <button className="sketch-button" onClick={() => startCall('audio')} title="Voice Call"><Phone size={18}/></button>
                                        <button className="sketch-button" onClick={() => startCall('video')} title="Video Call"><Video size={18}/></button>
                                        <button className="msg-action-btn" title="More Options"><MoreVertical size={20}/></button>
                                    </div>
                                </div>

                                <div className="chat-messages-area">
                                    {/* Mock Pinned Message */}
                                    {activeConversation === 'general' && (
                                        <div style={{background:'rgba(234, 179, 8, 0.1)', border:'1px solid #eab308', padding:'0.5rem 1rem', borderRadius:'var(--radius)', display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.85rem', marginBottom:'1rem'}}>
                                            <Pin size={16} color="#ca8a04"/>
                                            <div style={{flex:1}}><strong>Pinned Message:</strong> Please ensure we check cross-team dependencies before deploying.</div>
                                        </div>
                                    )}
                                    
                                    {messages.map(msg => {
                                        const isSelf = msg.sender === loggedInUser.name || msg.sender === loggedInUser.employeeId;
                                        return (
                                            <div key={msg.id} className={`msg-wrapper ${isSelf ? 'self' : 'other'}`}>
                                                <div className="msg-actions">
                                                    <button className="msg-action-btn" title="React"><Smile size={14}/></button>
                                                    <button className="msg-action-btn" title="Reply" onClick={() => setReplyingToMessage(msg)}><Reply size={14}/></button>
                                                    <button className="msg-action-btn" title="More"><MoreVertical size={14}/></button>
                                                </div>
                                                
                                                <div className="msg-bubble">
                                                    <div className="msg-sender-name">{msg.sender}</div>
                                                    {msg.quoted && (
                                                        <div className="msg-quote">
                                                            <div style={{fontWeight:'bold', marginBottom:'0.25rem'}}>{msg.quoted.sender}</div>
                                                            <div>{msg.quoted.text}</div>
                                                        </div>
                                                    )}
                                                    <div className="msg-text">{msg.text}</div>
                                                    {msg.file && (
                                                        <div className="message-file">
                                                            <FileText size={18} color="var(--accent)" /> {msg.file}
                                                            <Download size={16} style={{marginLeft:'auto', cursor:'pointer'}}/>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Manager Approval View inside Chat */}
                                                    {msg.permitRequest && loggedInUser.role === 'Higher Authority' && msg.permitRequest.status === 'pending' && (
                                                        <div style={{marginTop:'0.75rem', padding:'0.75rem', border:'1px dashed var(--accent)', borderRadius:'4px', backgroundColor:'rgba(37, 99, 235, 0.05)'}}>
                                                            <button className="sketch-button primary" onClick={() => setPendingPermitReq({msgId: msg.id, ...msg.permitRequest})}>
                                                                Access Permit
                                                            </button>
                                                        </div>
                                                    )}
                                                    {msg.permitRequest && msg.permitRequest.status === 'approved' && (
                                                        <div style={{marginTop:'0.5rem', color:'var(--success)', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                            <CheckCircle size={14}/> Permit Granted
                                                        </div>
                                                    )}

                                                    <div className="msg-meta">
                                                        <span style={{opacity:0}}>{msg.time}</span> {/* spacing trick */}
                                                        <div style={{position:'absolute', bottom:'0.5rem', right:'0.5rem', display:'flex', alignItems:'center', gap:'0.25rem'}}>
                                                            {msg.time}
                                                            {isSelf && <CheckCheck size={14} color="var(--accent)"/>}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Mock Reactions */}
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className="msg-reactions">
                                                        {msg.reactions.map((reaction, i) => (
                                                            <div key={i} className="reaction-badge">{reaction.emoji} {reaction.count}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Rich Composer Area */}
                                <div className="chat-composer-area">
                                    {replyingToMessage && (
                                        <div className="replying-indicator">
                                            <div>Replying to <strong>{replyingToMessage.sender}</strong></div>
                                            <button className="msg-action-btn" onClick={() => setReplyingToMessage(null)}><X size={14}/></button>
                                        </div>
                                    )}
                                    
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                        {/* Agentic AI Button */}
                                        <div style={{position:'relative'}}>
                                            <button type="button" className="sketch-button" onClick={() => setShowAiAssistantMenu(!showAiAssistantMenu)} style={{borderColor:'var(--accent)', color:'var(--accent)', padding:'0.4rem 0.6rem'}}>
                                                <Sparkles size={16}/> AI
                                            </button>
                                            {showAiAssistantMenu && (
                                                <div style={{position:'absolute', bottom:'110%', left:'0', background:'var(--panel-bg)', border:'1px solid var(--accent)', borderRadius:'8px', padding:'0.5rem', width:'220px', boxShadow:'var(--shadow)', zIndex:20}}>
                                                    <div style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--accent)', marginBottom:'0.5rem', padding:'0 0.5rem'}}>Agentic AI Tools</div>
                                                    <div className="search-result-item" style={{padding:'0.5rem', fontSize:'0.85rem'}} onClick={() => {setAiAssistantSummary("I found 4 action items from the last 20 messages."); setShowAiAssistantMenu(false);}}>
                                                        <CheckCheck size={14} style={{verticalAlign:'middle', marginRight:'0.5rem'}}/> Extract Tasks
                                                    </div>
                                                    <div className="search-result-item" style={{padding:'0.5rem', fontSize:'0.85rem'}} onClick={() => {setAiAssistantSummary("The team agreed to deploy the new blueprints on Friday."); setShowAiAssistantMenu(false);}}>
                                                        <Bot size={14} style={{verticalAlign:'middle', marginRight:'0.5rem'}}/> Summarize Chat
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {aiAssistantSummary && (
                                            <div style={{flex:1, background:'rgba(67, 160, 71, 0.1)', padding:'0.5rem', borderRadius:'8px', fontSize:'0.85rem', color:'var(--accent)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                <div><strong>AI:</strong> {aiAssistantSummary}</div>
                                                <button type="button" className="msg-action-btn" onClick={() => setAiAssistantSummary(null)}><X size={14}/></button>
                                            </div>
                                        )}
                                    </div>

                                    {!aiAssistantSummary && (
                                        <form className="composer-input-row" onSubmit={handleSendMessage}>
                                            <button type="button" className="msg-action-btn" title="Add Attachment" onClick={() => setIsFilePickerOpen(true)}><Plus size={20}/></button>
                                            <button type="button" className="msg-action-btn" title="Record Voice"><Mic size={20}/></button>
                                            <textarea 
                                                className="rich-textarea" 
                                                placeholder="Type a message... (Shift+Enter for new line)"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                                rows={1}
                                            />
                                            <button type="button" className="msg-action-btn" title="Emoji"><Smile size={20}/></button>
                                            <button type="submit" className="sketch-button primary" style={{padding:'0.5rem 1rem'}}><Send size={18}/></button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Other tabs (Agentic Neuro, Audit Logs) omitted for brevity as they remain largely unchanged from Phase 1, just re-add the rendering logic if needed, but since we are replacing the file we must render them */}
                    {activeTab === 'Workspace' && (
                        <div className="card sketch-border">
                            <div className="workspace-header" style={{marginBottom: '1.5rem', display: 'flex', flexDirection: 'column'}}>
                                <div className="whatsapp-top-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem'}}>
                                    <div style={{fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)'}}>
                                        {workspaceLevel === 'groups' && "Workspace Groups"}
                                        {workspaceLevel === 'files' && `${WORKSPACE_GROUPS.find(g=>g.id===selectedGroupId)?.name}`}
                                        {workspaceLevel === 'tree' && `Mind Tree`}
                                    </div>
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        {workspaceLevel !== 'groups' && (
                                            <button className="sketch-button" onClick={() => {
                                                if (workspaceLevel === 'tree') setWorkspaceLevel('files');
                                                else setWorkspaceLevel('groups');
                                            }} style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>Back</button>
                                        )}
                                    </div>
                                </div>
                                <div className="whatsapp-search-wrapper" style={{position: 'relative', width: '100%', marginBottom: '1rem'}}>
                                    <Search size={16} className="whatsapp-search-icon" style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                                    <input 
                                        type="text" 
                                        className="whatsapp-search" 
                                        placeholder="Agentic AI Search (Files, Domains, Owners)..." 
                                        value={workspaceSearchQuery} 
                                        onChange={e => {setWorkspaceSearchQuery(e.target.value); setIsWorkspaceSearchExpanded(true);}} 
                                        onBlur={() => setTimeout(() => {if(!workspaceSearchQuery) setIsWorkspaceSearchExpanded(false)}, 200)} 
                                        style={{width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.95rem'}} 
                                    />
                                    {isWorkspaceSearchExpanded && workspaceSearchQuery && (
                                        <div className="agentic-search-results" style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--panel-bg)', zIndex: 50, border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', marginTop: '0.5rem', maxHeight: '300px', overflowY: 'auto'}}>
                                            {files.filter(f => {
                                                const q = workspaceSearchQuery.toLowerCase();
                                                return f.name.toLowerCase().includes(q) || 
                                                       (f.owner && f.owner.toLowerCase().includes(q)) || 
                                                       (f.teamName && f.teamName.toLowerCase().includes(q));
                                            }).slice(0, 50).map(f => (
                                                <div 
                                                    key={f.id} 
                                                    className="agentic-search-result-item"
                                                    style={{padding: '0.8rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer'}}
                                                    onClick={() => {
                                                        setSelectedFileId(f.id);
                                                        setWorkspaceLevel('tree');
                                                        setWorkspaceSearchQuery('');
                                                        setIsWorkspaceSearchExpanded(false);
                                                    }}
                                                >
                                                    <div style={{fontWeight:'bold', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><FileText size={14} style={{color: 'var(--accent)'}}/>{f.name}</div>
                                                    <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginLeft: '1.4rem'}}>{f.teamName || 'Unknown Team'} • {f.owner}</div>
                                                </div>
                                            ))}
                                            {files.filter(f => {
                                                const q = workspaceSearchQuery.toLowerCase();
                                                return f.name.toLowerCase().includes(q) || 
                                                       (f.owner && f.owner.toLowerCase().includes(q)) || 
                                                       (f.teamName && f.teamName.toLowerCase().includes(q));
                                            }).length === 0 && (
                                                <div style={{padding:'1rem', textAlign:'center', color:'var(--text-secondary)'}}>No matching files or domains found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div style={{display: 'flex', gap: '0.6rem', width: '100%', overflowX: 'auto', paddingBottom: '0.2rem', alignItems: 'center'}}>
                                    {['All', 'Files', 'Documents', 'Images'].map(f => (
                                        <div key={f} 
                                             onClick={() => setWorkspaceFilter(f)}
                                             style={{
                                                 padding: '0.4rem 1rem', 
                                                 fontSize: '0.85rem',
                                                 cursor: 'pointer',
                                                 borderRadius: '20px',
                                                 whiteSpace: 'nowrap',
                                                 fontWeight: 500,
                                                 background: workspaceFilter === f ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                                 color: workspaceFilter === f ? '#fff' : 'var(--text-secondary)'
                                             }}>{f}</div>
                                    ))}
                                </div>
                            </div>

                            {workspaceLevel === 'groups' && (
                                <div>
                                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem'}}>
                                        {WORKSPACE_GROUPS.map(g => (
                                            <div key={g.id} className="sketch-button" style={{height:'100px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:'bold'}} onClick={() => {
                                                setSelectedGroupId(g.id);
                                                setWorkspaceLevel('files');
                                            }}>
                                                <FolderTree size={24} style={{marginBottom:'0.5rem', color:'var(--accent)'}}/>
                                                {g.name}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{marginTop:'2rem', borderTop:'2px dashed var(--border-color)', paddingTop:'1.5rem'}}>
                                        <h3 style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem'}}><Trash2 size={20} color="var(--danger)"/> Deletion Logs (Trash)</h3>
                                        {deletedFiles.length === 0 ? (
                                            <p style={{color:'var(--text-secondary)'}}>No files have been deleted.</p>
                                        ) : (
                                            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem', background:'rgba(0,0,0,0.02)', padding:'1rem', borderRadius:'8px'}}>
                                                {deletedFiles.map(df => (
                                                    <div key={df.id} style={{borderLeft:'4px solid var(--danger)', paddingLeft:'1rem'}}>
                                                        <div style={{fontWeight:'bold', color:'var(--danger)'}}>{df.deletedBy} <span style={{color:'var(--text-secondary)', fontWeight:'normal', fontSize:'0.85rem'}}>({df.deletedByRole})</span></div>
                                                        <div style={{fontSize:'0.9rem', margin:'0.25rem 0'}}>Deleted file: <strong>{df.name}</strong> from {WORKSPACE_GROUPS.find(g=>g.id===df.groupId)?.name}</div>
                                                        <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{df.deleteTime}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {workspaceLevel === 'files' && (
                                <div className="chat-sidebar-list" style={{flex: 1, overflowY: 'auto'}}>
                                    {files.filter(f => f.groupId === selectedGroupId).map(file => (
                                        <div key={file.id} className="chat-convo-item" onClick={() => { setSelectedFileId(file.id); setWorkspaceLevel('tree'); }}>
                                            <div className="chat-avatar" style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)'}}>
                                                <FileText size={20}/>
                                            </div>
                                            <div className="chat-convo-details">
                                                <div className="chat-convo-header">
                                                    <div className="chat-convo-name">{file.name}</div>
                                                    <div className="chat-convo-time">{file.date}</div>
                                                </div>
                                                <div className="chat-convo-snippet" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                    <span>{file.owner} • {file.size}</span>
                                                    <button 
                                                        className="sketch-button danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (loggedInUser.role !== 'Higher Authority' && loggedInUser.role !== 'Manager') return alert("Access Denied.");
                                                            setDeletedFiles([...deletedFiles, { ...file, deletedBy: loggedInUser.name, deletedByRole: loggedInUser.role, deleteTime: new Date().toLocaleString() }]);
                                                            setFiles(files.filter(f => f.id !== file.id));
                                                            setAudits([{ id: Date.now(), action: 'DELETE', user: loggedInUser.name, detail: `Deleted ${file.name}`, time: new Date().toLocaleString() }, ...audits]);
                                                        }}
                                                        style={((loggedInUser.role !== 'Higher Authority' && loggedInUser.role !== 'Manager') ? {opacity: 0.5, cursor: 'not-allowed'} : {padding:'0.2rem 0.5rem', fontSize:'0.75rem', background: 'transparent'})}
                                                    >
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {files.filter(f => f.groupId === selectedGroupId).length === 0 && (
                                        <div style={{padding: '2rem', textAlign:'center', color:'var(--text-secondary)'}}>No active files in this group.</div>
                                    )}
                                </div>
                            )}

                            {workspaceLevel === 'tree' && (() => {
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
                              })()}
                        </div>
                    )}
                    {activeTab === 'Audit Log' && (
                        <div className="card sketch-border">
                            <h2>System Audit Logs</h2>
                            <ul className="audit-log">
                                {audits.map(audit => (
                                    <li key={audit.id} className={`audit-entry ${audit.action === 'DELETE' ? 'deleted' : ''}`}>
                                        <div className="audit-icon">{audit.action === 'DELETE' ? <ShieldAlert size={20} color="var(--danger)"/> : <Shield size={20} />}</div>
                                        <div>
                                            <div style={{fontWeight: 600}}>[{audit.action}] by {audit.user}</div>
                                            <div style={{color: 'var(--text-secondary)'}}>{audit.detail}</div>
                                            <div style={{fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-secondary)'}}>{audit.time}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                {/* ── CONTACT US MODAL ── */}
                {isContactOpen && (
                    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsContactOpen(false)}>
                        <div className="modal-content sketch-border" style={{maxWidth: '400px'}}>
                            <div className="modal-header">
                                <h3 style={{margin:0, fontFamily:'var(--font-professional)'}}>Contact Us</h3>
                                <button className="sketch-button" onClick={() => setIsContactOpen(false)}>X</button>
                            </div>
                            <div className="modal-body" style={{textAlign: 'center', paddingTop: '1.5rem'}}>
                                <div style={{marginBottom:'1.5rem'}}>
                                    <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'var(--accent)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem auto'}}>
                                        <Mail size={24}/>
                                    </div>
                                    <h4 style={{margin:'0 0 0.5rem 0', fontSize:'1rem'}}>Email Support</h4>
                                    <p style={{margin:0, color:'var(--text-secondary)'}}>support@agenticneuro.com</p>
                                </div>
                                <div style={{marginBottom:'1rem'}}>
                                    <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'var(--accent)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem auto'}}>
                                        <Phone size={24}/>
                                    </div>
                                    <h4 style={{margin:'0 0 0.5rem 0', fontSize:'1rem'}}>Phone Support</h4>
                                    <p style={{margin:0, color:'var(--text-secondary)'}}>+1-800-555-0199</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CONTACT US MODAL ── */}
                {isContactOpen && (
                    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsContactOpen(false)}>
                        <div className="modal-content" style={{maxWidth: '400px'}}>
                            <div className="modal-header">
                                <h3 style={{margin:0, display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                    <Phone size={20} color="var(--accent)"/> Contact Support
                                </h3>
                                <button className="sketch-button" onClick={() => setIsContactOpen(false)}>X</button>
                            </div>
                            <div className="modal-body" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                                    <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'rgba(67,160,71,0.1)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <Mail size={20}/>
                                    </div>
                                    <div>
                                        <h4 style={{margin:'0 0 0.25rem 0'}}>Email Support</h4>
                                        <p style={{margin:0, color:'var(--text-secondary)'}}>support@agenticneuro.com</p>
                                    </div>
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                                    <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'rgba(67,160,71,0.1)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <Phone size={20}/>
                                    </div>
                                    <div>
                                        <h4 style={{margin:'0 0 0.25rem 0'}}>Phone Support</h4>
                                        <p style={{margin:0, color:'var(--text-secondary)'}}>+1-800-555-0199</p>
                                    </div>
                                </div>
                                <div style={{marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)', textAlign: 'center'}}>
                                    <button className="sketch-button primary" onClick={() => { setIsContactOpen(false); setIsSupportChatOpen(true); setIsSupportIconVisible(true); }} style={{width: '100%', justifyContent: 'center', padding: '0.75rem'}}>
                                        <Bot size={18} style={{marginRight: '0.5rem'}}/> Start Virtual Assistance
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── VIRTUAL SUPPORT CHAT WIDGET ── */}
                {(isSupportIconVisible || isSupportChatOpen) && (
                    <div style={{position:'fixed', bottom:'2rem', right:'2rem', zIndex: 9999}}>
                        {isSupportChatOpen ? (
                            <div className="sketch-border" style={{width: '320px', height: '400px', background: 'var(--panel-bg)', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden'}}>
                                <div style={{background: 'var(--accent)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                        <Bot size={18}/>
                                        <span style={{fontWeight:700}}>Agentic Support</span>
                                    </div>
                                    <button onClick={() => setIsSupportChatOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><X size={18}/></button>
                                </div>
                                <div style={{flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.02)'}}>
                                    {supportMessages.map((msg, i) => (
                                        <div key={i} style={{alignSelf: msg.isBot ? 'flex-start' : 'flex-end', background: msg.isBot ? 'white' : 'var(--accent)', color: msg.isBot ? 'var(--text-primary)' : 'white', padding: '0.6rem 0.85rem', borderRadius: '8px', maxWidth: '85%', fontSize: '0.85rem', border: msg.isBot ? '1px solid var(--border-color)' : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                                            {msg.text}
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleSupportSend} style={{padding: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem'}}>
                                    <input type="text" value={supportInput} onChange={e => setSupportInput(e.target.value)} placeholder="Type your message..." style={{flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.85rem'}} />
                                    <button type="submit" className="sketch-button primary" style={{padding: '0.5rem'}}><Send size={16}/></button>
                                </form>
                            </div>
                        ) : (
                            <div style={{position: 'relative'}}>
                                <button onClick={() => setIsSupportIconVisible(false)} style={{position: 'absolute', top: '-10px', right: '-10px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
                                    <X size={14}/>
                                </button>
                                <button className="sketch-button primary virtual-assistant-btn" onClick={() => setIsSupportChatOpen(true)} style={{width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', padding: 0}}>
                                    <MessageSquare size={28}/>
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {selectedEmployee && (
                    <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-surface)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div className="card sketch-border" style={{width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-color)', position: 'relative'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                    <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem'}}>
                                        {selectedEmployee.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 style={{margin: 0}}>{selectedEmployee.name}</h2>
                                        <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{selectedEmployee.role} &bull; Activity Log</div>
                                    </div>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.5rem'}}>
                                            {filterOptions.find(o => o.value === selectedEmployeeTimeFilter)?.label}
                                        </span>
                                        <FilterDropdown 
                                            value={selectedEmployeeTimeFilter} 
                                            onChange={setSelectedEmployeeTimeFilter} 
                                            options={filterOptions} 
                                        />
                                    </div>
                                    <button className="msg-action-btn" onClick={() => { setSelectedEmployee(null); setSelectedWorkDay(null); }}>
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                            
                            {!selectedWorkDay ? (
                                <div>
                                    <div style={{marginBottom: '2rem'}}>
                                        <h3 style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>Working Timeline</h3>
                                        <ProductivityBarChart 
                                            dataset={selectedEmployee.chartData ? selectedEmployee.chartData[selectedEmployeeTimeFilter] : getAggregatedChartData('Employee', selectedEmployeeTimeFilter)} 
                                            filterLabel={selectedEmployeeTimeFilter} 
                                        />
                                    </div>
                                    <h3 style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>5-Day Work Week</h3>
                                    <div className="grid-2" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem'}}>
                                        {selectedEmployee.weeklyData.map(day => (
                                            <div key={day.day} onClick={() => setSelectedWorkDay(day)} style={{background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', cursor: 'pointer', textAlign: 'center', hover: {borderColor: 'var(--accent)'}, transition: 'border-color 0.2s'}}>
                                                <div style={{fontWeight: 700, marginBottom: '0.5rem'}}>{day.day}</div>
                                                <div style={{fontSize: '1.5rem', color: 'var(--accent)', fontWeight: 800}}>{day.hours}</div>
                                                <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>hrs logged</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600}} onClick={() => setSelectedWorkDay(null)}>
                                        <ChevronDown size={16} style={{transform: 'rotate(90deg)'}}/> Back to Week View
                                    </div>
                                    <h3 style={{marginBottom: '1.5rem', color: 'var(--text-secondary)'}}>{selectedWorkDay.day} &bull; Real-time Monitoring Log</h3>
                                    
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                        {selectedWorkDay.logs.map((log, idx) => (
                                            <div key={idx} style={{display: 'flex', gap: '1.5rem', position: 'relative'}}>
                                                {idx !== selectedWorkDay.logs.length - 1 && <div style={{position: 'absolute', left: '19px', top: '30px', bottom: '-16px', width: '2px', background: 'var(--border-color)'}}></div>}
                                                <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'var(--panel-bg)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1}}>
                                                    <Clock size={18} color="var(--accent)" />
                                                </div>
                                                <div style={{flex: 1, background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem'}}>
                                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                                        <span style={{fontWeight: 700}}>{log.time}</span>
                                                        <span style={{background: 'rgba(37,99,235,0.1)', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600}}>{log.app}</span>
                                                    </div>
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem'}}>
                                                        <FileText size={14} /> Working on: <strong>{log.file}</strong>
                                                    </div>
                                                    <div style={{background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid #10b981', fontSize: '0.9rem'}}>
                                                        {log.action}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
            {/* Mind Tree Hover Overlay */}
            <HoverMindTree data={hoveredProject} />
        </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
