import { Check, Zap, Crown } from "lucide-react";
import { PLANS, getPlan, setPlan } from "../lib/subscription";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function PricingPage({ onUpgrade }) {
  const [current, setCurrent] = useState(getPlan());

  const handleUpgrade = () => {
    // In production this would open Stripe checkout
    // For demo: simulate upgrade
    setPlan("pro");
    setCurrent("pro");
    toast.success("🎉 Upgraded to Pro! Enjoy unlimited access.");
    onUpgrade?.();
  };

  const handleDowngrade = () => {
    setPlan("free");
    setCurrent("free");
    toast("Downgraded to Free plan.");
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h2>Choose Your Plan</h2>
        <p>Start free, upgrade when you're ready</p>
      </div>

      <div className="pricing-cards">
        {/* Free */}
        <div className={`pricing-card ${current === "free" ? "current" : ""}`}>
          <div className="pricing-card-header">
            <div className="pricing-plan-name">Free</div>
            <div className="pricing-price">$0 <span>/month</span></div>
            <p>Perfect for getting started</p>
          </div>
          <ul className="pricing-features">
            {PLANS.free.features.map((f, i) => (
              <li key={i}><Check size={14} className="pricing-check" /> {f}</li>
            ))}
          </ul>
          <div className="pricing-card-footer">
            {current === "free"
              ? <div className="pricing-current-badge">Current Plan</div>
              : <button className="pricing-btn outline" onClick={handleDowngrade}>Switch to Free</button>
            }
          </div>
        </div>

        {/* Pro */}
        <div className={`pricing-card pro ${current === "pro" ? "current" : ""}`}>
          <div className="pricing-popular">Most Popular</div>
          <div className="pricing-card-header">
            <div className="pricing-plan-name"><Crown size={16} /> Pro</div>
            <div className="pricing-price">$9 <span>/month</span></div>
            <p>For serious learners</p>
          </div>
          <ul className="pricing-features">
            {PLANS.pro.features.map((f, i) => (
              <li key={i}><Check size={14} className="pricing-check pro" /> {f}</li>
            ))}
          </ul>
          <div className="pricing-card-footer">
            {current === "pro"
              ? <div className="pricing-current-badge pro">Current Plan ✓</div>
              : <button className="pricing-btn pro" onClick={handleUpgrade}>
                  <Zap size={15} /> Upgrade to Pro
                </button>
            }
          </div>
        </div>
      </div>

      <p className="pricing-note">
        💡 Demo mode: clicking "Upgrade to Pro" simulates the upgrade locally. In production, this connects to Stripe.
      </p>
    </div>
  );
}
