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
    return <div className="py-20 text-center text-xs text-slate-400">Loading plan limits & entitlements...</div>;
  }

  const currentPlanKey = entitlements?.planKey || user?.subscriptionPlan || 'FREE';
  const limits = entitlements?.limits || { maxClients: 5, currentClients: 0 };
  const clientPercent = Math.min(100, Math.round((limits.currentClients / limits.maxClients) * 100));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Subscription Plans & Entitlements</h2>
        <p className="text-xs text-slate-500">
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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tier</span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-xl font-bold text-slate-900">{entitlements?.planName || currentPlanKey}</h3>
              <Badge variant="primary">Current Plan</Badge>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-700">
              {limits.currentClients} / {limits.maxClients} Clients Used
            </span>
            <span className="block text-[11px] text-slate-400">({limits.maxClients - limits.currentClients} remaining)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all ${
              clientPercent > 80 ? 'bg-rose-500' : clientPercent > 50 ? 'bg-amber-500' : 'bg-primary-600'
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
                  ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-slate-900">{p.name}</h4>
                  {isCurrent && <Badge variant="primary">Active</Badge>}
                </div>

                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {p.monthlyPrice === 0 ? 'Free' : `₹${p.monthlyPrice}`}
                  </span>
                  {p.monthlyPrice > 0 && <span className="text-xs text-slate-400"> / month</span>}
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
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

              <div className="pt-6 mt-6 border-t border-slate-100">
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
