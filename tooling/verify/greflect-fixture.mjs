// G-REFLECT Real Architectural Reflection Harness (T3.6.1 / Z-17 / GREF-H)
// Closes Z-17: Replaces vacuous grep-only scripts with true browser/HTTP-level reflection:
// 1. Authenticates through Admin API as staff editor/admin.
// 2. Edits/creates content with unique dynamic verification payload.
// 3. Publishes content and verifies outbox revalidation reaches public anonymous visitors within 5s.
// 4. Variant: Transitions content to archived/unpublished and asserts anonymous visitors receive 404/410 within 5s.

const API_BASE = process.env.API_URL || "http://127.0.0.1:8787";
const WEB_BASE = process.env.WEB_URL || "http://localhost:4321";

console.log("================================================================");
console.log("       G-REFLECT: Browser & End-to-End Reflection Fixture");
console.log(
  "================================================================\n",
);

async function runFixture() {
  // Step 1: Staff Sign-in
  process.stdout.write("[*] 1. Authenticating as staff admin through API... ");
  const loginRes = await fetch(`${API_BASE}/api/v1/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:5173",
    },
    body: JSON.stringify({ email: "admin@twinmos.dev", password: "admin" }),
  });
  if (loginRes.status !== 200) {
    console.log("FAIL");
    throw new Error(`Admin login failed with status ${loginRes.status}`);
  }
  const rawCookie = loginRes.headers.get("set-cookie");
  if (!rawCookie) {
    console.log("FAIL");
    throw new Error("Missing set-cookie header");
  }
  const cookie = rawCookie.split(";")[0];
  console.log("PASS (Session established)");

  // Step 2: Create draft content
  const testId = Date.now();
  const testSlug = `greflect-proof-${testId}`;
  const testTitle = `G-REFLECT Verified Dynamic Article ${testId}`;
  const testContent = `<p>G-REFLECT live reflection payload: ${testId}. Automated end-to-end verification.</p>`;

  process.stdout.write(
    `[*] 2. Creating draft article with slug '${testSlug}'... `,
  );
  const createRes = await fetch(`${API_BASE}/api/v1/admin/content/article`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie,
      origin: "http://localhost:5173",
    },
    body: JSON.stringify({
      title: testTitle,
      slug: testSlug,
      category: "Guides",
      excerpt: "G-REFLECT end-to-end anonymous reflection test",
      content: testContent,
      status: "draft",
    }),
  });
  if (createRes.status !== 201) {
    console.log("FAIL");
    throw new Error(`Draft creation failed with status ${createRes.status}`);
  }
  const created = await createRes.json();
  console.log(`PASS (Article ID: ${created.id})`);

  // Assert draft is 404 anonymously
  process.stdout.write(
    "[*] 3. Verifying draft is NOT delivered anonymously (expected 404)... ",
  );
  const draftAnonRes = await fetch(`${WEB_BASE}/learn/${testSlug}`);
  if (draftAnonRes.status !== 404) {
    console.log("FAIL");
    throw new Error(
      `Draft was publicly exposed (status: ${draftAnonRes.status})`,
    );
  }
  console.log("PASS (Isolated: 404)");

  // Step 3: Transition to published
  process.stdout.write(
    "[*] 4. Transitioning draft -> in_review -> published... ",
  );
  const reviewRes = await fetch(
    `${API_BASE}/api/v1/admin/content/article/${created.id}/transition`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
        origin: "http://localhost:5173",
      },
      body: JSON.stringify({ to: "in_review" }),
    },
  );
  if (reviewRes.status !== 200)
    throw new Error(`Transition to in_review failed (${reviewRes.status})`);

  const pubRes = await fetch(
    `${API_BASE}/api/v1/admin/content/article/${created.id}/transition`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
        origin: "http://localhost:5173",
      },
      body: JSON.stringify({ to: "published" }),
    },
  );
  if (pubRes.status !== 200)
    throw new Error(`Transition to published failed (${pubRes.status})`);
  console.log("PASS");

  // Step 4: Poll public anonymous URL within 5 seconds
  process.stdout.write(
    "[*] 5. Polling public URL anonymously within 5s window... ",
  );
  const pollStart = Date.now();
  let reflected = false;
  let latencyMs = 0;

  while (Date.now() - pollStart < 5000) {
    try {
      const anonRes = await fetch(`${WEB_BASE}/learn/${testSlug}`);
      if (anonRes.status === 200) {
        const body = await anonRes.text();
        if (body.includes(testTitle)) {
          reflected = true;
          latencyMs = Date.now() - pollStart;
          break;
        }
      }
    } catch {
      // Retrying
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!reflected) {
    console.log("FAIL");
    throw new Error(
      `Published article did not reflect to anonymous visitors within 5s window`,
    );
  }
  console.log(`PASS (Reflected in ${latencyMs}ms)`);

  // Step 5: Variant — Archive and verify removal within 5s
  process.stdout.write(
    "[*] 6. Variant: Transitioning to archived & verifying removal within 5s... ",
  );
  const archRes = await fetch(
    `${API_BASE}/api/v1/admin/content/article/${created.id}/transition`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
        origin: "http://localhost:5173",
      },
      body: JSON.stringify({ to: "archived" }),
    },
  );
  if (archRes.status !== 200)
    throw new Error(`Archive transition failed (${archRes.status})`);

  const archStart = Date.now();
  let removed = false;
  let archLatencyMs = 0;

  while (Date.now() - archStart < 5000) {
    try {
      const checkRes = await fetch(`${WEB_BASE}/learn/${testSlug}`);
      if (checkRes.status === 404 || checkRes.status === 410) {
        removed = true;
        archLatencyMs = Date.now() - archStart;
        break;
      }
    } catch {
      // Retrying
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!removed) {
    console.log("FAIL");
    throw new Error(`Archived content remained accessible past 5s window`);
  }
  console.log(`PASS (Removed in ${archLatencyMs}ms, status: 404)`);

  console.log(
    "\n================================================================",
  );
  console.log("SUCCESS: G-REFLECT Fixture passed completely (T3.6.1 / GREF-H)");
  console.log(
    "================================================================\n",
  );
}

runFixture().catch((err) => {
  console.error(`\n[-] G-REFLECT Fixture ERROR: ${err.message}`);
  process.exit(1);
});
