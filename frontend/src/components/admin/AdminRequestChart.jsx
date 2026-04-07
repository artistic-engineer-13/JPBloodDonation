import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function AdminRequestChart({ analytics }) {
  const data = [
    {
      name: 'Approved',
      donor: analytics?.breakdown?.donorRequests?.approved || 0,
      blood: analytics?.breakdown?.bloodRequests?.approved || 0,
    },
    {
      name: 'Pending',
      donor: analytics?.breakdown?.donorRequests?.pending || 0,
      blood: analytics?.breakdown?.bloodRequests?.pending || 0,
    },
    {
      name: 'Rejected',
      donor: analytics?.breakdown?.donorRequests?.rejected || 0,
      blood: analytics?.breakdown?.bloodRequests?.rejected || 0,
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Request Status Overview</h2>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="donor" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="blood" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default AdminRequestChart;
