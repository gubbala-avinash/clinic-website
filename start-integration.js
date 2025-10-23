#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Clinic Management System Integration...\n');

// Start backend services
console.log('📦 Starting Backend Services...');
const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for backend to start
setTimeout(() => {
  console.log('\n🌐 Starting Frontend...');
  
  // Start frontend
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    
    console.log('🛑 Stopping Backend...');
    backendProcess.kill('SIGTERM');
    
    console.log('🛑 Stopping Frontend...');
    frontendProcess.kill('SIGTERM');
    
    setTimeout(() => {
      console.log('🔴 Force stopping all services...');
      backendProcess.kill('SIGKILL');
      frontendProcess.kill('SIGKILL');
      process.exit(0);
    }, 5000);
  });

  console.log('\n✅ Integration started successfully!');
  console.log('🌐 Frontend: http://localhost:5173');
  console.log('🚪 Backend API: http://localhost:3000');
  console.log('🏥 Clinic Service: http://localhost:3001');
  console.log('📁 Files Service: http://localhost:3002');
  console.log('\n📝 Press Ctrl+C to stop all services');

}, 3000);

backendProcess.on('error', (error) => {
  console.error('❌ Error starting backend:', error);
});

backendProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend exited with code ${code}`);
  }
});
