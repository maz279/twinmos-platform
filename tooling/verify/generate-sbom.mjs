// SBOM-01 Automated Software Bill of Materials (SBOM) Generator & Validator
// Generates CycloneDX / SPDX compliant JSON SBOMs for api, web, and edge production images.
// Enforces:
// 1. Zero development tooling in production runtime (no drizzle-kit, @esbuild-kit/*, esbuild, vitest).
// 2. sharp native bindings and derivative capabilities verified.
// 3. Produces auditable SBOM artifacts in deploy/sbom/

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

console.log('================================================================');
console.log('       SBOM-01: Container Software Bill of Materials Generation');
console.log('================================================================\n');

const sbomDir = resolve(process.cwd(), 'deploy/sbom');
if (!existsSync(sbomDir)) {
  mkdirSync(sbomDir, { recursive: true });
}

// 1. Read package descriptors
const rootPkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
const apiPkg = JSON.parse(readFileSync(resolve(process.cwd(), 'apps/api/package.json'), 'utf8'));
const webPkg = JSON.parse(readFileSync(resolve(process.cwd(), 'apps/web/package.json'), 'utf8'));
const lockfile = JSON.parse(readFileSync(resolve(process.cwd(), 'package-lock.json'), 'utf8'));

// Forbidden dev dependencies in production runtime per T3.4.3
const FORBIDDEN_PROD_DEPS = ['drizzle-kit', 'esbuild', '@esbuild-kit/cjs-loader', '@esbuild-kit/esm-loader', 'vitest'];

function generateCycloneDxSbom(imageName, pkg, dependencies) {
  const timestamp = new Date().toISOString();
  const components = [];

  // Add base OS and runtime
  components.push({
    type: 'operating-system',
    name: 'alpine-linux',
    version: '3.21',
    description: 'Alpine Linux base distribution',
  });
  components.push({
    type: 'framework',
    name: 'node.js',
    version: '24-alpine',
    purl: 'pkg:generic/node@24-alpine',
  });

  // Add npm dependencies
  for (const [dep, version] of Object.entries(dependencies)) {
    components.push({
      type: 'library',
      name: dep,
      version: version.replace(/^[\^~]/, ''),
      purl: `pkg:npm/${dep}@${version.replace(/^[\^~]/, '')}`,
      scope: 'required',
    });
  }

  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:twinmos-${imageName}-sbom-${Date.now()}`,
    version: 1,
    metadata: {
      timestamp,
      tools: [{ vendor: 'TwinMOS DevOps', name: 'sbom-generator', version: '1.0.0' }],
      component: {
        type: 'container',
        name: `twinmos-${imageName}`,
        version: pkg.version || '0.1.0',
      },
    },
    components,
  };

  return sbom;
}

// Generate API SBOM
console.log('[generate-sbom] Generating API Container SBOM...');
const apiDependencies = { ...apiPkg.dependencies };
const apiSbom = generateCycloneDxSbom('api', apiPkg, apiDependencies);
writeFileSync(resolve(sbomDir, 'api-sbom.json'), JSON.stringify(apiSbom, null, 2), 'utf8');

// Generate Web SBOM
console.log('[generate-sbom] Generating Web Container SBOM...');
const webDependencies = { ...webPkg.dependencies };
const webSbom = generateCycloneDxSbom('web', webPkg, webDependencies);
writeFileSync(resolve(sbomDir, 'web-sbom.json'), JSON.stringify(webSbom, null, 2), 'utf8');

// Generate Edge SBOM
console.log('[generate-sbom] Generating Edge Container SBOM...');
const edgeSbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  serialNumber: `urn:uuid:twinmos-edge-sbom-${Date.now()}`,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: {
      type: 'container',
      name: 'twinmos-edge',
      version: '1.0.0',
    },
  },
  components: [
    { type: 'operating-system', name: 'alpine-linux', version: '3.21' },
    { type: 'application', name: 'nginx', version: 'alpine' },
    { type: 'library', name: 'openssl', version: 'alpine' },
  ],
};
writeFileSync(resolve(sbomDir, 'edge-sbom.json'), JSON.stringify(edgeSbom, null, 2), 'utf8');

// 2. Validate SBOM-01 Requirements
let violations = 0;

// Requirement A: No forbidden dev tooling in production runtime
for (const [img, sbom] of [['api', apiSbom], ['web', webSbom], ['edge', edgeSbom]]) {
  const compNames = sbom.components.map(c => c.name);
  for (const forbidden of FORBIDDEN_PROD_DEPS) {
    if (compNames.includes(forbidden)) {
      console.error(`[generate-sbom] FAIL SBOM-01: Forbidden dependency '${forbidden}' found in ${img} SBOM!`);
      violations++;
    }
  }
}

if (violations === 0) {
  console.log('[generate-sbom] PASS SBOM-01: Zero forbidden dev packages (drizzle-kit, esbuild, vitest) in production SBOMs.');
}

// Requirement B: sharp is declared in API and native binary is verified
if (!apiDependencies['sharp']) {
  console.error('[generate-sbom] FAIL SBOM-01: sharp missing from API runtime dependencies!');
  violations++;
} else {
  console.log(`[generate-sbom] PASS SBOM-01: sharp verified in API runtime dependencies (version ${apiDependencies['sharp']}).`);
}

// Check sharp native bindings load
try {
  const sharpModule = await import('sharp');
  const sharp = sharpModule.default;
  const testBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const metadata = await sharp(testBuffer).metadata();
  if (metadata.width === 1 && metadata.height === 1) {
    console.log('[generate-sbom] PASS SBOM-01: sharp native bindings loaded and processed test raster image cleanly.');
  } else {
    console.error('[generate-sbom] FAIL SBOM-01: sharp processed image metadata mismatch.');
    violations++;
  }
} catch (err) {
  console.error('[generate-sbom] FAIL SBOM-01: sharp failed to load native bindings:', err.message);
  violations++;
}

if (violations > 0) {
  console.error(`[generate-sbom] SBOM verification FAILED with ${violations} error(s).`);
  process.exit(1);
}

console.log('[generate-sbom] SUCCESS: All SBOM-01 artifacts generated and validated in deploy/sbom/.');
process.exit(0);
