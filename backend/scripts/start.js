#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Clinic Management System Backend...\n');

// Start all services concurrently
const services = [
  {
    name: 'API Gateway',
    command: 'node',
    args: ['services/gateway/server.js'],
    cwd: path.join(__dirname, '..')
  },
  {
    name: 'Clinic Service',
    command: 'node',
    args: ['services/clinic/server.js'],
    cwd: path.join(__dirname, '..')
  },
  {
    name: 'Files Service',
    command: 'node',
    args: ['services/files/server.js'],
    cwd: path.join(__dirname, '..')
  }
];

const processes = services.map(service => {
  console.log(`📦 Starting ${service.name}...`);
  
  const process = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'inherit',
    shell: true
  });
  
  process.on('error', (error) => {
    console.error(`❌ Error starting ${service.name}:`, error);
  });
  
  process.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ ${service.name} exited with code ${code}`);
    }
  });
  
  return { name: service.name, process };
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  
  processes.forEach(({ name, process }) => {
    console.log(`🛑 Stopping ${name}...`);
    process.kill('SIGTERM');
  });
  
  setTimeout(() => {
    console.log('🔴 Force stopping all services...');
    processes.forEach(({ process }) => {
      process.kill('SIGKILL');
    });
    process.exit(0);
  }, 5000);
});

console.log('\n✅ All services started successfully!');
console.log('🌐 API Gateway: http://localhost:3000');
console.log('🏥 Clinic Service: http://localhost:3001');
console.log('📁 Files Service: http://localhost:3002');
console.log('\n📝 Press Ctrl+C to stop all services');

