// launcher-simple.js

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// path for backend and frontend

const backendPath = path.join(__dirname, 'scribble-backend');
const frontendPath = path.join(__dirname, 'scribble-frontend');

// script to run for backend and frontend together

const BACKEND_SCRIPT = 'dev';
const FRONTEND_SCRIPT = 'dev'; 

function launch(name, cwd, script) {
    console.log(`🚀 Démarrage de ${name} avec "npm run ${script}"...`);
    
    const proc = spawn('npm', ['run', script], {
        cwd: cwd,
        shell: true,
        stdio: 'pipe'
    });
    
    proc.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
    });
    
    proc.stderr.on('data', (data) => {
        console.error(`[${name} ERR] ${data.toString().trim()}`);
    });
    
    proc.on('error', (err) => {
        console.error(`❌ Erreur ${name}:`, err.message);
    });
    
    return proc;
}

console.log('========================================');
console.log('   🚀 Lancement de Scribble App');
console.log('========================================\n');

// check if backend and frontend directories exist

if (!fs.existsSync(backendPath)) {
    console.error(`❌ Dossier backend non trouvé: ${backendPath}`);
    process.exit(1);
}
if (!fs.existsSync(frontendPath)) {
    console.error(`❌ Dossier frontend non trouvé: ${frontendPath}`);
    process.exit(1);
}

console.log('✅ Dossiers trouvés');
console.log(`📁 Backend: ${backendPath}`);
console.log(`📁 Frontend: ${frontendPath}`);
console.log(`📝 Backend script: npm run ${BACKEND_SCRIPT}`);
console.log(`📝 Frontend script: npm run ${FRONTEND_SCRIPT}`);
console.log('');

// launch backend and frontend services together

const backend = launch('Backend', backendPath, BACKEND_SCRIPT);
const frontend = launch('Frontend', frontendPath, FRONTEND_SCRIPT);

console.log('');
console.log('✅ Application démarrée !');
console.log('🌐 Frontend: http://localhost:5173');
console.log('🔧 Backend:  http://localhost:3001');


process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt des services...');
    backend.kill();
    frontend.kill();
    process.exit();
});