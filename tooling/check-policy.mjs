import { createDb, policyDocument } from '@twinmos/db';

async function main() {
  const db = createDb();
  const docs = await db.select().from(policyDocument);
  console.log('Policy documents count:', docs.length);
  console.log(JSON.stringify(docs.map(d => ({
    id: d.id,
    slug: d.slug,
    title: d.title,
    version: d.version,
    status: d.status,
    legalApproved: d.legalApproved,
    approvedBy: d.approvedBy
  })), null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
