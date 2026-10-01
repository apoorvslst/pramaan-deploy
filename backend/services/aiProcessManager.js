/**
 * PRAMAN Backend Engine — Embedded AI Microservice Process Manager
 *
 * Automatically spawns, monitors, and manages the Python FastAPI AI microservice
 * (:8000) as a managed child process within the unified Backend deployment.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiProcess = null;

export async function checkAIHealth(baseUrl = 'http://127.0.0.1:8000') {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function startAIService() {
  // If an external AI service URL is explicitly configured and alive, use it
  if (process.env.AI_SERVICE_URL && process.env.AI_SERVICE_URL !== 'http://localhost:8000' && process.env.AI_SERVICE_URL !== 'http://127.0.0.1:8000') {
    console.log(`\x1b[36m[AI Manager]\x1b[0m Using external AI service at ${process.env.AI_SERVICE_URL}`);
    return;
  }

  // Check if AI service is already running on port 8000
  const isAlive = await checkAIHealth('http://127.0.0.1:8000');
  if (isAlive) {
    console.log('\x1b[32m[AI Manager]\x1b[0m AI microservice is already active on http://127.0.0.1:8000');
    return;
  }

  // Locate AI directory (either backend/ai or ../ai)
  let aiDir = path.resolve(__dirname, '../ai');
  if (!fs.existsSync(aiDir)) {
    aiDir = path.resolve(process.cwd(), 'ai');
  }
  if (!fs.existsSync(aiDir)) {
    aiDir = path.resolve(process.cwd(), '../ai');
  }

  if (!fs.existsSync(aiDir)) {
    console.warn('\x1b[33m[AI Manager Warning]\x1b[0m AI microservice directory not found. Running in standalone mode.');
    return;
  }

  console.log(`\x1b[36m[AI Manager]\x1b[0m Launching embedded Python AI service from ${aiDir}...`);

  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const args = ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'];

  try {
    aiProcess = spawn(pythonCmd, args, {
      cwd: aiDir,
      env: {
        ...process.env,
        PORT: '8000',
        HOST: '127.0.0.1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    aiProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('GET /health')) {
        console.log(`\x1b[35m[AI Service]\x1b[0m ${msg}`);
      }
    });

    aiProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('INFO:')) {
        console.warn(`\x1b[33m[AI Service Log]\x1b[0m ${msg}`);
      }
    });

    aiProcess.on('exit', (code, signal) => {
      console.log(`\x1b[33m[AI Manager]\x1b[0m AI service process exited with code ${code} / signal ${signal}`);
      aiProcess = null;
    });

    aiProcess.on('error', (err) => {
      console.warn(`\x1b[33m[AI Manager Warning]\x1b[0m Could not spawn Python AI process (${err.message}). Using native JS fallback.`);
      aiProcess = null;
    });

    // Wait a brief moment for startup
    setTimeout(async () => {
      const alive = await checkAIHealth('http://127.0.0.1:8000');
      if (alive) {
        console.log('\x1b[32m[AI Manager]\x1b[0m Embedded Python AI microservice is ready on http://127.0.0.1:8000');
      }
    }, 2500);

  } catch (err) {
    console.warn(`\x1b[33m[AI Manager Warning]\x1b[0m Failed to launch AI process: ${err.message}`);
  }
}

export function stopAIService() {
  if (aiProcess) {
    console.log('\x1b[33m[AI Manager]\x1b[0m Stopping AI microservice process...');
    try {
      aiProcess.kill('SIGTERM');
    } catch {
      // Ignore
    }
    aiProcess = null;
  }
}
