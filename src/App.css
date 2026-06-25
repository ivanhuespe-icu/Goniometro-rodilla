@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

:root {
  --bg-deep: #0b0e12;
  --bg-panel: #12161c;
  --bg-panel-raised: #181d25;
  --line-hair: #262d38;
  --text-primary: #eef1f5;
  --text-secondary: #8b95a5;
  --accent-femur: #5ec8e8;
  --accent-tibia: #f5c84c;
  --accent-articular: #ff5d73;
  --accent-positive: #34d399;
  --font-display: 'IBM Plex Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  padding: 0;
  background: var(--bg-deep);
  color: var(--text-primary);
  font-family: var(--font-display);
  min-height: 100vh;
}

.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  border-bottom: 1px solid var(--line-hair);
  background: linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-deep) 100%);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  font-size: 28px;
  color: var(--accent-femur);
  line-height: 1;
}

.brand h1 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.01em;
}

.subtitle {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 6px;
  border: 1px solid var(--line-hair);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.btn:focus-visible {
  outline: 2px solid var(--accent-femur);
  outline-offset: 2px;
}

.btn-secondary {
  background: var(--bg-panel-raised);
  color: var(--text-primary);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--accent-femur);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  width: 100%;
}

.btn-ghost:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  padding: 24px 28px;
  align-items: start;
}

@media (max-width: 900px) {
  .app-main {
    grid-template-columns: 1fr;
  }
}

.canvas-panel {
  background: var(--bg-panel);
  border: 1px solid var(--line-hair);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480px;
}

.upload-zone {
  width: 100%;
  height: 480px;
  border: 1.5px dashed var(--line-hair);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.upload-zone:hover {
  border-color: var(--accent-femur);
  background: rgba(94, 200, 232, 0.04);
}

.upload-icon {
  font-size: 34px;
  color: var(--accent-femur);
  margin-bottom: 14px;
}

.upload-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
}

.upload-hint {
  font-size: 12.5px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  margin: 0;
}

.canvas-wrapper {
  border-radius: 6px;
  overflow: hidden;
  line-height: 0;
  box-shadow: 0 0 0 1px var(--line-hair);
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-card {
  background: var(--bg-panel);
  border: 1px solid var(--accent-femur);
  border-radius: 10px;
  padding: 18px;
}

.step-counter {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.step-label {
  font-size: 15.5px;
  font-weight: 600;
  margin: 0 0 8px;
}

.step-instruction {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0 0 14px;
}

.step-progress-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--line-hair);
}

.dot-filled {
  background: var(--accent-positive);
}

.steps-nav {
  background: var(--bg-panel);
  border: 1px solid var(--line-hair);
  border-radius: 10px;
  padding: 16px 16px 8px;
}

.steps-nav h3,
.results-card h3 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary);
  margin: 0 0 10px;
  font-weight: 600;
}

.steps-nav ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  padding: 9px 6px;
  border-radius: 6px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--line-hair);
}

.nav-item:last-child {
  border-bottom: none;
}

.nav-item:hover {
  background: var(--bg-panel-raised);
}

.nav-item.active {
  color: var(--text-primary);
  background: rgba(94, 200, 232, 0.08);
}

.nav-label {
  flex: 1;
  cursor: pointer;
}

.nav-clear {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
}

.nav-clear:hover {
  color: var(--accent-articular);
  background: var(--bg-panel-raised);
}

.nav-status {
  font-family: var(--font-mono);
  font-size: 11px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--line-hair);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-item.done .nav-status {
  color: var(--accent-positive);
  border-color: var(--accent-positive);
}

.results-card {
  background: var(--bg-panel);
  border: 1px solid var(--line-hair);
  border-radius: 10px;
  padding: 18px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid var(--line-hair);
}

.result-row:last-of-type {
  border-bottom: none;
}

.result-row.subtle .result-value,
.result-row.subtle .result-label {
  color: var(--text-secondary);
}

.result-label {
  font-size: 12.5px;
  color: var(--text-primary);
  max-width: 60%;
}

.result-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-femur);
}

.results-note {
  font-size: 11.5px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--line-hair);
}

.app-footer {
  padding: 14px 28px;
  font-size: 11.5px;
  color: var(--text-secondary);
  border-top: 1px solid var(--line-hair);
  text-align: center;
}
