import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Wrench, LogOut, Package, ShoppingCart, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import "./Marketplace.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Marketplace = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIRecommend, setShowAIRecommend] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [equipmentInfo, setEquipmentInfo] = useState({
    name: "",
    model: "",
    brand: "",
    issue: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async (search = "") => {
    try {
      const url = search ? `${API}/parts?search=${search}` : `${API}/parts`;
      const response = await axios.get(url, { withCredentials: true });
      setParts(response.data);
    } catch (error) {
      toast.error("Failed to load parts");
    }
  };

  const handleSearch = () => {
    loadParts(searchQuery);
  };

  const handleAIRecommendation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/parts/ai-recommend`, 
        equipmentInfo,
        { withCredentials: true }
      );
      setAiRecommendation(response.data.recommendations);
      toast.success("AI recommendations generated");
    } catch (error) {
      toast.error("Failed to get AI recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPart = async (part) => {
    try {
      const response = await axios.post(`${API}/payments/checkout`, 
        {
          part_ids: [part.id],
          amount: part.price,
          currency: "usd",
          origin_url: window.location.origin
        },
        { withCredentials: true }
      );
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Failed to initiate payment");
    }
  };

  return (
    <div className="marketplace-page" data-testid="marketplace-page">
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

      <div className="marketplace-content">
        <div className="page-header">
          <h1 data-testid="marketplace-title">Parts Marketplace</h1>
          <p className="subtitle">Find genuine parts for your fitness equipment</p>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <Input
              placeholder="Search parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              data-testid="parts-search-input"
            />
            <Button onClick={handleSearch} data-testid="search-parts-btn">
              <Search size={18} />
              Search
            </Button>
          </div>
          <Button onClick={() => setShowAIRecommend(true)} variant="outline" data-testid="ai-recommend-btn">
            <Zap size={18} />
            AI Part Finder
          </Button>
        </div>

        {aiRecommendation && (
          <div className="ai-banner" data-testid="ai-parts-recommendation">
            <div className="ai-header">
              <Zap size={24} />
              <h3>AI Part Recommendations</h3>
            </div>
            <p>{aiRecommendation}</p>
            <Button onClick={() => setAiRecommendation("")} variant="ghost">Close</Button>
          </div>
        )}

        <div className="parts-grid">
          {parts.length === 0 ? (
            <div className="empty-state" data-testid="empty-parts">
              <Package size={48} />
              <p>No parts found</p>
            </div>
          ) : (
            parts.map((part) => (
              <div key={part.id} className="part-card" data-testid={`part-card-${part.id}`}>
                {part.image_url && (
                  <div className="part-image">
                    <img src={part.image_url} alt={part.name} />
                  </div>
                )}
                <div className="part-content">
                  <h3>{part.name}</h3>
                  <p className="part-brand">{part.brand}</p>
                  <p className="part-category">{part.category}</p>
                  <p className="part-description">{part.description}</p>
                  {part.compatible_models && part.compatible_models.length > 0 && (
                    <div className="compatible-models">
                      <span className="label">Compatible:</span>
                      <span>{part.compatible_models.slice(0, 2).join(", ")}</span>
                    </div>
                  )}
                  <div className="part-footer">
                    <div className="part-price">${part.price.toFixed(2)}</div>
                    <Button onClick={() => handleBuyPart(part)} data-testid={`buy-part-btn-${part.id}`}>
                      <ShoppingCart size={18} />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={showAIRecommend} onOpenChange={setShowAIRecommend}>
        <DialogContent data-testid="ai-recommend-dialog">
          <DialogHeader>
            <DialogTitle>AI Part Finder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAIRecommendation} className="form-content">
            <div>
              <Label htmlFor="name">Equipment Name</Label>
              <Input
                id="name"
                required
                value={equipmentInfo.name}
                onChange={(e) => setEquipmentInfo({...equipmentInfo, name: e.target.value})}
                placeholder="e.g., Treadmill"
                data-testid="ai-equipment-name-input"
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                required
                value={equipmentInfo.brand}
                onChange={(e) => setEquipmentInfo({...equipmentInfo, brand: e.target.value})}
                placeholder="e.g., NordicTrack"
                data-testid="ai-brand-input"
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                required
                value={equipmentInfo.model}
                onChange={(e) => setEquipmentInfo({...equipmentInfo, model: e.target.value})}
                placeholder="e.g., Commercial 1750"
                data-testid="ai-model-input"
              />
            </div>
            <div>
              <Label htmlFor="issue">Issue/Need</Label>
              <Textarea
                id="issue"
                required
                value={equipmentInfo.issue}
                onChange={(e) => setEquipmentInfo({...equipmentInfo, issue: e.target.value})}
                placeholder="Describe what's broken or what you need..."
                data-testid="ai-issue-input"
              />
            </div>
            <Button type="submit" disabled={loading} data-testid="submit-ai-recommend-btn">
              {loading ? "Analyzing..." : "Get AI Recommendations"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;