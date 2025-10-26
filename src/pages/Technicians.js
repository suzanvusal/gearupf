import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Wrench, LogOut, MapPin, Star, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "./Technicians.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Technicians = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);
  const [location, setLocation] = useState("");
  const [selectedTech, setSelectedTech] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [loading, setLoading] = useState(false);

  const [booking, setBooking] = useState({
    service_type: "repair",
    equipment_details: {
      name: "",
      issue_description: ""
    },
    location: user.location || "",
    preferred_date: ""
  });

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async (searchLocation = "") => {
    try {
      const url = searchLocation ? `${API}/technicians?location=${searchLocation}` : `${API}/technicians`;
      const response = await axios.get(url, { withCredentials: true });
      setTechnicians(response.data);
      setFilteredTechnicians(response.data);
    } catch (error) {
      toast.error("Failed to load technicians");
    }
  };

  const handleSearch = () => {
    loadTechnicians(location);
  };

  const handleAIMatch = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ai/match-technician`, 
        {
          service_type: booking.service_type,
          equipment: booking.equipment_details.name,
          location: booking.location
        },
        { withCredentials: true }
      );
      setFilteredTechnicians(response.data.technicians);
      setAiRecommendation(response.data.ai_recommendation);
      toast.success("AI matching completed");
    } catch (error) {
      toast.error("AI matching failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTechnician = (tech) => {
    setSelectedTech(tech);
    setBooking({...booking, location: user.location || ""});
    setShowBooking(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/bookings`, 
        {
          ...booking,
          technician_id: selectedTech.id
        },
        { withCredentials: true }
      );
      setShowBooking(false);
      toast.success("Booking request sent successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="technicians-page" data-testid="technicians-page">
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

      <div className="technicians-content">
        <div className="page-header">
          <h1 data-testid="technicians-title">Find Technicians</h1>
          <p className="subtitle">Connect with verified fitness equipment service professionals</p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-bar">
            <Input
              placeholder="Search by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="location-search-input"
            />
            <Button onClick={handleSearch} data-testid="search-btn">
              Search
            </Button>
          </div>
          <Button onClick={handleAIMatch} disabled={loading} variant="outline" data-testid="ai-match-btn">
            <Zap size={18} />
            {loading ? "Matching..." : "AI Smart Match"}
          </Button>
        </div>

        {/* AI Recommendation */}
        {aiRecommendation && (
          <div className="ai-banner" data-testid="ai-recommendation-banner">
            <div className="ai-header">
              <Zap size={24} />
              <h3>AI Recommendation</h3>
            </div>
            <p>{aiRecommendation}</p>
          </div>
        )}

        {/* Technicians Grid */}
        <div className="technicians-grid">
          {filteredTechnicians.length === 0 ? (
            <div className="empty-state" data-testid="empty-technicians">
              <Wrench size={48} />
              <p>No technicians found</p>
            </div>
          ) : (
            filteredTechnicians.map((tech) => (
              <div key={tech.id} className="tech-card" data-testid={`tech-card-${tech.id}`}>
                <div className="tech-header">
                  {tech.picture && <img src={tech.picture} alt={tech.name} className="tech-avatar" />}
                  <div>
                    <h3>{tech.name}</h3>
                    <div className="tech-rating">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span>{tech.rating || 0} ({tech.total_reviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="tech-info">
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{tech.location || "N/A"}</span>
                  </div>
                  <div className="info-item rate">
                    <span>${tech.hourly_rate || 0}/hr</span>
                  </div>
                </div>

                {tech.services_offered && tech.services_offered.length > 0 && (
                  <div className="tech-services">
                    {tech.services_offered.slice(0, 3).map((service, idx) => (
                      <span key={idx} className="service-badge">{service}</span>
                    ))}
                  </div>
                )}

                {tech.qualifications && (
                  <p className="tech-qualifications">{tech.qualifications}</p>
                )}

                <Button 
                  onClick={() => handleBookTechnician(tech)} 
                  className="book-btn"
                  data-testid={`book-tech-btn-${tech.id}`}
                >
                  <Calendar size={18} />
                  Book Service
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent data-testid="booking-dialog">
          <DialogHeader>
            <DialogTitle>Book Service with {selectedTech?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBooking} className="form-content">
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={booking.service_type}
                onValueChange={(value) => setBooking({...booking, service_type: value})}
              >
                <SelectTrigger data-testid="service-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="equipment_name">Equipment Name</Label>
              <Input
                id="equipment_name"
                required
                value={booking.equipment_details.name}
                onChange={(e) => setBooking({...booking, equipment_details: {...booking.equipment_details, name: e.target.value}})}
                placeholder="e.g., Treadmill"
                data-testid="equipment-name-input"
              />
            </div>
            <div>
              <Label htmlFor="issue">Issue Description</Label>
              <Textarea
                id="issue"
                required
                value={booking.equipment_details.issue_description}
                onChange={(e) => setBooking({...booking, equipment_details: {...booking.equipment_details, issue_description: e.target.value}})}
                placeholder="Describe the issue..."
                data-testid="issue-description-input"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                required
                value={booking.location}
                onChange={(e) => setBooking({...booking, location: e.target.value})}
                placeholder="Service location"
                data-testid="booking-location-input"
              />
            </div>
            <div>
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                type="date"
                value={booking.preferred_date}
                onChange={(e) => setBooking({...booking, preferred_date: e.target.value})}
                data-testid="preferred-date-input"
              />
            </div>
            <Button type="submit" disabled={loading} data-testid="submit-booking-btn">
              {loading ? "Booking..." : "Submit Booking Request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Technicians;