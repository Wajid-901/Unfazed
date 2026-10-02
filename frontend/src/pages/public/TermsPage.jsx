import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, AlertTriangle, ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 mb-3">
          <FileCheck className="w-3.5 h-3.5 text-primary-600" />
          <span>Platform Agreement</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500 mt-2">
          Effective Date: January 1, 2026 • Last Updated: October 2026
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6 text-xs text-slate-600 leading-relaxed">
        {/* Important Emergency Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-amber-900 space-y-1">
            <strong className="block font-bold">Important Emergency Disclaimer:</strong>
            <p>
              Unfazed is a practice management SaaS software platform, not an emergency medical service or crisis helpline. If you or someone you know is experiencing acute distress, thoughts of self-harm, or a medical crisis, please call your local emergency services (e.g., <strong>112</strong> in India) or contact the Kiran Mental Health Helpline at <strong>1800-599-0019</strong> immediately.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Nature of Services</h2>
          <p>
            Unfazed provides technical infrastructure enabling licensed therapists, psychologists, and mental health professionals to host digital clinic profiles, receive appointment bookings, maintain clinical notes, manage client billing, and communicate securely.
          </p>
          <p>
            Unfazed does not employ therapists, dictate therapeutic methodologies, or supervise psychological interventions. The therapist is solely responsible for professional licensure, ethics, clinical diagnosis, and standards of care.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Account Registration & Security</h2>
          <p>
            Users must provide accurate, complete information during onboarding. Therapists must verify their professional credentials and are strictly responsible for maintaining confidential access to their accounts, credentials, and client records.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Appointments, Payments & Invoices</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Session Fees:</strong> Rates displayed on therapist profiles are set directly by practitioners. All payments are processed through certified payment aggregators.
            </li>
            <li>
              <strong>Cancellations & Refunds:</strong> Cancellation rules, reschedule allowances, and refunds are determined by the practitioner&apos;s individual policy and must be communicated to the client prior to booking.
            </li>
            <li>
              <strong>Automated Invoices:</strong> Unfazed generates digital invoices and receipts on behalf of the practitioner for completed sessions.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. SaaS Subscriptions & Lifecycle</h2>
          <p>
            Practitioners may choose from free and premium subscription plans (Starter, Professional, Enterprise). Subscriptions are billed monthly or annually. Practitioners can upgrade, downgrade, or cancel their subscription tier at any time through their Subscription Settings. In the event of downgrade or cancellation, access to premium features remains active until the end of the paid billing cycle.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
          <p>
            In no event shall Unfazed or its officers, directors, or employees be liable for indirect, incidental, punitive, or consequential damages arising from the use of practitioner services or technical interruptions.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h3 className="font-bold text-slate-800">Legal Inquiries</h3>
          <p>
            For legal notices or questions regarding these terms, contact{' '}
            <a href="mailto:legal@unfazed.in" className="text-primary-600 font-semibold hover:underline">
              legal@unfazed.in
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
