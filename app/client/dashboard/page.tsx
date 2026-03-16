const orders = [
  {
    id: "CMD-0001",
    date: "16 mars 2026",
    status: "En cours",
    total: "12 500 FCFA",
  },
  {
    id: "CMD-0002",
    date: "12 mars 2026",
    status: "Livrée",
    total: "8 300 FCFA",
  },
  {
    id: "CMD-0003",
    date: "05 mars 2026",
    status: "Annulée",
    total: "4 100 FCFA",
  },
];

export default function ClientOrdersPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">
          <div>Commande</div>
          <div>Date</div>
          <div>Statut</div>
          <div>Total</div>
        </div>
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <div key={order.id} className="grid grid-cols-4 gap-4 px-6 py-4 text-sm text-gray-700">
              <div className="font-medium text-gray-900">{order.id}</div>
              <div>{order.date}</div>
              <div>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-toni-green-light text-toni-green-dark-2">
                  {order.status}
                </span>
              </div>
              <div className="font-medium text-gray-900">{order.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
