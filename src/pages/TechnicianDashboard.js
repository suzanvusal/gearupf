import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Wrench, LogOut, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./Dashboard.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TechnicianDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`, {
        withCredentials: true
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Load bookings error:", error);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}`, 
        { status: "accepted" },
        { withCredentials: true }
      );
      toast.success("Booking accepted");
      loadBookings();
    } catch (error) {
      toast.error("Failed to accept booking");
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}`, 
        { status: "completed", completed_at: new Date().toISOString() },
        { withCredentials: true }
      );
      toast.success("Booking completed");
      loadBookings();
    } catch (error) {
      toast.error("Failed to complete booking");
    }
  };

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const activeBookings = bookings.filter(b => b.status === "accepted" || b.status === "in_progress");
  const completedBookings = bookings.filter(b => b.status === "completed");

  return (
    <div className="dashboard" data-testid="technician-dashboard">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => navigate("/technician/dashboard")}>
            <Wrench size={24} />
            GearUp Repairs
          </div>
          <div className="navbar-right">
            <div className="user-info">
              {user.picture && <img src={user.picture} alt="User" className="user-avatar" />}
              <span className="user-name">{user.name}</span>
            </div>
            <Button variant="ghost" onClick={onLogout} data-testid="logout-btn">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 data-testid="tech-dashboard-title">Technician Dashboard</h1>
            <p className="subtitle">Manage your service requests and schedule</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" data-testid="stat-pending">
            <Calendar size={24} />
            <div className="stat-value">{pendingBookings.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card" data-testid="stat-active">
            <Wrench size={24} />
            <div className="stat-value">{activeBookings.length}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-card" data-testid="stat-completed">
            <CheckCircle size={24} />
            <div className="stat-value">{completedBookings.length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="section">
          <div className="section-header">
            <h2 data-testid="pending-section">Pending Requests</h2>
          </div>
          <div className="bookings-list">
            {pendingBookings.length === 0 ? (
              <div className="empty-state" data-testid="empty-pending">
                <Calendar size={48} />
                <p>No pending requests</p>
              </div>
            ) : (
              pendingBookings.map((booking) => (
                <div key={booking.id} className="booking-card" data-testid={`pending-booking-${booking.id}`}>
                  <div className="booking-header">
                    <h3>{booking.service_type}</h3>
                    <span className="badge badge-pending">{booking.status}</span>
                  </div>
                  <p className="booking-equipment">
                    {booking.equipment_details.name} - {booking.equipment_details.issue_description}
                  </p>
                  <p className="booking-location">Location: {booking.location}</p>
                  {booking.preferred_date && (
                    <p className="booking-date">Preferred Date: {booking.preferred_date}</p>
                  )}
                  <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
                    <Button onClick={() => handleAcceptBooking(booking.id)} data-testid={`accept-btn-${booking.id}`}>
                      <CheckCircle size={18} />
                      Accept
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="section">
          <div className="section-header">
            <h2 data-testid="active-section">Active Jobs</h2>
          </div>
          <div className="bookings-list">
            {activeBookings.length === 0 ? (
              <div className="empty-state" data-testid="empty-active">
                <Wrench size={48} />
                <p>No active jobs</p>
              </div>
            ) : (
              activeBookings.map((booking) => (
                <div key={booking.id} className="booking-card" data-testid={`active-booking-${booking.id}`}>
                  <div className="booking-header">
                    <h3>{booking.service_type}</h3>
                    <span className="badge badge-accepted">{booking.status}</span>
                  </div>
                  <p className="booking-equipment">
                    {booking.equipment_details.name} - {booking.equipment_details.issue_description}
                  </p>
                  <p className="booking-location">Location: {booking.location}</p>
                  <Button onClick={() => handleCompleteBooking(booking.id)} data-testid={`complete-btn-${booking.id}`}>
                    <CheckCircle size={18} />
                    Mark as Completed
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="section">
          <div className="section-header">
            <h2 data-testid="completed-section">Completed Jobs</h2>
          </div>
          <div className="bookings-list">
            {completedBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="booking-card" data-testid={`completed-booking-${booking.id}`}>
                <div className="booking-header">
                  <h3>{booking.service_type}</h3>
                  <span className="badge badge-completed">{booking.status}</span>
                </div>
                <p className="booking-equipment">
                  {booking.equipment_details.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;