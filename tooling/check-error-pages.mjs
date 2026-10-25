async function main() {
  const slugs = ['404', '410', '500', 'maintenance'];
  for (const slug of slugs) {
    try {
      const res = await fetch(`http://127.0.0.1:8787/api/v1/delivery/pages/${slug}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[PAGE ${slug}] status: ${res.status}, payload:`, JSON.stringify(data));
      } else {
        console.log(`[PAGE ${slug}] status: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.log(`[PAGE ${slug}] fetch error: ${e.message}`);
    }
  }
}
main();
