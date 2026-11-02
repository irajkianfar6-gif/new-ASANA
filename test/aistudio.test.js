const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

require('../scripts/aistudio-env.js');

test('aistudio-env sets default port 3000, host 0.0.0.0, and open scope all', () => {
  assert.equal(process.env.IFA_PORT, '3000');
  assert.equal(process.env.IFA_HOST, '0.0.0.0');
  assert.equal(process.env.IFA_OPEN_SCOPE, 'all');
});

test('aistudio-env strips X-Frame-Options from writeHead headers for iframe embedding', async () => {
  const srv = http.createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'X-Frame-Options': 'SAMEORIGIN',
    });
    res.end('ok');
  });
  await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve));
  const port = srv.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-frame-options'), null);
  } finally {
    await new Promise((resolve) => srv.close(resolve));
  }
});

test('Tri-Engine Web Intelligence (Tavily AI + Firecrawl v2 + Exa AI) & Tariff Hub endpoints', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ifa-tri-'));
  const port = 18200 + Math.floor(Math.random() * 500);
  const baseUrl = `http://127.0.0.1:${port}`;
  const srv = spawn(
    process.execPath,
    ['--experimental-sqlite', '--no-warnings', 'server.js'],
    {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        IFA_PORT: String(port),
        IFA_HOST: '127.0.0.1',
        IFA_DATA: tmpDir,
        IFA_OPEN_SCOPE: 'all',
        IFA_OPEN_ROLE: 'admin',
        IFA_AG_AUTO: '0',
        IFA_DTW_AUTO: '0',
      },
      stdio: ['ignore', 'ignore', 'inherit'],
    }
  );

  try {
    for (let i = 0; i < 50; i++) {
      try {
        const h = await fetch(`${baseUrl}/api/health`);
        if (h.ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 150));
    }

    const authRes = await fetch(`${baseUrl}/api/auth/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device: 'test_device_tri_engine_12345', label: 'test' }),
    });
    assert.equal(authRes.status, 200);
    const { token } = await authRes.json();
    const hdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    // 1. Verify /api/web/status reports all 3 engines configured and masked
    const stRes = await fetch(`${baseUrl}/api/web/status`, { headers: hdrs });
    assert.equal(stRes.status, 200);
    const st = await stRes.json();
    assert.equal(st.tv?.configured, true, 'Tavily AI should be configured');
    assert.equal(st.fc?.configured, true, 'Firecrawl should be configured');
    assert.equal(st.exa?.configured, true, 'Exa AI should be configured');
    assert.ok(st.tv.key.includes('…') && st.tv.key.length < 12, 'Tavily key must be masked');
    assert.ok(st.fc.key.includes('…') && st.fc.key.length < 12, 'Firecrawl key must be masked');
    assert.ok(st.exa.key.includes('…') && st.exa.key.length < 12, 'Exa key must be masked');

    // 2. Verify /api/web/tariffs returns 18 Iranian borders & 9 dynamic surcharge rules
    const tfRes = await fetch(`${baseUrl}/api/web/tariffs`, { headers: hdrs });
    assert.equal(tfRes.status, 200);
    const tf = await tfRes.json();
    assert.equal(tf.borders.length, 18, 'Should include all 18 Iranian international borders');
    assert.equal(tf.surcharges.items.length, 9, 'Should include 9 dynamic surcharge rules');
    const bazargan = tf.borders.find((b) => b.id === 'IR-BAZ');
    assert.ok(bazargan && bazargan.totalRoadUsd > 0, 'Bazargan border should have road total USD');
    const sarakhs = tf.borders.find((b) => b.id === 'IR-SRK');
    assert.ok(sarakhs && sarakhs.totalRailUsd > 0, 'Sarakhs border should have rail bogie/total USD');

    // 3. Verify WCO HS 2022 + EAEU FTA + Live Customs Verification
    const cuRes = await fetch(`${baseUrl}/api/web/tariffs/customs`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({ hs: '080251', desc: 'Pistachios in shell export tariff' }),
    });
    assert.equal(cuRes.status, 200);
    const cu = await cuRes.json();
    assert.equal(cu.ok, true);
    assert.equal(cu.eaeu?.prefPct, 0, 'HS 080251 should have 0% EAEU FTA preferential duty');
    assert.ok(cu.sources.length > 0, 'Customs verification should return live web sources');

    // 4. Verify Live Tri-Engine Tariff Scan (Tavily AI + Firecrawl v2 Search + Exa AI)
    const scanRes = await fetch(`${baseUrl}/api/web/tariffs/scan`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({
        mode: 'sea',
        pol: 'Shanghai',
        pod: 'Bandar Abbas',
        eq: '40HC',
        engines: ['tv', 'fc', 'exa'],
        force: true,
      }),
    });
    assert.equal(scanRes.status, 200);
    const scan = await scanRes.json();
    assert.equal(scan.ok, true);
    assert.equal(scan.engines?.tv?.ok, true, 'Tavily engine should succeed in scan');
    assert.equal(scan.engines?.fc?.ok, true, 'Firecrawl v2 Search engine should succeed in scan');
    assert.equal(scan.engines?.exa?.ok, true, 'Exa engine should succeed in scan');
    assert.ok(scan.sources.length >= 3, 'Tri-engine scan should aggregate verifiable web sources');
  } finally {
    srv.kill('SIGTERM');
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
});

