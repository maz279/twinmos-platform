async function main() {
  const urls = [
    'http://localhost:4321/products',
    'http://localhost:4321/products/ssd-nvme',
    'http://localhost:4321/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd',
    'http://localhost:4321/shop',
    'http://localhost:4321/product?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd',
    'http://localhost:4321/search?q=ddr5',
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, { redirect: 'manual' });
      console.log(`URL: ${u} -> status: ${res.status}, location: ${res.headers.get('location') || 'none'}`);
    } catch (e) {
      console.log(`URL: ${u} -> error: ${e.message}`);
    }
  }
}
main();
