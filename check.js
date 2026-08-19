const fs = require('fs');
const babel = require('@babel/core');
try {
  babel.parseSync(fs.readFileSync('app.jsx', 'utf8'), {
    presets: ['@babel/preset-react']
  });
  console.log('No syntax errors');
} catch (e) {
  console.error(e.message);
}
