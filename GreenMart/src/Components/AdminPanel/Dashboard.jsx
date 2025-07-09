import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function Dashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    products: 0,
    customers: 0,
  });

  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchSalesData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/dashboard/summary");
      setStats({
        orders: response.data.orders || 0,
        revenue: response.data.revenue || 0,
        products: response.data.products || 0,
        customers: response.data.customers || 0,
      });
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      setStats({ orders: 0, revenue: 0, products: 0, customers: 0 }); // Prevent null values
    }
  };
  

  const fetchSalesData = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/dashboard/sales");
      setSalesData(response.data.length > 0 ? response.data : []);
    } catch (error) {
      console.error("❌ Error fetching sales data:", error);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 ml-16 mb-14 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-32">
        
        {/* Stats Cards */}
        {[
          { title: "Orders", value: stats.orders, icon: <ShoppingBag className="w-6 h-6 text-green-500" />, desc: "Total orders this week" },
          { title: "Revenue", value: `₹${(stats.revenue || 0).toLocaleString("en-IN")}`, icon: <DollarSign className="w-6 h-6 text-blue-500" />, desc: "Revenue this week" },
          { title: "Products", value: stats.products, icon: <Package className="w-6 h-6 text-orange-500" />, desc: "Available in store" },
          { title: "Customers", value: stats.customers, icon: <Users className="w-6 h-6 text-purple-500" />, desc: "Active customers" }
        ].map((stat, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.desc}</p>
            </div>
            {stat.icon}
          </div>
        ))}

        {/* Sales Chart */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <XAxis dataKey="week" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#4CAF50" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No sales data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
