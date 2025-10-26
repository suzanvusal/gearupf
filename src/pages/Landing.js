import { Wrench, Shield, Zap, TrendingUp, LogIn } from "lucide-react";
import "./Landing.css";

const Landing = () => {
  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const authUrl = process.env.REACT_APP_AUTH_URL || 'https://auth.emergentagent.com';
    window.location.href = `${authUrl}/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="landing" data-testid="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-badge" data-testid="hero-badge">
            <Zap size={16} />
            <span>AI-Powered Service Platform</span>
          </div>
          <h1 className="hero-title" data-testid="hero-title">
            Connect with Expert
            <span className="gradient-text"> Fitness Equipment</span>
            <br />Technicians Instantly
          </h1>
          <p className="hero-subtitle" data-testid="hero-subtitle">
            Your all-in-one platform for maintenance, repairs, and parts. 
            Smart matching, transparent pricing, verified professionals.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary btn-large" 
              onClick={handleLogin}
              data-testid="get-started-btn"
            >
              <LogIn size={20} />
              Get Started with Google
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Certified Technicians</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Services Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9/5</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2 className="section-title" data-testid="features-title">Why Choose GearUp Repairs?</h2>
          <p className="section-subtitle">Everything you need in one powerful platform</p>
          
          <div className="features-grid">
            <div className="feature-card" data-testid="feature-smart-matching">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>AI-Powered Matching</h3>
              <p>Smart algorithms connect you with the perfect technician based on your equipment, location, and service needs.</p>
            </div>

            <div className="feature-card" data-testid="feature-verified">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Verified Professionals</h3>
              <p>All technicians are certified and background-checked. Read reviews and ratings from real customers.</p>
            </div>

            <div className="feature-card" data-testid="feature-marketplace">
              <div className="feature-icon">
                <Wrench size={32} />
              </div>
              <h3>Parts Marketplace</h3>
              <p>Browse genuine parts with AI-powered compatibility checks. Get what you need, when you need it.</p>
            </div>

            <div className="feature-card" data-testid="feature-predictive">
              <div className="feature-icon">
                <TrendingUp size={32} />
              </div>
              <h3>Predictive Maintenance</h3>
              <p>Stay ahead of issues with AI-driven maintenance recommendations based on your equipment usage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 data-testid="cta-title">Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers and technicians</p>
          <button 
            className="btn btn-primary btn-large" 
            onClick={handleLogin}
            data-testid="cta-get-started-btn"
          >
            <LogIn size={20} />
            Sign In with Google
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 GearUp Repairs. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;