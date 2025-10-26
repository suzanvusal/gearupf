import { useNavigate } from "react-router-dom";
import { XCircle, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./PaymentSuccess.css";

const PaymentCancel = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="payment-page" data-testid="payment-cancel-page">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => navigate("/dashboard")}>
            <Wrench size={24} />
            GearUp Repairs
          </div>
        </div>
      </nav>

      <div className="payment-content">
        <div className="payment-card cancel" data-testid="payment-cancel-content">
          <div className="cancel-icon">
            <XCircle size={64} />
          </div>
          <h1>Payment Cancelled</h1>
          <p className="subtitle">Your payment was cancelled. No charges were made.</p>
          <div className="button-group">
            <Button onClick={() => navigate("/marketplace")} variant="outline">
              Back to Marketplace
            </Button>
            <Button onClick={() => navigate("/dashboard")} data-testid="back-to-dashboard-btn">
              Back to Dashboard
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;