const { execSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CONTRACT_PATH = path.join(ROOT, 'contracts', 'src', 'AgentRegistry.sol');
const REPORT_DIR = path.join(ROOT, 'contracts', 'reports', 'security');
const SLITHER_REPORT_PATH = path.join(REPORT_DIR, 'slither.json');
const MYTHRIL_REPORT_PATH = path.join(REPORT_DIR, 'mythril.json');
const SUMMARY_PATH = path.join(REPORT_DIR, 'README.md');
const SOLC_VERSION = '0.8.24';
const SEVERITY_ORDER = ['Low', 'Medium', 'High', 'Critical'];
const DEFAULT_FAIL_ON_SEVERITY = 'Low';

const KNOWN_SLITHER_NOISE_RULES = [
  {
    ruleId: 'slither-weak-prng-tostring',
    check: 'weak-prng',
    locations: new Set(['share/contracts/src/AgentRegistry.sol#L135-L155']),
    classification: 'false-positive',
    rationale: 'Modulo arithmetic in _toString is decimal conversion, not entropy or randomness.'
  },
  {
    ruleId: 'slither-incorrect-equality-tostring',
    check: 'incorrect-equality',
    locations: new Set(['share/contracts/src/AgentRegistry.sol#L135-L155']),
    classification: 'false-positive',
    rationale: 'Strict equality in _toString is deterministic integer formatting logic.'
  },
  {
    ruleId: 'slither-timestamp-metadata-paths',
    check: 'timestamp',
    locations: new Set([
      'share/contracts/src/AgentRegistry.sol#L23-L41',
      'share/contracts/src/AgentRegistry.sol#L43-L54',
      'share/contracts/src/AgentRegistry.sol#L56-L65',
      'share/contracts/src/AgentRegistry.sol#L67-L78',
      'share/contracts/src/AgentRegistry.sol#L84-L92',
      'share/contracts/src/AgentRegistry.sol#L94-L115',
      'share/contracts/src/AgentRegistry.sol#L117-L124',
      'share/contracts/src/AgentRegistry.sol#L130-L133',
      'share/contracts/src/AgentRegistry.sol#L135-L155'
    ]),
    classification: 'accepted-low-risk',
    rationale: 'Current timestamp usage is limited to metadata serialization and presence checks, not economic or privilege-sensitive timing.'
  }
];

const KNOWN_MYTHRIL_NOISE_RULES = [
  {
    ruleId: 'mythril-swc116-known-sourcemaps',
    swcID: 'SWC-116',
    severity: 'Low',
    sourceMaps: new Set(['6220:1:2', '6294:1:2', '6416:1:2', '10214:1:2']),
    classification: 'accepted-low-risk',
    rationale: 'Known low-severity timestamp dependence findings map to current metadata-only timestamp usage.'
  }
];

function run(command, description, options = {}) {
  console.log(`\n[audit] ${description}`);

  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8'
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  const reportAvailable =
    options.reportPath &&
    fs.existsSync(options.reportPath) &&
    fs.statSync(options.reportPath).size > 0;

  if (result.status === 0) {
    return;
  }

  if (reportAvailable) {
    console.warn(`[audit] ${description} exited with status ${result.status}, but a report was generated. Treating this as analysis findings, not execution failure.`);
    return;
  }

  const errorDetails = result.stderr || result.stdout || `Command exited with status ${result.status}`;
  throw new Error(errorDetails.trim());
}

function ensureDockerDaemon() {
  try {
    execSync('docker info', {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf8'
    });
  } catch (error) {
    console.error('\n[audit] Docker CLI is available, but the Docker daemon is not reachable.');
    console.error('[audit] Start Docker Desktop or another Docker daemon and rerun `npm run audit:contracts`.');
    if (error instanceof Error && error.message) {
      console.error(`[audit] Docker error: ${error.message.split('\n')[0]}`);
    }
    process.exit(1);
  }
}

function ensurePaths() {
  if (!fs.existsSync(CONTRACT_PATH)) {
    console.error(`[audit] Contract not found: ${CONTRACT_PATH}`);
    process.exit(1);
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true });

  for (const reportPath of [SLITHER_REPORT_PATH, MYTHRIL_REPORT_PATH, SUMMARY_PATH]) {
    if (fs.existsSync(reportPath)) {
      fs.rmSync(reportPath, { force: true });
    }
  }
}

function tryReadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function normalizeSeverity(rawSeverity) {
  const normalized = String(rawSeverity || '').trim().toLowerCase();

  if (normalized === 'critical') {
    return 'Critical';
  }

  if (normalized === 'high') {
    return 'High';
  }

  if (normalized === 'medium') {
    return 'Medium';
  }

  if (normalized === 'low') {
    return 'Low';
  }

  return 'Unknown';
}

function getFailOnSeverity() {
  const configuredSeverity = normalizeSeverity(process.env.AUDIT_FAIL_ON_SEVERITY || DEFAULT_FAIL_ON_SEVERITY);

  if (configuredSeverity === 'Unknown') {
    console.warn(
      `[audit] Unsupported AUDIT_FAIL_ON_SEVERITY value "${process.env.AUDIT_FAIL_ON_SEVERITY}". Falling back to ${DEFAULT_FAIL_ON_SEVERITY}.`
    );
    return DEFAULT_FAIL_ON_SEVERITY;
  }

  return configuredSeverity;
}

function isSeverityAtLeast(severity, minimumSeverity) {
  const normalizedSeverity = normalizeSeverity(severity);
  const normalizedMinimumSeverity = normalizeSeverity(minimumSeverity);

  if (normalizedSeverity === 'Unknown' || normalizedMinimumSeverity === 'Unknown') {
    return true;
  }

  return SEVERITY_ORDER.indexOf(normalizedSeverity) >= SEVERITY_ORDER.indexOf(normalizedMinimumSeverity);
}

function getSlitherDetectors() {
  const report = tryReadJson(SLITHER_REPORT_PATH);
  const detectors = report?.results?.detectors;

  if (!Array.isArray(detectors)) {
    return [];
  }

  return detectors;
}

function getMythrilIssues() {
  const report = tryReadJson(MYTHRIL_REPORT_PATH);
  const issues = Array.isArray(report)
    ? report.flatMap((entry) => (Array.isArray(entry?.issues) ? entry.issues : []))
    : report?.issues;

  if (!Array.isArray(issues)) {
    return [];
  }

  return issues;
}

function groupFindingsBy(items, keySelector) {
  const counts = new Map();

  for (const item of items) {
    const key = keySelector(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function classifySlitherFindings(detectors) {
  const accepted = [];
  const actionable = [];

  for (const detector of detectors) {
    const location = detector.first_markdown_element || 'unknown-location';
    const rule = KNOWN_SLITHER_NOISE_RULES.find(
      (candidate) => candidate.check === detector.check && candidate.locations.has(location)
    );

    const finding = {
      tool: 'Slither',
      identifier: detector.check || 'unknown',
      severity: normalizeSeverity(detector.impact),
      location,
      summary: detector.description?.trim() || 'No description available'
    };

    if (rule) {
      accepted.push({
        ...finding,
        ruleId: rule.ruleId,
        classification: rule.classification,
        rationale: rule.rationale
      });
      continue;
    }

    actionable.push(finding);
  }

  return { accepted, actionable };
}

function classifyMythrilFindings(issues) {
  const accepted = [];
  const actionable = [];

  for (const issue of issues) {
    const sourceMap = issue.locations?.[0]?.sourceMap || 'unknown-location';
    const rule = KNOWN_MYTHRIL_NOISE_RULES.find(
      (candidate) =>
        candidate.swcID === issue.swcID &&
        candidate.severity === issue.severity &&
        candidate.sourceMaps.has(sourceMap)
    );

    const finding = {
      tool: 'Mythril',
      identifier: issue.swcID || issue.swcTitle || 'unknown',
      severity: normalizeSeverity(issue.severity),
      location: sourceMap,
      summary: issue.description?.head || issue.swcTitle || 'No description available'
    };

    if (rule) {
      accepted.push({
        ...finding,
        ruleId: rule.ruleId,
        classification: rule.classification,
        rationale: rule.rationale
      });
      continue;
    }

    actionable.push(finding);
  }

  return { accepted, actionable };
}

function analyzeReports() {
  const slitherDetectors = getSlitherDetectors();
  const mythrilIssues = getMythrilIssues();
  const slither = classifySlitherFindings(slitherDetectors);
  const mythril = classifyMythrilFindings(mythrilIssues);
  const failOnSeverity = getFailOnSeverity();
  const blocking = [];
  const nonBlocking = [];

  for (const finding of [...slither.actionable, ...mythril.actionable]) {
    if (isSeverityAtLeast(finding.severity, failOnSeverity)) {
      blocking.push(finding);
      continue;
    }

    nonBlocking.push(finding);
  }

  return {
    failOnSeverity,
    slitherRawCount: slitherDetectors.length,
    mythrilRawCount: mythrilIssues.length,
    accepted: [...slither.accepted, ...mythril.accepted],
    actionable: [...slither.actionable, ...mythril.actionable],
    blocking,
    nonBlocking
  };
}

function summarizeAcceptedFindings(acceptedFindings) {
  if (acceptedFindings.length === 0) {
    return ['- None'];
  }

  const grouped = groupFindingsBy(acceptedFindings, (finding) => {
    return [
      finding.tool,
      finding.identifier,
      finding.ruleId,
      finding.classification,
      finding.rationale
    ].join('|');
  });

  const lines = [];
  for (const [groupKey, count] of grouped) {
    const [tool, identifier, ruleId, classification, rationale] = groupKey.split('|');
    lines.push(
      `- ${tool}/${identifier}: ${count} (${classification}; rule ${ruleId})`,
      `  rationale: ${rationale}`
    );
  }

  return lines;
}

function summarizeActionableFindings(actionableFindings) {
  if (actionableFindings.length === 0) {
    return ['- None'];
  }

  return actionableFindings.map((finding) => {
    return `- ${finding.tool}/${finding.identifier} (${finding.severity}) at ${finding.location}: ${finding.summary}`;
  });
}

function summarizeRawCounts(analysis) {
  const lines = [
    `- Slither raw findings: ${analysis.slitherRawCount}`,
    `- Mythril raw findings: ${analysis.mythrilRawCount}`,
    `- Accepted known noise: ${analysis.accepted.length}`,
    `- Actionable findings: ${analysis.actionable.length}`,
    `- Blocking findings: ${analysis.blocking.length}`,
    `- Non-blocking findings: ${analysis.nonBlocking.length}`,
    `- Fail on severity: ${analysis.failOnSeverity}`
  ];

  const acceptedByTool = groupFindingsBy(analysis.accepted, (finding) => finding.tool);
  for (const [tool, count] of acceptedByTool) {
    lines.push(`- Accepted/${tool}: ${count}`);
  }

  const blockingBySeverity = groupFindingsBy(analysis.blocking, (finding) => finding.severity);
  for (const severity of SEVERITY_ORDER) {
    if (blockingBySeverity.has(severity)) {
      lines.push(`- Blocking/${severity}: ${blockingBySeverity.get(severity)}`);
    }
  }

  const nonBlockingBySeverity = groupFindingsBy(analysis.nonBlocking, (finding) => finding.severity);
  for (const severity of SEVERITY_ORDER) {
    if (nonBlockingBySeverity.has(severity)) {
      lines.push(`- Non-blocking/${severity}: ${nonBlockingBySeverity.get(severity)}`);
    }
  }

  return lines;
}

function writeSummary(analysis) {
  const generatedAt = new Date().toISOString();
  const content = [
    '# Contract Security Audit Reports',
    '',
    `Generated at: ${generatedAt}`,
    '',
    'Summary:',
    ...summarizeRawCounts(analysis),
    '',
    'Accepted Known Noise:',
    ...summarizeAcceptedFindings(analysis.accepted),
    '',
    'Blocking Findings:',
    ...summarizeActionableFindings(analysis.blocking),
    '',
    'Non-blocking Findings:',
    ...summarizeActionableFindings(analysis.nonBlocking),
    '',
    'Artifacts:',
    '- slither.json',
    '- mythril.json',
    '',
    'Policy:',
    '- Raw JSON reports remain untouched.',
    '- Only findings matched by exact rule ids and source locations are classified as accepted noise.',
    `- Unmatched findings with severity >= ${analysis.failOnSeverity} cause \`npm run audit:contracts\` to fail after generating the reports.`,
    '- Unknown severities are treated as blocking.',
    '',
    'Reference:',
    '- docs/F1-05-Contract-Audit-Triage.md',
    '',
    'These files are generated by `npm run audit:contracts` and by the GitHub Actions workflow `.github/workflows/contract-audit.yml`.'
  ].join('\n');

  fs.writeFileSync(SUMMARY_PATH, content, 'utf8');
}

function main() {
  ensurePaths();
  ensureDockerDaemon();

  const dockerMount = `"${ROOT}:/share"`;
  const contractInContainer = '/share/contracts/src/AgentRegistry.sol';
  const slitherReportInContainer = '/share/contracts/reports/security/slither.json';
  const mythrilReportInContainer = '/share/contracts/reports/security/mythril.json';

  run(
    `docker run --rm -v ${dockerMount} trailofbits/eth-security-toolbox /bin/bash -lc "solc-select install ${SOLC_VERSION} && solc-select use ${SOLC_VERSION} && slither ${contractInContainer} --exclude-dependencies --json ${slitherReportInContainer}"`,
    'Running Slither static analysis',
    { reportPath: SLITHER_REPORT_PATH }
  );

  run(
    `docker run --rm -v ${dockerMount} --entrypoint /bin/sh mythril/myth -lc "myth analyze ${contractInContainer} --solv ${SOLC_VERSION} --execution-timeout 180 -o jsonv2 > ${mythrilReportInContainer}"`,
    'Running Mythril symbolic analysis',
    { reportPath: MYTHRIL_REPORT_PATH }
  );

  const analysis = analyzeReports();

  writeSummary(analysis);

  console.log('\n[audit] Reports written to contracts/reports/security');

  if (analysis.blocking.length > 0) {
    console.error(`[audit] Blocking findings detected: ${analysis.blocking.length} (threshold: ${analysis.failOnSeverity})`);
    process.exit(1);
  }

  if (analysis.nonBlocking.length > 0) {
    console.warn(`[audit] Non-blocking findings detected below threshold ${analysis.failOnSeverity}: ${analysis.nonBlocking.length}`);
  }

  console.log(
    `[audit] Audit gate passed with threshold ${analysis.failOnSeverity}. Accepted known noise: ${analysis.accepted.length}, unmatched non-blocking findings: ${analysis.nonBlocking.length}.`
  );
}

main();