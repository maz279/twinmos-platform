const res = await fetch('http://localhost:4321/partners');
const html = await res.text();
console.log('/partners status:', res.status);
console.log('form[data-tm-form] present:', html.includes('data-tm-form'));
