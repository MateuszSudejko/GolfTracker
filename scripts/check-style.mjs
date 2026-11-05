import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const codeDirs = ['src', 'tests', 'scripts'];
const docDirs = ['docs'];
const skip = new Set(['node_modules', '.expo', '.git', '.superpowers', 'dist', 'expo-env.d.ts']);
const codeExt = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const emoji = /\p{Extended_Pictographic}/u;

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function commentIndex(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      quote = c;
      continue;
    }
    if (c === '/' && (line[i + 1] === '/' || line[i + 1] === '*')) {
      return i;
    }
  }
  return -1;
}

const problems = [];

const rootFiles = readdirSync(root)
  .filter((n) => !skip.has(n) && !statSync(join(root, n)).isDirectory())
  .map((n) => join(root, n));
const codeFiles = codeDirs.flatMap((d) => walk(join(root, d), [])).concat(rootFiles.filter((f) => codeExt.has(extname(f))));
const otherFiles = docDirs
  .flatMap((d) => walk(join(root, d), []))
  .concat(rootFiles.filter((f) => ['.md', '.json'].includes(extname(f))));

for (const file of codeFiles) {
  if (!codeExt.has(extname(file))) continue;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const at = commentIndex(line);
    if (at >= 0) problems.push(`${relative(root, file)}:${i + 1}: comment`);
    if (emoji.test(line)) problems.push(`${relative(root, file)}:${i + 1}: emoji`);
  });
}

for (const file of otherFiles) {
  if (extname(file) === '.json' && file.endsWith('package-lock.json')) continue;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (emoji.test(line)) problems.push(`${relative(root, file)}:${i + 1}: emoji`);
  });
}

if (problems.length > 0) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log('style ok');
