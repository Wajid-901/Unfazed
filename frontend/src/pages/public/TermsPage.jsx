import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, AlertTriangle, ArrowLeft } from 'lucide-react';

const TermsPage = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
    <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6860] hover:text-[#1C1C1A]">
      <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
    </Link>

    <div className="border-b border-[#E8E4DC] pb-5">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200 mb-3">
        <FileCheck className="w-3.5 h-3.5 text-brand-500" />
        <span>Platform Agreement</span>
      </div>
      <h1 className="text-3xl font-extrabold text-[#1C1C1A] tracking-tight">Terms of Service</h1>
      <p className="text-xs text-[#9C9890] mt-2">Effective Date: January 1, 2026 • Last Updated: October 2026</p>
    </div>

    <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-8 space-y-6 text-xs text-[#6B6860] leading-relaxed">
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-amber-900 space-y-1">
          <strong className="block font-bold">Important Emergency Disclaimer:</strong>
          <p>Unfazed is a practice management SaaS software platform, not an emergency medical service or crisis helpline. If you or someone you know is experiencing acute distress or thoughts of self-harm, please call emergency services (<strong>112</strong> in India) or the Kiran Mental Health Helpline at <strong>1800-599-0019</strong> immediately.</p>
        </div>
      </div>

      {[
        {
          title: '1. Nature of Services',
          body: 'Unfazed provides technical infrastructure enabling licensed therapists, psychologists, and mental health professionals to host digital clinic profiles, receive appointment bookings, maintain clinical notes, manage client billing, and communicate securely. Unfazed does not employ therapists, dictate therapeutic methodologies, or supervise psychological interventions.'
        },
        {
          title: '2. Account Registration & Security',
          body: 'Users must provide accurate, complete information during onboarding. Therapists must verify their professional credentials and are strictly responsible for maintaining confidential access to their accounts, credentials, and client records.'
        },
        {
          title: '4. SaaS Subscriptions & Lifecycle',
          body: 'Practitioners may choose from free and premium subscription plans (Starter, Professional, Enterprise). Subscriptions are billed monthly or annually. In the event of downgrade or cancellation, access to premium features remains active until the end of the paid billing cycle.'
        },
        {
          title: '5. Limitation of Liability',
          body: 'In no event shall Unfazed or its officers, directors, or employees be liable for indirect, incidental, punitive, or consequential damages arising from the use of practitioner services or technical interruptions.'
        }
      ].map(({ title, body }) => (
        <section key={title} className="space-y-2">
          <h2 className="text-base font-bold text-[#1C1C1A]">{title}</h2>
          <p>{body}</p>
        </section>
      ))}

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#1C1C1A]">3. Appointments, Payments & Invoices</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Session Fees:</strong> Rates displayed on therapist profiles are set directly by practitioners. All payments are processed through certified payment aggregators.</li>
          <li><strong>Cancellations & Refunds:</strong> Cancellation rules and refunds are determined by the practitioner&apos;s individual policy.</li>
          <li><strong>Automated Invoices:</strong> Unfazed generates digital invoices and receipts on behalf of the practitioner for completed sessions.</li>
        </ul>
      </section>

      <section className="space-y-2 border-t border-[#E8E4DC] pt-4">
        <h3 className="font-bold text-[#1C1C1A]">Legal Inquiries</h3>
        <p>For legal notices or questions regarding these terms, contact{' '}
          <a href="mailto:abdulwajid845433@gmail.com" className="text-accent-500 font-semibold hover:underline">abdulwajid845433@gmail.com</a>.
        </p>
      </section>
    </div>
  </div>
);

export default TermsPage;
