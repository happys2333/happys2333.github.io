'use strict';
// Dependency-free build smoke test. Run after `hexo generate`, not as a Hexo plugin.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve('public');
const required = ['index.html','blog/index.html','about/index.html','archives/index.html','tags/index.html','categories/index.html','404.html','assets/site.css','assets/site.js','2022/09/08/zh-CN/python_setup/index.html','2022/10/06/zh-CN/NLP01/index.html','2022/10/18/zh-CN/Transformer/index.html','2022/09/08/en/NLP01/index.html','2022/09/09/en/Transformer/index.html'];
for (const file of required) assert(fs.existsSync(path.join(root,file)), `Missing route: ${file}`);
const home = fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(home.includes('AI Ladder') && home.includes('DataMiningFinal'), 'Missing selected projects');
assert(home.includes('Deskflow') && home.includes('CC Switch') && home.includes('Gitea'), 'Missing contributions');
assert(!home.includes('{%'), 'Unrendered template in landing page');
for (const match of home.matchAll(/href="#([^"]+)"/g)) assert(home.includes(`id="${match[1]}"`), `Missing home anchor ${match[1]}`);
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
const htmlFiles = walk(root).filter(f => f.endsWith('.html'));
const failures = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file,'utf8');
  const base = new URL(path.relative(root,file).split(path.sep).join('/'),'https://happys2333.github.io/');
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const raw = match[1].replaceAll('&amp;','&');
    if (raw.startsWith('#') || /^(?:mailto:|tel:|javascript:|data:|tencent:)/i.test(raw)) continue;
    let url;
    try { url = new URL(raw,base); } catch { continue; }
    if (url.origin !== base.origin) continue;
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { failures.push(`${file}: invalid URL ${raw}`); continue; }
    let target = path.join(root,pathname);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target,'index.html');
    if (!fs.existsSync(target)) failures.push(`${path.relative(root,file)} -> ${raw}`);
  }
}
assert.equal(failures.length,0,`Broken local links:\n${failures.join('\n')}`);
for (const file of required.filter(f => f.startsWith('2022/'))) {
  const html = fs.readFileSync(path.join(root,file),'utf8');
  assert(!/<p>\s*test\s*<\/p>/i.test(html), `Placeholder remains: ${file}`);
}
console.log(`Site checks passed: ${required.length} required routes; local links in ${htmlFiles.length} HTML files.`);
