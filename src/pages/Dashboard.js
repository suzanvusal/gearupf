import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Wrench, Calendar, Package, LogOut, User, MapPin, Phone, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "./Dashboard.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user, onLogout, onUpdateUser }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState(user.equipment || []);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showBookService, setShowBookService] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newEquipment, setNewEquipment] = useState({
    name: "",
    brand: "",
    model: "",
    condition: "good",
    purchase_date: ""
  });

  const [newBooking, setNewBooking] = useState({
    service_type: "repair",
    equipment_details: {},
    location: user.location || "",
    preferred_date: ""
  });

  const [profile, setProfile] = useState({
    location: user.location || "",
    phone: user.phone || ""
  });

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

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedEquipment = [...equipment, newEquipment];
      await axios.put(`${API}/users/me`, 
        { equipment: updatedEquipment },
        { withCredentials: true }
      );
      setEquipment(updatedEquipment);
      setShowAddEquipment(false);
      setNewEquipment({ name: "", brand: "", model: "", condition: "good", purchase_date: "" });
      toast.success("Equipment added successfully");
      await onUpdateUser();
    } catch (error) {
      toast.error("Failed to add equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/bookings`, newBooking, {
        withCredentials: true
      });
      setBookings([...bookings, response.data]);
      setShowBookService(false);
      setNewBooking({
        service_type: "repair",
        equipment_details: {},
        location: user.location || "",
        preferred_date: ""
      });
      toast.success("Service booked successfully");
      loadBookings();
    } catch (error) {
      toast.error("Failed to book service");
    } finally {
      setLoading(false);
    }
  };

  const handleGetAIRecommendation = async (equipmentItem) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ai/predictive-maintenance`, 
        {
          name: equipmentItem.name,
          model: equipmentItem.model,
          brand: equipmentItem.brand,
          purchase_date: equipmentItem.purchase_date,
          usage_frequency: "regular"
        },
        { withCredentials: true }
      );
      setAiRecommendation(response.data.maintenance_plan);
      toast.success("AI recommendation generated");
    } catch (error) {
      toast.error("Failed to get AI recommendation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/users/me`, profile, {
        withCredentials: true
      });
      setShowProfile(false);
      toast.success("Profile updated successfully");
      await onUpdateUser();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard" data-testid="consumer-dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => navigate("/dashboard")}>
            <Wrench size={24} />
            GearUp Repairs
          </div>
          <div className="navbar-links">
            <span className="navbar-link" onClick={() => navigate("/dashboard")}>Dashboard</span>
            <span className="navbar-link" onClick={() => navigate("/technicians")}>Find Technicians</span>
            <span className="navbar-link" onClick={() => navigate("/marketplace")}>Marketplace</span>
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

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 data-testid="dashboard-title">Welcome back, {user.name.split(" ")[0]}!</h1>
            <p className="subtitle">Manage your equipment and service requests</p>
          </div>
          <div className="header-actions">
            <Dialog open={showProfile} onOpenChange={setShowProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="edit-profile-btn">
                  <User size={18} />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="profile-dialog">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="form-content">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      placeholder="City, State"
                      data-testid="profile-location-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="Phone number"
                      data-testid="profile-phone-input"
                    />
                  </div>
                  <Button type="submit" disabled={loading} data-testid="save-profile-btn">
                    {loading ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" data-testid="stat-equipment">
            <Package size={24} />
            <div className="stat-value">{equipment.length}</div>
            <div className="stat-label">Equipment</div>
          </div>
          <div className="stat-card" data-testid="stat-bookings">
            <Calendar size={24} />
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Service Requests</div>
          </div>
          <div className="stat-card" data-testid="stat-completed">
            <Wrench size={24} />
            <div className="stat-value">{bookings.filter(b => b.status === "completed").length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="section">
          <div className="section-header">
            <h2 data-testid="equipment-section-title">My Equipment</h2>
            <Dialog open={showAddEquipment} onOpenChange={setShowAddEquipment}>
              <DialogTrigger asChild>
                <Button data-testid="add-equipment-btn">
                  <Plus size={18} />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="add-equipment-dialog">
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEquipment} className="form-content">
                  <div>
                    <Label htmlFor="name">Equipment Name</Label>
                    <Input
                      id="name"
                      required
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                      placeholder="e.g., Treadmill"
                      data-testid="equipment-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      required
                      value={newEquipment.brand}
                      onChange={(e) => setNewEquipment({...newEquipment, brand: e.target.value})}
                      placeholder="e.g., NordicTrack"
                      data-testid="equipment-brand-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      required
                      value={newEquipment.model}
                      onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                      placeholder="e.g., Commercial 1750"
                      data-testid="equipment-model-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={newEquipment.condition}
                      onValueChange={(value) => setNewEquipment({...newEquipment, condition: value})}
                    >
                      <SelectTrigger data-testid="equipment-condition-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="purchase_date">Purchase Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={newEquipment.purchase_date}
                      onChange={(e) => setNewEquipment({...newEquipment, purchase_date: e.target.value})}
                      data-testid="equipment-date-input"
                    />
                  </div>
                  <Button type="submit" disabled={loading} data-testid="submit-equipment-btn">
                    {loading ? "Adding..." : "Add Equipment"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="equipment-grid">
            {equipment.length === 0 ? (
              <div className="empty-state" data-testid="empty-equipment">
                <Package size={48} />
                <p>No equipment added yet</p>
                <Button onClick={() => setShowAddEquipment(true)}>Add Your First Equipment</Button>
              </div>
            ) : (
              equipment.map((item, index) => (
                <div key={index} className="equipment-card" data-testid={`equipment-card-${index}`}>
                  <div className="equipment-header">
                    <h3>{item.name}</h3>
                    <span className={`badge badge-${item.condition}`}>{item.condition}</span>
                  </div>
                  <p className="equipment-details">
                    {item.brand} - {item.model}
                  </p>
                  {item.purchase_date && (
                    <p className="equipment-date">Purchased: {item.purchase_date}</p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleGetAIRecommendation(item)}
                    disabled={loading}
                    data-testid={`ai-recommendation-btn-${index}`}
                  >
                    <Zap size={16} />
                    AI Maintenance Check
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Recommendation */}
        {aiRecommendation && (
          <div className="ai-recommendation" data-testid="ai-recommendation">
            <div className="ai-header">
              <Zap size={24} />
              <h3>AI Maintenance Recommendation</h3>
            </div>
            <p>{aiRecommendation}</p>
            <Button onClick={() => setAiRecommendation(null)} variant="ghost">
              Close
            </Button>
          </div>
        )}

        {/* Service Requests */}
        <div className="section">
          <div className="section-header">
            <h2 data-testid="bookings-section-title">Service Requests</h2>
            <Button onClick={() => navigate("/technicians")} data-testid="book-service-btn">
              <Plus size={18} />
              Book Service
            </Button>
          </div>

          <div className="bookings-list">
            {bookings.length === 0 ? (
              <div className="empty-state" data-testid="empty-bookings">
                <Calendar size={48} />
                <p>No service requests yet</p>
                <Button onClick={() => navigate("/technicians")}>Book Your First Service</Button>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="booking-card" data-testid={`booking-card-${booking.id}`}>
                  <div className="booking-header">
                    <h3>{booking.service_type}</h3>
                    <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                  </div>
                  <p className="booking-equipment">
                    {booking.equipment_details.name} - {booking.equipment_details.issue_description}
                  </p>
                  <div className="booking-footer">
                    <span className="booking-location">
                      <MapPin size={16} />
                      {booking.location}
                    </span>
                    {booking.preferred_date && (
                      <span className="booking-date">
                        <Calendar size={16} />
                        {booking.preferred_date}
                      </span>
                    )}
                  </div>
                  {booking.estimated_cost && (
                    <p className="booking-cost">Estimated: ${booking.estimated_cost}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;