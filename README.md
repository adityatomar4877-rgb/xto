# XTO — Cyber Decision Digital Twin
### MUJ HACKX 4.0 // CyberSecurity & Defence System // Problem Statement #13
> **"Simulate the attack. Change the defense. Prove what stopped it."**

---

## 1. Independence & Portability
**XTO is 100% standalone and decoupled.** It has **zero dependencies** on any outside repository or parent folder.
You can move, copy, or deploy the `/xto` folder anywhere as an independent standalone project.

```
/xto
  ├── backend/               # Python 3.11+ / FastAPI / NetworkX / Pydantic
  │   ├── app/               # FastAPI routes, schemas, and dependencies
  │   ├── xto_core/          # PS #13 Graph, Threat, Simulation, Sandbox & Proof Engines
  │   ├── tests/             # Pytest test suite
  │   ├── requirements.txt   # PyPI dependencies
  │   └── .env.example
  │
  ├── frontend/              # React 19 / TypeScript / Vite / TailwindCSS
  │   ├── src/               # Cyber War Room UI, 3D Topology, 11 dedicated views
  │   ├── package.json       # Standard npm dependencies
  │   └── vite.config.ts
  │
  └── README.md
```

---

## 2. Quick Start Guide

### Step 1: Run Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 9229 --reload
```
- **Backend API**: `http://127.0.0.1:9229`
- **Interactive Swagger Docs**: `http://127.0.0.1:9229/docs`
- **Health Check**: `http://127.0.0.1:9229/api/health`

---

### Step 2: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
- **XTO Cyber War Room**: `http://localhost:5174`

---

### Alternative: Run with Docker (Full Stack)
```bash
# Start both backend (FastAPI) and frontend (Nginx) in Docker:
docker compose up -d

# View running container status & logs:
docker compose ps
docker compose logs -f

# Stop containers:
docker compose down
```
- **XTO Cyber War Room**: `http://localhost:5174`
- **Backend API & Swagger Docs**: `http://localhost:9229/docs`
- **MITRE ATT&CK Framework API**: `http://localhost:9229/api/mitre/techniques`

---

## 3. Core Capabilities & Architecture

| Engine | Core Function |
| :--- | :--- |
| **Security Digital Twin** | Queryable, typed multigraph of assets, directional reachability, identities, privileges, credentials, and controls. |
| **Threat Vector Engine** | 12 first-class threat vectors (Phishing, Stolen Creds, Exposed VPN, Vulnerable App, Supply Chain, Insider, etc.) with prerequisite evaluation. |
| **Agent-Based Simulator** | Autonomous adversary agent evaluating reachable transitions, prerequisite compliance, technique selection, and step-by-step traces. |
| **Evidence-First Architecture** | Every attack move is verified with epistemic classification (`FACT`, `ASSUMPTION`, `INFERENCE`). Never hallucinated. |
| **Defense Sandbox (Core USP)** | Ephemeral in-memory cloning of the digital twin allowing defenders to test virtual controls (`MFA`, `NETWORK_SEGMENTATION`, `EDR`, `LEAST_PRIVILEGE`, `HOST_ISOLATION`) without mutating baseline. |
| **Decision Proof (Core USP)** | Mathematical and causal Before vs. After proof quantifying eliminated attack paths, protected critical assets, and blast-radius reduction. |
| **Blast Radius Engine** | Recursive 1-hop, k-hop, and critical crown jewel impact modeling. |
| **Remediation Prioritisation** | Prioritizes interventions by critical paths eliminated and blast radius reduction rather than raw CVSS counts alone. |
| **Continuous Synchronization** | Versioned environment snapshots, drift detection, and automated attack-path invalidation. |

---

## 4. Live Hackathon Demo Flow (24 Steps)
1. **Command Center** (`/command`): View 5 core questions (Exposed paths, blast radius, chokepoint, top remediation, sync).
2. **Digital Twin** (`/twin`): Inspect `WS-ENG-04` (DevOps Laptop) with cached Domain Admin credentials.
3. **Attack Simulation** (`/simulation`): Select `THREAT-PHISH` + `RANSOMWARE` + Objective = `VAULT-BACKUP-01`.
4. **Watch Simulation**: Step through Foothold $\rightarrow$ Credential Access (LSASS) $\rightarrow$ Lateral Movement (SMB) $\rightarrow$ Crown Jewel breach.
5. **Inspect Evidence**: View `FACT` evidence of unauthenticated RPC and dumped NTLM hashes.
6. **Launch Defense Sandbox** (`/defense`): Toggle virtual controls `Air-Gap Backup Vault` and `Enforce MFA on Admin Sessions`.
7. **Re-Simulate Attack**: Attacker is halted at the boundary; lateral movement fails.
8. **Decision Proof** (`/decision-proof`): View Before vs. After proof: **17 critical paths eliminated**, Crown Jewels reachable: **4 $\rightarrow$ 2**, Blast Radius: **61% $\rightarrow$ 14%**.
9. **Remediation** (`/remediation`): View #1 ranked recommendation (Micro-Segment Backup Vault).
10. **Sync** (`/sync`): Trigger live sync and observe zero stale attack paths.
