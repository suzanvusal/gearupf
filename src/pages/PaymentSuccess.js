import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./PaymentSuccess.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSuccess = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, [searchParams]);

  const checkPaymentStatus = async (sessionId) => {
    let attempts = 0;
    const maxAttempts = 5;
    
    const poll = async () => {
      try {
        const response = await axios.get(`${API}/payments/status/${sessionId}`, {
          withCredentials: true
        });
        
        setPaymentStatus(response.data);
        
        if (response.data.payment_status === "paid") {
          setLoading(false);
          return;
        } else if (response.data.status === "expired") {
          setLoading(false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Payment status error:", error);
        setLoading(false);
      }
    };
    
    poll();
  };

  return (
    <div className="payment-page" data-testid="payment-success-page">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => navigate("/dashboard")}>
            <Wrench size={24} />
            GearUp Repairs
          </div>
        </div>
      </nav>

      <div className="payment-content">
        {loading ? (
          <div className="payment-card" data-testid="payment-loading">
            <div className="spinner"></div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment</p>
          </div>
        ) : paymentStatus?.payment_status === "paid" ? (
          <div className="payment-card success" data-testid="payment-success-content">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h1>Payment Successful!</h1>
            <p className="subtitle">Thank you for your purchase</p>
            <div className="payment-details">
              <div className="detail-item">
                <span className="label">Amount Paid:</span>
                <span className="value">${paymentStatus.amount.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="value success-text">{paymentStatus.payment_status}</span>
              </div>
            </div>
            <Button onClick={() => navigate("/dashboard")} data-testid="back-to-dashboard-btn">
              Back to Dashboard
              <ArrowRight size={18} />
            </Button>
          </div>
        ) : (
          <div className="payment-card error" data-testid="payment-error-content">
            <h1>Payment Processing</h1>
            <p>Your payment is being processed. Please check back later.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;