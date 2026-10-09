#!/usr/bin/env node
// Build do frontend para dist/ (é isso que o Tauri empacota — frontendDist: "../dist").
// - Transpila os .js com JSX (type="text/babel") usando o Babel vendado em js/vendor/babel.min.js
// - Externaliza os <script> inline para js/boot.js
// - Gera dist/index.html SEM babel.min.js e com CSP sem 'unsafe-eval'/'unsafe-inline' para scripts
// Uso: node scripts/build.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const Babel = require(path.join(ROOT, 'js', 'vendor', 'babel.min.js'));

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
};

const rmrf = (p) => { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); };

const main = () => {
  rmrf(DIST);
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });

  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // 1. Scripts inline -> js/boot.js
  let boot = '';
  html = html.replace(/<script>\r?\n([\s\S]*?)<\/script>/g, (m, code) => {
    boot += '// ---- bloco inline do index.html ----\n' + code + '\n';
    return '<script src="js/boot.js"></script>';
  });

  // 2. Scripts type="text/babel" -> transpilados para JS puro
  const babelFiles = [];
  html = html.replace(/<script type="text\/babel" src="([^"]+)"><\/script>/g, (m, src) => {
    babelFiles.push(src);
    return `<script src="${src}"></script>`;
  });

  // 3. Remove o babel.min.js do app empacotado
  html = html.replace(/<script src="js\/vendor\/babel\.min\.js"><\/script>\r?\n?/, '');

  // 4. CSP sem eval/inline para scripts
  html = html.replace(
    /script-src 'self' 'unsafe-eval' 'unsafe-inline'/,
    "script-src 'self'"
  );

  fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');

  // 5. Transpila
  for (const src of babelFiles) {
    const code = fs.readFileSync(path.join(ROOT, src), 'utf8');
    const out = Babel.transform(code, { presets: ['react'], filename: src }).code;
    fs.writeFileSync(path.join(DIST, src), out, 'utf8');
  }

  // 6. core.js (JS puro) e boot.js
  fs.copyFileSync(path.join(ROOT, 'js', 'core.js'), path.join(DIST, 'js', 'core.js'));
  fs.writeFileSync(path.join(DIST, 'js', 'boot.js'), boot, 'utf8');

  // 7. Vendor (sem babel), css, favicon, assets
  fs.mkdirSync(path.join(DIST, 'js', 'vendor'), { recursive: true });
  for (const v of ['react.production.min.js', 'react-dom.production.min.js', 'jspdf.umd.min.js']) {
    fs.copyFileSync(path.join(ROOT, 'js', 'vendor', v), path.join(DIST, 'js', 'vendor', v));
  }
  copyDir(path.join(ROOT, 'css'), path.join(DIST, 'css'));
  fs.copyFileSync(path.join(ROOT, 'favicon.png'), path.join(DIST, 'favicon.png'));
  if (fs.existsSync(path.join(ROOT, 'assets'))) copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));

  // 8. Verificação
  const mustExist = ['index.html', 'js/core.js', 'js/boot.js', 'js/vendor/react.production.min.js',
    'js/shared.js', 'js/update.js', 'css/variables.css', 'favicon.png'];
  for (const f of mustExist) {
    if (!fs.existsSync(path.join(DIST, f))) {
      console.error('BUILD FALHOU: falta ' + f);
      process.exit(1);
    }
  }
  const distHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  if (distHtml.includes('babel.min.js')) { console.error('BUILD FALHOU: babel ainda presente'); process.exit(1); }
  if (distHtml.includes("'unsafe-eval'")) { console.error('BUILD FALHOU: unsafe-eval ainda na CSP'); process.exit(1); }

  const count = fs.readdirSync(DIST, { recursive: true }).length;
  console.log(`dist/ gerado com sucesso (${count} entradas, ${babelFiles.length} arquivos transpilados, CSP sem eval/inline)`);
};

main();
