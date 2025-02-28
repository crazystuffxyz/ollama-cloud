const express = require('express');
const { exec, spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 11434;

// Check if Ollama is installed, and install if not
function checkAndInstallOllama() {
  return new Promise((resolve, reject) => {
    exec('which ollama', (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log("Ollama not found. Downloading and installing for Linux...");
        // Replace the URL and installation command below with the actual install script/command for Ollama
        exec('curl -L https://ollama.example.com/install.sh | bash', (installErr, installOut, installErrOut) => {
          if (installErr) {
            console.error("Installation failed:", installErrOut);
            return reject(installErr);
          }
          console.log("Ollama installed successfully.");
          resolve();
        });
      } else {
        console.log("Ollama is already installed.");
        resolve();
      }
    });
  });
}

// Spawn the deepseek process via Ollama
function startDeepseek() {
  console.log("Starting deepseek-r1:1.5b...");
  const deepseekProc = spawn('ollama', ['run', 'deepseek-r1:1.5b']);

  deepseekProc.stdout.on('data', (data) => {
    console.log(`Deepseek stdout: ${data}`);
  });

  deepseekProc.stderr.on('data', (data) => {
    console.error(`Deepseek stderr: ${data}`);
  });

  deepseekProc.on('close', (code) => {
    console.log(`Deepseek process exited with code ${code}`);
  });

  return deepseekProc;
}

// Set up Express to proxy API calls once deepseek is running
function setupProxy() {
  // Here, we assume deepseek exposes an API on a certain port or endpoint
  // Adjust target URL as needed (e.g., if deepseek runs on localhost:PORT_DEEPSEEK)
  const proxyOptions = {
    target: 'http://localhost:YOUR_DEEPSEEK_PORT',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // Remove /api prefix if necessary
    },
  };

  // Proxy all calls under /api to the deepseek service
  app.use('/api', createProxyMiddleware(proxyOptions));

  app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
  });
}

// Main initialization function
async function initService() {
  try {
    await checkAndInstallOllama();
    // Start deepseek – you might want to wait for it to be fully up before proxying
    startDeepseek();
    // If deepseek needs time to initialize, you might add a delay or readiness check here.
    // For example, wait a few seconds or poll an endpoint.
    setTimeout(setupProxy, 5000); // delay 5 seconds before starting the proxy server
  } catch (err) {
    console.error("Error during service initialization:", err);
    process.exit(1);
  }
}

initService();
