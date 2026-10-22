import { getAdminOrders } from "@/queries/order.queries";
import { OrdersTable } from "./_components/orders-table";


export default async function AdminOrdersPage() {
  // 🔄 Data fetching is cleanly abstracted away
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Orders</h1>
      </div>

      {/* Pass the server-fetched data to the Client Component */}
      <OrdersTable initialOrders={orders} />
    </div>
  );
}
