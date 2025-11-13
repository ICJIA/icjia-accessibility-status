#!/usr/bin/env node

/**
 * Docker Development Environment Startup Script
 * 
 * This script automates starting the Docker development environment.
 * It checks if Docker is running, then starts the dev stack with docker-compose.
 * 
 * Usage: yarn docker:dev
 */

const { execSync } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}\n`, 'blue');
}

function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkDockerDaemon() {
  try {
    execSync('docker ps', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function startDockerDev() {
  try {
    logSection('🐳 Starting Docker Development Environment');

    // Check if Docker is installed
    log('📋 Checking Docker installation...', 'yellow');
    if (!checkDocker()) {
      log('❌ Docker is not installed!', 'red');
      log('   Please install Docker from https://www.docker.com/products/docker-desktop', 'yellow');
      process.exit(1);
    }
    log('✅ Docker is installed\n', 'green');

    // Check if Docker daemon is running
    log('📋 Checking Docker daemon...', 'yellow');
    if (!checkDockerDaemon()) {
      log('❌ Docker daemon is not running!', 'red');
      log('   Please start Docker Desktop or the Docker daemon', 'yellow');
      process.exit(1);
    }
    log('✅ Docker daemon is running\n', 'green');

    // Start the development stack
    log('📋 Starting development stack...', 'yellow');
    log('   Running: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d\n', 'blue');
    
    execSync(
      'docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d',
      { stdio: 'inherit' }
    );

    logSection('✅ Docker Development Environment Started');

    log('🎉 Services are starting up. Please wait a moment for them to fully initialize.\n', 'green');
    
    log('📍 Access your services at:', 'bright');
    log('   Frontend:  http://localhost:5174', 'green');
    log('   Backend:   http://localhost:3001', 'green');
    log('   Redis:     localhost:6379\n', 'green');

    log('📚 Useful commands:', 'bright');
    log('   View logs:     yarn docker:logs', 'yellow');
    log('   Stop services: yarn docker:down', 'yellow');
    log('   Check status:  docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps\n', 'yellow');

    log('📖 Documentation:', 'bright');
    log('   See docs/deployment/docker/DOCKER_COMMANDS_REFERENCE.md for more commands', 'blue');
    log('   See docs/deployment/docker/DOCKER_SETUP_SUMMARY.md for setup overview\n', 'blue');

  } catch (error) {
    log(`\n❌ Error starting Docker development environment:`, 'red');
    log(`   ${error.message}\n`, 'red');
    process.exit(1);
  }
}

// Run the script
startDockerDev();

