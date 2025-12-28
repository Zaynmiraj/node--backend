import { config } from '../config';

// Landing page password (can be moved to env)
const LANDING_PASSWORD = 'nimion2025';

/**
 * Status information for the landing page
 */
export interface LandingPageStatus {
  database: boolean;
  redis: boolean;
  socket: boolean;
}

/**
 * Generate login page HTML with password modal
 */
export const getLoginPageHtml = (error?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nimion API - Login</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 40px;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(90deg, #00d4ff, #7c3aed, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .subtitle {
      color: rgba(255,255,255,0.5);
      font-size: 14px;
      margin-bottom: 28px;
    }
    .lock-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 20px;
      background: rgba(124,58,237,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lock-icon svg {
      width: 24px;
      height: 24px;
      stroke: #7c3aed;
    }
    form { width: 100%; }
    .input-group {
      margin-bottom: 16px;
      text-align: left;
    }
    .input-group label {
      display: block;
      color: rgba(255,255,255,0.6);
      font-size: 12px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .input-group input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: white;
      font-size: 15px;
      outline: none;
      transition: all 0.3s;
    }
    .input-group input:focus {
      border-color: #7c3aed;
      background: rgba(255,255,255,0.1);
    }
    .input-group input::placeholder {
      color: rgba(255,255,255,0.3);
    }
    .error {
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.3);
      color: #ef4444;
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #7c3aed, #5b21b6);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(124,58,237,0.4);
    }
  </style>
</head>
<body>
  <div class="modal">
    <div class="lock-icon">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>
    <h1 class="logo">Nimion API</h1>
    <p class="subtitle">Enter password to access dashboard</p>
    
    ${error ? `<div class="error">${error}</div>` : ''}
    
    <form method="POST" action="/">
      <div class="input-group">
        <label>Password</label>
        <input type="password" name="password" placeholder="Enter password" autofocus required>
      </div>
      <button type="submit">Unlock Dashboard</button>
    </form>
  </div>
</body>
</html>
  `;
};

/**
 * Verify landing page password
 */
export const verifyLandingPassword = (password: string): boolean => {
  return password === LANDING_PASSWORD;
};

/**
 * Generate the landing page HTML with status information
 */
export const getLandingPageHtml = (status?: LandingPageStatus): string => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

  // Default status if not provided
  const dbStatus = status?.database ?? true;
  const redisStatus = status?.redis ?? true;
  const socketStatus = status?.socket ?? true;

  const getStatusHtml = (isConnected: boolean) => {
    if (isConnected) {
      return `<span class="status-dot"></span> Connected`;
    }
    return `<span class="status-dot error"></span> Disconnected`;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nimion API Server</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 48px;
      max-width: 650px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; }
    .logo {
      font-size: 42px;
      font-weight: 700;
      background: linear-gradient(90deg, #00d4ff, #7c3aed, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .logout-btn {
      padding: 8px 16px;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      border-radius: 8px;
      font-size: 12px;
      transition: all 0.3s;
    }
    .logout-btn:hover { background: rgba(255,255,255,0.15); color: white; }
    .subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 16px;
      margin-bottom: 32px;
    }
    .section-title {
      color: rgba(255,255,255,0.4);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
      margin-top: 24px;
    }
    .section-title:first-of-type { margin-top: 0; }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .status-grid.three { grid-template-columns: repeat(3, 1fr); }
    .status-card {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .status-label {
      color: rgba(255,255,255,0.5);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .status-value {
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px rgba(16,185,129,0.6);
      animation: pulse 2s infinite;
    }
    .status-dot.error {
      background: #ef4444;
      box-shadow: 0 0 10px rgba(239,68,68,0.6);
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .links {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 24px;
    }
    .link-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #7c3aed, #5b21b6);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 500;
      font-size: 13px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .link-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(124,58,237,0.4);
    }
    .link-btn.secondary {
      background: rgba(255,255,255,0.1);
    }
    .link-btn.secondary:hover {
      background: rgba(255,255,255,0.15);
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    .version {
      margin-top: 28px;
      text-align: center;
      color: rgba(255,255,255,0.3);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="logo">Nimion API</h1>
        <p class="subtitle">Backend REST API Server with Real-time Support</p>
      </div>
      <a href="/?logout=1" class="logout-btn">Logout</a>
    </div>
    
    <div class="section-title">Server Info</div>
    <div class="status-grid">
      <div class="status-card">
        <div class="status-label">Status</div>
        <div class="status-value">
          <span class="status-dot"></span>
          Operational
        </div>
      </div>
      <div class="status-card">
        <div class="status-label">Environment</div>
        <div class="status-value">${config.env}</div>
      </div>
      <div class="status-card">
        <div class="status-label">Uptime</div>
        <div class="status-value">${uptimeStr}</div>
      </div>
      <div class="status-card">
        <div class="status-label">Port</div>
        <div class="status-value">${config.port}</div>
      </div>
    </div>
    
    <div class="section-title">Services</div>
    <div class="status-grid three">
      <div class="status-card">
        <div class="status-label">MySQL</div>
        <div class="status-value">${getStatusHtml(dbStatus)}</div>
      </div>
      <div class="status-card">
        <div class="status-label">Redis</div>
        <div class="status-value">${getStatusHtml(redisStatus)}</div>
      </div>
      <div class="status-card">
        <div class="status-label">Socket.io</div>
        <div class="status-value">${getStatusHtml(socketStatus)}</div>
      </div>
    </div>
    
    <div class="links">
      <a href="/api-docs" class="link-btn">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
        </svg>
        API Docs
      </a>
      <a href="/api/health" class="link-btn secondary">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z"/>
        </svg>
        Health
      </a>
      <a href="/api-docs.json" class="link-btn secondary">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
        </svg>
        OpenAPI
      </a>
    </div>
    
    <p class="version">v1.0.0 · Node ${process.version}</p>
  </div>
</body>
</html>
  `;
};

export default getLandingPageHtml;
