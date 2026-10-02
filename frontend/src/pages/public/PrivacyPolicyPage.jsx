import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>HIPAA & DPDP Act 2023 Aligned Practices</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-2">
          Effective Date: January 1, 2026 • Last Updated: October 2026
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6 text-xs text-slate-600 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary-600" /> 1. Commitment to Client Confidentiality
          </h2>
          <p>
            At <strong>Unfazed</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;), we recognize that mental health data is among the most sensitive personal information in existence. We are built from the ground up to respect patient-therapist privilege, ethical confidentiality standards, and applicable privacy laws, including the Digital Personal Data Protection (DPDP) Act of 2023.
          </p>
          <p>
            Therapy records, SOAP/DAP notes, and intake documents are protected with role-based access control and strict data segregation. <strong>Private clinical notes written by a therapist are never shared, sold, or surfaced to clients, third parties, or advertising networks.</strong>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" /> 2. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Therapist Account Information:</strong> Name, professional email address, registration credentials, qualification, hourly rate, time slot availability, and practice bio.
            </li>
            <li>
              <strong>Client Booking Information:</strong> Name, email address, phone number, booked appointment dates/times, and optional presenting concerns provided during scheduling.
            </li>
            <li>
              <strong>Clinical & Intake Records:</strong> Medical history, previous therapy context, consent agreements, and session notes entered securely by practitioners.
            </li>
            <li>
              <strong>Payment Data:</strong> Payment transaction identifiers, amounts, and statuses processed securely via RBI-authorized payment aggregators (e.g., Razorpay). We do not store credit/debit card numbers or UPI PINs on our servers.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary-600" /> 3. How We Use and Protect Data
          </h2>
          <p>
            We process data exclusively for delivering practice management capabilities, including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Scheduling sessions and preventing double bookings in real time.</li>
            <li>Facilitating direct communication between clients and their selected practitioner.</li>
            <li>Generating automated receipts, invoices, and session audit logs.</li>
            <li>Enforcing strict entitlement and quota verification for SaaS subscription tiers.</li>
          </ul>
          <p>
            All data in transit is encrypted using Transport Layer Security (TLS 1.3). Data at rest is encrypted using AES-256. Database access is strictly firewall-protected with multi-factor authentication.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Data Sharing & Third-Party Processors</h2>
          <p>
            We never monetize, broker, or sell personal or clinical records. Data is transmitted only to essential infrastructure sub-processors:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Payment Aggregators (Razorpay):</strong> Tokenized payment handling and webhook verification.</li>
            <li><strong>Transactional Email Providers:</strong> Booking confirmations and password reset notifications.</li>
            <li><strong>Encrypted Cloud Datastores:</strong> ISO 27001 and SOC 2 Type II compliant cloud database clusters.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">5. Your Rights & Data Deletion</h2>
          <p>
            Clients and practitioners have the right to request access, correction, or deletion of their personal information. Upon written request to our compliance desk, accounts and associated client CRM records can be archived or deleted in accordance with professional medical retention requirements.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h3 className="font-bold text-slate-800">Contact Data Protection Officer</h3>
          <p>
            For privacy inquiries, rights enforcement, or compliance questions, please contact{' '}
            <a href="mailto:privacy@unfazed.in" className="text-primary-600 font-semibold hover:underline">
              privacy@unfazed.in
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
