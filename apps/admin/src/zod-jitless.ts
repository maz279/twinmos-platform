// Must be the FIRST import in main.tsx. zod 4 decides whether to JIT-compile an object
// parser, and runs its `new Function` probe, when each schema is CONSTRUCTED. Under the
// admin CSP (script-src 'self') that probe is reported as an `eval` violation.
import { z } from 'zod';
z.config({ jitless: true });
