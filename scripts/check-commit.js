const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: e.stdout ? e.stdout.toString() : '', err: e.stderr ? e.stderr.toString() : e.message };
  }
}

function getStagedFiles() {
  const res = run('git diff --name-only --cached');
  if (res.ok) {
    return res.out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function getWorkingFiles() {
  const res = run('git status --porcelain');
  if (!res.ok) return [];
  return res.out.split(/\r?\n/).map(line => {
    if (!line) return null;
    return line.slice(3).trim();
  }).filter(Boolean);
}

const staged = getStagedFiles();
const filesToCheck = staged.length ? staged : getWorkingFiles();

console.log('\nCommit Checker — Análisis rápido antes de commitear');
if (!filesToCheck.length) {
  console.log('  • No hay archivos staged ni cambios detectados.');
} else {
  console.log(`  • Archivos analizados (${filesToCheck.length}):`);
  filesToCheck.forEach(f => console.log('    -', f));
}

const warnings = [];
const errors = [];

const badPatterns = [
  'node_modules', 'dist', 'build', '.env', '.env.local', '.DS_Store', '.sqlite', '.db', '.pem', '.key', '.p12', '.crt', '.log', '.zip', '.exe'
];

const largeThreshold = 5 * 1024 * 1024;

filesToCheck.forEach(file => {
  const lp = file.toLowerCase();
  for (const p of badPatterns) if (lp.includes(p)) {
    warnings.push({ file, reason: `Patrón sospechoso: ${p}` });
    break;
  }
  try {
    const full = path.resolve(process.cwd(), file);
    if (fs.existsSync(full)) {
      const st = fs.statSync(full);
      if (st.isFile() && st.size > largeThreshold) {
        warnings.push({ file, reason: `Archivo grande (${Math.round(st.size / 1024)} KB)` });
      }
      if (st.isDirectory()) {
        warnings.push({ file, reason: 'Es un directorio — revisa que no estés commiteando artefactos' });
      }
    }
  } catch (e) {
    warnings.push({ file, reason: `No se pudo analizar: ${e.message}` });
  }
});

console.log('\nChequeos de código: ejecutando linters y tests (puede tardar)');
console.log('  • Ejecutando `pnpm lint`...');
const lint = run('pnpm lint:ci');
if (lint.ok) {
  console.log('    ✔ Lint completado.');
} else {
  console.log('    ✖ Lint falló. Salida:');
  console.log(lint.out || lint.err);
  errors.push({ step: 'lint', info: lint.err || lint.out });
}

console.log('  • Ejecutando `pnpm test`...');
const test = run('pnpm test --colors=false --silent');
if (test.ok) {
  console.log('    ✔ Tests pasaron.');
} else {
  console.log('    ✖ Tests fallaron. Salida parcial:');
  console.log(test.out || test.err);
  errors.push({ step: 'test', info: test.err || test.out });
}

if (warnings.length) {
  console.log('\nSugerencias / advertencias sobre archivos:');
  warnings.forEach(w => console.log(`  - ${w.file}: ${w.reason}`));
} else {
  console.log('\nNo se encontraron advertencias de heurística sobre archivos.');
}

if (errors.length) {
  console.log('\nResultado: NO listo para commit — hay errores.');
  errors.forEach(e => console.log(`  - ${e.step}: ${String(e.info).slice(0, 1000)}`));
  process.exitCode = 2;
} else if (warnings.length) {
  console.log('\nResultado: Listo para commit con advertencias. Revise las sugerencias antes de commitear.');
  process.exitCode = 1;
} else {
  console.log('\nResultado: Listo para commit — lint y tests pasan, no se detectaron problemas.');
  process.exitCode = 0;
}
