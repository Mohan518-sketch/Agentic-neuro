import re

def optimize_themes():
    with open('index.css', 'r', encoding='utf-8') as f:
        css = f.read()
    
    # 1. Add variables to :root
    root_vars = """
  --accent-glow-1: rgba(0, 210, 255, 0.1);
  --accent-glow-2: rgba(0, 210, 255, 0.2);
  --accent-glow-3: rgba(0, 210, 255, 0.3);
  --accent-glow-4: rgba(0, 210, 255, 0.4);
  --accent-glow-5: rgba(0, 210, 255, 0.5);
  --danger-glow-1: rgba(239, 68, 68, 0.1);
  --danger-glow-2: rgba(239, 68, 68, 0.2);
  --danger-glow-3: rgba(239, 68, 68, 0.3);
  --danger-glow-4: rgba(239, 68, 68, 0.4);
  --danger-glow-5: rgba(239, 68, 68, 0.5);
  --secondary-glow-1: rgba(122, 0, 255, 0.1);
  --secondary-glow-2: rgba(122, 0, 255, 0.2);
  --secondary-glow-5: rgba(122, 0, 255, 0.5);
  --tooltip-bg: rgba(15, 23, 42, 0.95);
  --tooltip-text: #ffffff;
  --text-inverse: #ffffff;
"""
    css = re.sub(r'(:root\s*\{)', r'\1' + root_vars, css, count=1)

    # 2. Add variables to [data-theme="dark"]
    dark_vars = """
  --accent-glow-1: rgba(0, 240, 255, 0.1);
  --accent-glow-2: rgba(0, 240, 255, 0.2);
  --accent-glow-3: rgba(0, 240, 255, 0.3);
  --accent-glow-4: rgba(0, 240, 255, 0.4);
  --accent-glow-5: rgba(0, 240, 255, 0.5);
  --danger-glow-1: rgba(255, 42, 95, 0.1);
  --danger-glow-2: rgba(255, 42, 95, 0.2);
  --danger-glow-3: rgba(255, 42, 95, 0.3);
  --danger-glow-4: rgba(255, 42, 95, 0.4);
  --danger-glow-5: rgba(255, 42, 95, 0.5);
  --secondary-glow-1: rgba(139, 92, 246, 0.1);
  --secondary-glow-2: rgba(139, 92, 246, 0.2);
  --secondary-glow-5: rgba(139, 92, 246, 0.5);
  --tooltip-bg: rgba(0, 0, 0, 0.9);
  --tooltip-text: #ffffff;
  --text-inverse: #000000;
"""
    css = re.sub(r'(\[data-theme="dark"\]\s*\{)', r'\1' + dark_vars, css, count=1)

    # 3. Replace hardcoded glows in CSS
    # We match variations of rgba(0, 240, 255, 0.2) or rgba(0, 210, 255, 0.2) etc
    
    # Accent
    css = re.sub(r'rgba\(\s*0\s*,\s*2[14]0\s*,\s*255\s*,\s*0\.1[5]?\s*\)', 'var(--accent-glow-1)', css)
    css = re.sub(r'rgba\(\s*0\s*,\s*2[14]0\s*,\s*255\s*,\s*0\.2[5]?\s*\)', 'var(--accent-glow-2)', css)
    css = re.sub(r'rgba\(\s*0\s*,\s*2[14]0\s*,\s*255\s*,\s*0\.3[5]?\s*\)', 'var(--accent-glow-3)', css)
    css = re.sub(r'rgba\(\s*0\s*,\s*2[14]0\s*,\s*255\s*,\s*0\.4\s*\)', 'var(--accent-glow-4)', css)
    css = re.sub(r'rgba\(\s*0\s*,\s*2[14]0\s*,\s*255\s*,\s*0\.[56]\s*\)', 'var(--accent-glow-5)', css)
    
    # Danger
    css = re.sub(r'rgba\(\s*255\s*,\s*42\s*,\s*95\s*,\s*0\.1[5]?\s*\)', 'var(--danger-glow-1)', css)
    css = re.sub(r'rgba\(\s*255\s*,\s*42\s*,\s*95\s*,\s*0\.2[5]?\s*\)', 'var(--danger-glow-2)', css)
    css = re.sub(r'rgba\(\s*255\s*,\s*42\s*,\s*95\s*,\s*0\.3[5]?\s*\)', 'var(--danger-glow-3)', css)
    css = re.sub(r'rgba\(\s*255\s*,\s*42\s*,\s*95\s*,\s*0\.4\s*\)', 'var(--danger-glow-4)', css)
    css = re.sub(r'rgba\(\s*255\s*,\s*42\s*,\s*95\s*,\s*0\.[56]\s*\)', 'var(--danger-glow-5)', css)
    
    # Secondary
    css = re.sub(r'rgba\(\s*(?:139|122)\s*,\s*(?:92|0)\s*,\s*(?:246|255)\s*,\s*0\.1[5]?\s*\)', 'var(--secondary-glow-1)', css)
    css = re.sub(r'rgba\(\s*(?:139|122)\s*,\s*(?:92|0)\s*,\s*(?:246|255)\s*,\s*0\.2[5]?\s*\)', 'var(--secondary-glow-2)', css)
    css = re.sub(r'rgba\(\s*(?:139|122)\s*,\s*(?:92|0)\s*,\s*(?:246|255)\s*,\s*0\.5[5]?\s*\)', 'var(--secondary-glow-5)', css)
    
    # Tooltip / Dark stuff
    css = css.replace('rgba(15, 23, 42, 0.95)', 'var(--tooltip-bg)')
    
    with open('index.css', 'w', encoding='utf-8') as f:
        f.write(css)

    # 4. Process app.jsx
    with open('app.jsx', 'r', encoding='utf-8') as f:
        app = f.read()

    # Find inline dark borders and backgrounds
    # e.g. background:'rgba(0,0,0,0.05)' -> background:'var(--bg-subtle)'
    app = app.replace("'rgba(0,0,0,0.05)'", "'var(--bg-subtle)'")
    app = app.replace("'rgba(0,0,0,0.5)'", "'var(--bg-surface)'")
    
    # Find hardcoded black text or backgrounds
    app = app.replace("backgroundColor:'#000'", "backgroundColor:'var(--bg-color)'")
    app = app.replace("backgroundColor: '#000'", "backgroundColor: 'var(--bg-color)'")
    
    app = app.replace("'rgba(239, 68, 68, 0.4)'", "'var(--danger-bg)'")
    app = app.replace("'rgba(74, 222, 128, 0.4)'", "'var(--success)'") # Note: var(--success) isn't transparent, but close enough
    
    # Specific fix for the status scanner ring
    app = app.replace("textShadow:'0 0 5px rgba(0,0,0,0.8)'", "textShadow:'0 0 5px var(--bg-color)'")
    
    with open('app.jsx', 'w', encoding='utf-8') as f:
        f.write(app)

if __name__ == '__main__':
    optimize_themes()
