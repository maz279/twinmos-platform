// Products (P0 reference module) — list view kept from the original shell.
import { apiGet, fmtDate } from '../api';
import { Badge, Empty, Err, Table, td, useAsync } from '../ui';

type Product = {
  id: number; sku: string; slug: string; name: string; status: string; createdAt: string;
};

export default function Products() {
  const { data, error, loading } = useAsync<{ items: Product[] }>(() => apiGet('/admin/products?limit=100'), []);
  if (loading) return <p>Loading…</p>;
  if (error) return <Err error={error} />;
  return (
    <div>
      <h1>Products</h1>
      {data && (
        <Table head={['SKU', 'Name', 'Status', 'Created']}>
          {data.items.map((p) => (
            <tr key={p.id}>
              <td style={td}>{p.sku}</td>
              <td style={td}>{p.name}</td>
              <td style={td}><Badge value={p.status} /></td>
              <td style={td}>{fmtDate(p.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
      {data && data.items.length === 0 && <Empty text="No products — run npm run db:seed." />}
    </div>
  );
}
