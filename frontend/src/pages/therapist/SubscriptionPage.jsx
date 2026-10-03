import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Check, Shield, Zap, Sparkles, AlertCircle } from 'lucide-react';

const SubscriptionPage = () => {
  const { user, updateUser } = useAuth();
  const [entitlements, setEntitlements] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradingKey, setUpgradingKey] = useState(null);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [entRes, plansRes] = await Promise.all([
        api.get('/subscriptions/entitlements'),
        api.get('/subscriptions/plans')
      ]);

      if (entRes.data.success) setEntitlements(entRes.data.entitlements);
      if (plansRes.data.success) setPlans(plansRes.data.plans);
    } catch (err) {
      console.error('Failed to load subscription info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpgrade = async (planKey) => {
    setUpgradingKey(planKey);
    setMessage('');
    try {
      const { data } = await api.post('/subscriptions/upgrade', { planKey });
      if (data.success) {
        updateUser({ subscriptionPlan: planKey });
        setMessage(`Successfully switched to ${planKey} plan!`);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upgrade failed');
    } finally {
      setUpgradingKey(null);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#6B6860]">Loading plan limits &amp; entitlements...</div>;
  }

  const currentPlanKey = entitlements?.planKey || user?.subscriptionPlan || 'FREE';
  const limits = entitlements?.limits || { maxClients: 5, currentClients: 0 };
  const clientPercent = Math.min(100, Math.round((limits.currentClients / limits.maxClients) * 100));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-[#1C1C1A] tracking-tight">Subscription Plans &amp; Entitlements</h2>
        <p className="text-xs text-[#6B6860]">
          Scale your practice with zero hidden limits. Feature access is gated through centralized entitlement checks.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Current Quota Status */}
      <div className="bg-white p-6 rounded-xl border border-[#E8E4DC] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-[#6B6860] uppercase tracking-wider">Active Tier</span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-xl font-bold text-[#1C1C1A]">{entitlements?.planName || currentPlanKey}</h3>
              <Badge variant={user?.subscriptionStatus === 'cancelled' ? 'warning' : 'primary'}>
                {user?.subscriptionStatus === 'cancelled' ? 'Cancelled (Expiring)' : 'Active Plan'}
              </Badge>
            </div>
          </div>

          <div className="text-right flex flex-col sm:items-end">
            <span className="text-xs font-bold text-[#1C1C1A]">
              {limits.currentClients} / {limits.maxClients} Clients Used
            </span>
            <span className="block text-[11px] text-[#6B6860]">({limits.maxClients - limits.currentClients} remaining)</span>

            {currentPlanKey !== 'FREE' && (
              <div className="mt-2 flex items-center gap-2">
                {user?.subscriptionStatus === 'cancelled' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { data } = await api.post('/subscriptions/reactivate');
                        if (data.success) {
                          updateUser({ subscriptionStatus: 'active' });
                          setMessage('Subscription successfully reactivated!');
                          fetchData();
                        }
                      } catch (err) {
                        alert(err.response?.data?.message || 'Reactivation failed');
                      }
                    }}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Reactivate Subscription
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
                        try {
                          const { data } = await api.post('/subscriptions/cancel');
                          if (data.success) {
                            updateUser({ subscriptionStatus: 'cancelled' });
                            setMessage(data.message);
                            fetchData();
                          }
                        } catch (err) {
                          alert(err.response?.data?.message || 'Cancellation failed');
                        }
                      }
                    }}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E8E4DC] rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all ${
              clientPercent > 80 ? 'bg-rose-500' : clientPercent > 50 ? 'bg-amber-500' : 'bg-brand-500'
            }`}
            style={{ width: `${clientPercent}%` }}
          />
        </div>
      </div>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = p.key === currentPlanKey;

          return (
            <div
              key={p.key}
              className={`rounded-2xl p-6 bg-white border flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                  : 'border-[#E8E4DC] shadow-xs hover:border-[#C8C4BC]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-[#1C1C1A]">{p.name}</h4>
                  {isCurrent && <Badge variant="primary">Active</Badge>}
                </div>

                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-[#1C1C1A]">
                    {p.monthlyPrice === 0 ? 'Free' : `₹${p.monthlyPrice}`}
                  </span>
                  {p.monthlyPrice > 0 && <span className="text-xs text-[#6B6860]"> / month</span>}
                </div>

                <div className="space-y-2.5 text-xs text-[#6B6860] border-t border-[#E8E4DC] pt-4">
                  <div className="flex items-center gap-2 font-semibold text-[#1C1C1A]">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Up to {p.limits.maxClients} Active Clients</span>
                  </div>

                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="capitalize">{feat.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E8E4DC]">
                {isCurrent ? (
                  <Button variant="secondary" className="w-full text-xs" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant={p.key === 'PRO' ? 'primary' : 'secondary'}
                    className="w-full text-xs"
                    loading={upgradingKey === p.key}
                    onClick={() => handleUpgrade(p.key)}
                  >
                    Switch to {p.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPage;
