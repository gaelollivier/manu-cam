const fetch = require('node-fetch');
const fs = require('fs');
const { spawn } = require('child_process');

const baseURL = 'http://localhost:3000/api';
// const baseURL = 'https://manu-cam.vercel.app/api';

const programURL = `${baseURL}/pi-program`;
const logsURL = `${baseURL}/pi-logs-upload`;

// const piProgramPath = `${__dirname}/pi-program`;
const piProgramPath = `${__dirname}/pi-program-test`;

let currentProcess = null;
let currentProgramVersion = null;
let logs = '';

function logInfo(...messages) {
  console.log(...messages);
  logs += messages.join(' ') + '\n';
}

function logRaw(message) {
  console.log(message);
  logs += message;
}

async function sendLogs() {
  const res = await fetch(logsURL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.MANUCAM_AUTH}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ logs }),
  });
  if (res.status === 200) {
    logs = '';
  }
}

async function killCurrentProcess() {
  if (!currentProcess) {
    return;
  }

  return new Promise((resolve) => {
    logInfo('Killing current process...');
    currentProcess.on('exit', () => {
      logInfo('Process stopped');
      resolve();
    });
    currentProcess.kill('SIGKILL');
  });
}

async function refreshProgram() {
  // Retrieve latest program
  const { piProgram } = await fetch(programURL, {
    headers: { authorization: `Bearer ${process.env.MANUCAM_AUTH}` },
  }).then((res) => res.json());

  if (piProgram.version === currentProgramVersion) {
    return;
  }

  logInfo('New program version received!', piProgram.version);

  await killCurrentProcess();

  currentProgramVersion = piProgram.version;

  // Copy files to disk
  piProgram.files.forEach((file) => {
    fs.writeFileSync(`${piProgramPath}/${file.filename}`, file.content, {
      encoding: 'utf-8',
      mode: 0o777,
    });
  });

  // Run start.sh
  logInfo('Starting new Pi Program:', `${piProgramPath}/start.sh`);
  currentProcess = spawn(`${piProgramPath}/start.sh`);

  currentProcess.stdout.on('data', (data) => {
    logRaw(`[pi-program] ${data.toString()}`);
  });

  currentProcess.stderr.on('data', (data) => {
    logRaw(`[pi-program error] ${data.toString()}`);
  });

  currentProcess.on('error', (err) => {
    logInfo('Process failed', err);
  });
}

let refreshing = false;

// Poll API for new programm version
setInterval(async () => {
  if (refreshing) {
    return;
  }

  refreshing = true;

  await refreshProgram();
  await sendLogs();

  refreshing = false;
}, 5000);
