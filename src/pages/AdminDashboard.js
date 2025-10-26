import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Wrench, LogOut, Users, Calendar, Package, DollarSign, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./AdminDashboard.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardRes, usersRes, bookingsRes, transactionsRes, revenueRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, { withCredentials: true }),
        axios.get(`${API}/admin/users`, { withCredentials: true }),
        axios.get(`${API}/admin/bookings`, { withCredentials: true }),
        axios.get(`${API}/admin/transactions`, { withCredentials: true }),
        axios.get(`${API}/admin/revenue-stats`, { withCredentials: true }),
        axios.get(`${API}/admin/reviews`, { withCredentials: true })
      ]);
      
      setStats(dashboardRes.data.stats);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setTransactions(transactionsRes.data);
      setRevenueStats(revenueRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error("Load dashboard error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`${API}/admin/users/${userId}`, { withCredentials: true });
      toast.success("User deleted");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await axios.delete(`${API}/admin/reviews/${reviewId}`, { withCredentials: true });
      toast.success("Review deleted");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Wrench size={24} />
            GearUp Repairs - Admin
          </div>
          <div className="navbar-right">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="admin-badge">Admin</span>
            </div>
            <Button variant="ghost" onClick={onLogout} data-testid="logout-btn">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>

      <div className="admin-content">
        <div className="admin-header">
          <h1 data-testid="admin-title">Admin Dashboard</h1>
          <p className="subtitle">Manage your platform and monitor revenue</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card revenue" data-testid="stat-platform-revenue">
            <DollarSign size={24} />
            <div className="stat-value">${stats?.platform_revenue || 0}</div>
            <div className="stat-label">Platform Revenue</div>
          </div>
          <div className="stat-card" data-testid="stat-total-revenue">
            <TrendingUp size={24} />
            <div className="stat-value">${stats?.total_revenue || 0}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
          <div className="stat-card" data-testid="stat-users">
            <Users size={24} />
            <div className="stat-value">{stats?.total_users || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card" data-testid="stat-technicians">
            <Activity size={24} />
            <div className="stat-value">{stats?.total_technicians || 0}</div>
            <div className="stat-label">Technicians</div>
          </div>
          <div className="stat-card" data-testid="stat-bookings">
            <Calendar size={24} />
            <div className="stat-value">{stats?.total_bookings || 0}</div>
            <div className="stat-label">Bookings</div>
          </div>
          <div className="stat-card" data-testid="stat-parts">
            <Package size={24} />
            <div className="stat-value">{stats?.total_parts || 0}</div>
            <div className="stat-label">Parts Listed</div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        {revenueStats && (
          <div className="revenue-section">
            <h2>Revenue Breakdown</h2>
            <div className="revenue-grid">
              <div className="revenue-card">
                <h3>Service Bookings</h3>
                <div className="revenue-details">
                  <div className="detail-row">
                    <span>Total Revenue:</span>
                    <span className="amount">${revenueStats.service_revenue}</span>
                  </div>
                  <div className="detail-row">
                    <span>Platform Commission ({revenueStats.service_commission_rate}):</span>
                    <span className="amount commission">${revenueStats.service_commission}</span>
                  </div>
                  <div className="detail-row">
                    <span>Transactions:</span>
                    <span>{revenueStats.service_transactions}</span>
                  </div>
                </div>
              </div>
              <div className="revenue-card">
                <h3>Parts Sales</h3>
                <div className="revenue-details">
                  <div className="detail-row">
                    <span>Total Revenue:</span>
                    <span className="amount">${revenueStats.parts_revenue}</span>
                  </div>
                  <div className="detail-row">
                    <span>Platform Commission ({revenueStats.parts_commission_rate}):</span>
                    <span className="amount commission">${revenueStats.parts_commission}</span>
                  </div>
                  <div className="detail-row">
                    <span>Transactions:</span>
                    <span>{revenueStats.parts_transactions}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="admin-tabs">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="data-table">
              <h3>All Users ({users.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                        <td>{u.location || "N/A"}</td>
                        <td>
                          {u.role !== "admin" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="data-table">
              <h3>All Bookings ({bookings.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Service Type</th>
                      <th>Equipment</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Cost</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>{b.service_type}</td>
                        <td>{b.equipment_details?.name}</td>
                        <td>{b.location}</td>
                        <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                        <td>${b.actual_cost || b.estimated_cost || "TBD"}</td>
                        <td><span className={`badge badge-${b.payment_status}`}>{b.payment_status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="data-table">
              <h3>All Transactions ({transactions.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Commission</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td><span className="type-badge">{t.transaction_type}</span></td>
                        <td>${t.amount}</td>
                        <td className="commission-amount">${t.platform_commission?.toFixed(2) || 0}</td>
                        <td><span className={`badge badge-${t.payment_status}`}>{t.payment_status}</span></td>
                        <td>{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="data-table">
              <h3>All Reviews ({reviews.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Reviewer</th>
                      <th>Target Type</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r.id}>
                        <td>{r.reviewer_name}</td>
                        <td>{r.target_type}</td>
                        <td>⭐ {r.rating}</td>
                        <td>{r.comment}</td>
                        <td>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteReview(r.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;