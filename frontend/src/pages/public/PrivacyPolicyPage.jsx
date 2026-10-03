import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
    <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6860] hover:text-[#1C1C1A]">
      <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
    </Link>

    <div className="border-b border-[#E8E4DC] pb-5">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
        <Shield className="w-3.5 h-3.5 text-emerald-600" />
        <span>HIPAA & DPDP Act 2023 Aligned Practices</span>
      </div>
      <h1 className="text-3xl font-extrabold text-[#1C1C1A] tracking-tight">Privacy Policy</h1>
      <p className="text-xs text-[#9C9890] mt-2">Effective Date: January 1, 2026 • Last Updated: October 2026</p>
    </div>

    <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-8 space-y-6 text-xs text-[#6B6860] leading-relaxed">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#1C1C1A] flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-500" /> 1. Commitment to Client Confidentiality
        </h2>
        <p>At <strong>Unfazed</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;), we recognize that mental health data is among the most sensitive personal information in existence. We are built from the ground up to respect patient-therapist privilege, ethical confidentiality standards, and applicable privacy laws, including the Digital Personal Data Protection (DPDP) Act of 2023.</p>
        <p>Therapy records, SOAP/DAP notes, and intake documents are protected with role-based access control and strict data segregation. <strong>Private clinical notes written by a therapist are never shared, sold, or surfaced to clients, third parties, or advertising networks.</strong></p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#1C1C1A] flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-500" /> 2. Information We Collect
        </h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Therapist Account Information:</strong> Name, professional email, credentials, hourly rate, and availability.</li>
          <li><strong>Client Booking Information:</strong> Name, email, phone, appointment dates/times, and optional presenting concerns.</li>
          <li><strong>Clinical & Intake Records:</strong> Medical history, consent agreements, and session notes entered securely by practitioners.</li>
          <li><strong>Payment Data:</strong> Transaction identifiers, amounts, and statuses via RBI-authorized aggregators. We do not store card numbers or UPI PINs.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#1C1C1A] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-500" /> 3. How We Use and Protect Data
        </h2>
        <p>We process data exclusively for delivering practice management capabilities. All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Scheduling sessions and preventing double bookings in real time.</li>
          <li>Facilitating direct communication between clients and their selected practitioner.</li>
          <li>Generating automated receipts, invoices, and session audit logs.</li>
          <li>Enforcing strict entitlement and quota verification for SaaS subscription tiers.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#1C1C1A]">4. Data Sharing & Third-Party Processors</h2>
        <p>We never monetize, broker, or sell personal or clinical records. Data is transmitted only to essential infrastructure sub-processors:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Payment Aggregators (Razorpay):</strong> Tokenized payment handling and webhook verification.</li>
          <li><strong>Transactional Email Providers:</strong> Booking confirmations and password reset notifications.</li>
          <li><strong>Encrypted Cloud Datastores:</strong> ISO 27001 and SOC 2 Type II compliant cloud database clusters.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#1C1C1A]">5. Your Rights & Data Deletion</h2>
        <p>Clients and practitioners have the right to request access, correction, or deletion of their personal information. Upon written request to our compliance desk, accounts and associated records can be archived or deleted.</p>
      </section>

      <section className="space-y-2 border-t border-[#E8E4DC] pt-4">
        <h3 className="font-bold text-[#1C1C1A]">Contact Data Protection Officer</h3>
        <p>For privacy inquiries, contact{' '}
          <a href="mailto:privacy@unfazed.in" className="text-accent-500 font-semibold hover:underline">privacy@unfazed.in</a>.
        </p>
      </section>
    </div>
  </div>
);

export default PrivacyPolicyPage;
