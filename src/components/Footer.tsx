"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Globe, Shield, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { DOMAIN_RE, MAX_SUMMARY_WORDS, countWords } from "@/lib/contact";

const SEND_FAILED = "Could not send your request. Please try again.";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "What We Do", href: "#what-we-do" },
  { label: "Sectors", href: "#sectors" },
  { label: "About", href: "#about" },
  { label: "Mandates", href: "#mandates" },
  { label: "Contact", href: "#contact" },
];

export const Footer: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form states
  const [nameTitle, setNameTitle] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [link, setLink] = useState("");
  const [summary, setSummary] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Domain validation logic
  const checkDomain = (val: string) => {
    if (!val || !val.includes("@")) return { valid: false, message: "" };
    const parts = val.split("@");
    if (parts.length !== 2) return { valid: false, message: "Invalid email format" };
    const domain = parts[1].trim();
    if (!domain) return { valid: false, message: "Missing domain" };
    if (!DOMAIN_RE.test(domain) || domain.startsWith(".") || domain.endsWith(".")) {
      return { valid: false, message: "Enter a valid domain (e.g. company.com)" };
    }
    return { valid: true, message: `Valid domain: ${domain}` };
  };

  const domainStatus = checkDomain(email);

  // Word count logic
  const wordCount = countWords(summary);
  const isWordLimitExceeded = wordCount > MAX_SUMMARY_WORDS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainStatus.valid) {
      setEmailTouched(true);
      return;
    }
    if (isWordLimitExceeded) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameTitle, email, orgName, link, summary, website }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(data.error || SEND_FAILED);
        return;
      }
    } catch {
      setSubmitError(SEND_FAILED);
      return;
    } finally {
      setSubmitting(false);
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setModalOpen(false);
      setNameTitle("");
      setEmail("");
      setOrgName("");
      setLink("");
      setSummary("");
      setWebsite("");
      setEmailTouched(false);
    }, 2500);
  };

  return (
    <footer id="contact" className="bg-[#030D0A] text-[#86A39E] relative border-t border-[#164335]">
      {/* 1. Contact Us Section */}
      <div className="py-7 sm:py-9 md:py-10 px-4 sm:px-6 md:px-8 text-center relative bg-[#092F26]">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-xs sm:text-[12.5px] uppercase tracking-[0.3em] font-semibold text-brand-gold mb-2 sm:mb-2.5 font-sans">
            CONTACT US
          </div>

          <h2 className="font-serif text-xl sm:text-2xl md:text-[26px] lg:text-[28px] text-white font-normal tracking-tight mb-3.5 sm:mb-4 leading-snug max-w-4xl mx-auto">
            Have an opportunity that needs the right combination of technology, industry and capital?
          </h2>

          <div className="space-y-3 sm:space-y-3.5 text-[#C2D8D2] text-xs sm:text-[13.5px] md:text-sm leading-relaxed font-sans font-light w-full max-w-5xl lg:max-w-6xl xl:max-w-[1240px] mx-auto mb-5 sm:mb-6 text-center sm:text-left bg-[#061F19]/60 p-5 sm:p-6 md:p-7 border border-[#143B30] rounded-none shadow-xl shadow-black/20">
            <p>
              Perhaps you’re bringing an international technology to the GCC, looking to identify the right industrial partners, assessing opportunities within the region’s evolving ecosystems, or working to advance a project that needs a clearer commercial pathway and aligned strategic capital.
            </p>
            <p>
              At Manara Nexus, we look at opportunities through the intersection of innovation, commercialisation and capital. We’re interested in understanding the business case, the challenges you’re navigating and what it will take to move the opportunity forward.
            </p>
            <p>
              Tell us what you’re working on. Share a brief overview of your opportunity, the market you’re targeting and the challenge you’re looking to solve. Our team will review your submission and reach out by email if there’s a potential fit, with details to arrange an initial conversation.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-gold text-[#04120E] font-semibold text-xs uppercase tracking-[0.22em] rounded-sm hover:bg-brand-gold-light transition-all duration-300 shadow-xl shadow-brand-gold/25"
            >
              REQUEST AN INTRO CALL
            </button>
          </div>
        </div>
      </div>

      {/* Intro Call Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#07241C] border border-brand-gold/40 p-6 sm:p-8 rounded-sm max-w-xl w-full relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#86A39E] hover:text-white text-lg p-1"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h3 className="font-serif text-2xl text-white font-normal mb-1">Request Intro Call</h3>
            <p className="text-xs text-[#86A39E] mb-5">
              Share details below and our team will review and respond to schedule an intro call.
            </p>

            {formSubmitted ? (
              <div className="p-8 bg-brand-gold/10 border border-brand-gold/40 text-center rounded-sm">
                <CheckCircle2 className="w-10 h-10 text-brand-gold mx-auto mb-3" />
                <p className="text-white font-semibold text-base">Request Received</p>
                <p className="text-xs text-[#A0B8B2] mt-1.5">
                  Thank you. Our team will review your submission and reach out by email with details to arrange an initial conversation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
                {/* 1. Name, Title */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-brand-gold font-medium mb-1">
                    Name, Title <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={nameTitle}
                    onChange={(e) => setNameTitle(e.target.value)}
                    placeholder="e.g. Marcus Sterling, Managing Director"
                    className="w-full bg-[#041410] border border-[#143B30] rounded-sm px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>

                {/* 2. Email with Auto-check for Domain */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase tracking-wider text-brand-gold font-medium">
                      Email <span className="text-brand-gold">*</span>
                    </label>
                    {email && (
                      <span
                        className={`text-[10px] ${
                          domainStatus.valid ? "text-emerald-400 font-medium" : "text-amber-400"
                        }`}
                      >
                        {domainStatus.message}
                      </span>
                    )}
                  </div>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailTouched(true);
                    }}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="e.g. name@company.com"
                    className={`w-full bg-[#041410] border ${
                      emailTouched && email && !domainStatus.valid
                        ? "border-amber-500/80 focus:border-amber-400"
                        : "border-[#143B30] focus:border-brand-gold"
                    } rounded-sm px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition-colors`}
                  />
                  {emailTouched && email && !domainStatus.valid && (
                    <p className="text-[10px] text-amber-400 mt-1">
                      Please enter an email with a valid domain (e.g. user@domain.com)
                    </p>
                  )}
                </div>

                {/* 3. Organisation Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-brand-gold font-medium mb-1">
                    Organisation Name <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Sovereign Capital / Tech Ventures Corp"
                    className="w-full bg-[#041410] border border-[#143B30] rounded-sm px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>

                {/* 4. LinkedIn / Website Link */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-brand-gold font-medium mb-1">
                    Linkedin / Website Link
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. linkedin.com/in/... or company.com"
                    className="w-full bg-[#041410] border border-[#143B30] rounded-sm px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>

                {/* 5. Summary of Request (limit to 250 words) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase tracking-wider text-brand-gold font-medium">
                      Summary of Your Request <span className="text-brand-gold">*</span>
                    </label>
                    <span
                      className={`text-[10.5px] font-mono ${
                        isWordLimitExceeded ? "text-red-400 font-semibold" : "text-[#7E9A94]"
                      }`}
                    >
                      {wordCount} / {MAX_SUMMARY_WORDS} words
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Share a brief overview of your opportunity, the market you’re targeting and the challenge you’re looking to solve..."
                    className={`w-full bg-[#041410] border ${
                      isWordLimitExceeded ? "border-red-500/80" : "border-[#143B30] focus:border-brand-gold"
                    } rounded-sm px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none resize-none transition-colors leading-relaxed`}
                  />
                  {isWordLimitExceeded && (
                    <p className="text-[10px] text-red-400 mt-0.5">
                      Please limit your summary to {MAX_SUMMARY_WORDS} words (currently {wordCount} words).
                    </p>
                  )}
                </div>

                {/* Honeypot: hidden from visitors, catches bots */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                {submitError && <p className="text-[11px] text-red-400">{submitError}</p>}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isWordLimitExceeded || submitting}
                  className="w-full py-3.5 bg-brand-gold text-[#04120E] font-semibold text-xs uppercase tracking-[0.22em] rounded-sm hover:bg-brand-gold-light transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? "Sending..." : "Submit"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Multi-column Footer Layout matching screenshot */}
      <div className="border-t border-[#133A2E] bg-[#030E0B] pt-16 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Official Logo & Entity */}
          <div className="flex flex-col items-start">
            <div className="w-36 sm:w-40 md:w-44 flex flex-col items-center text-center">
              <div className="relative h-24 sm:h-28 md:h-32 w-full overflow-hidden rounded-none">
                <Image
                  src="/images/manara-logo-stacked.jpg"
                  alt="Manara Nexus Logo"
                  fill
                  className="object-contain object-center"
                />
              </div>
              <p className="text-xs text-brand-gray-muted/90 font-sans font-medium pt-2 text-center w-full">
                Manara Nexus Fz-LLC
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-white mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-brand-gray-muted hover:text-brand-gold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-gold/40" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-white mb-5">
              Contact Us
            </h4>
            <div className="space-y-3.5 text-xs text-brand-gray-muted font-light">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-1">
                  <span>UAE</span>
                  <span>United States</span>
                  <span>India</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 pt-0.5">
                <Mail className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <a href="mailto:contact@manaranexus.com" className="hover:text-brand-gold transition-colors">
                  contact@manaranexus.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>www.manaranexus.com</span>
              </div>
            </div>
          </div>

          {/* Column 4: Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-white mb-5">
              Disclaimer
            </h4>
            <p className="text-[11px] leading-relaxed text-brand-gray-muted/70 font-light">
              Manara Nexus provides strategic and commercial advisory services. This website is for general informational purposes only and does not constitute investment, legal or tax advice, or an offer or solicitation to buy or sell securities. No financing, investment or commercial outcome is guaranteed. Any services are subject to a separate written engagement agreement. Please do not submit confidential or proprietary information through this website.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-brand-gray-muted/60">
          <p>© {new Date().getFullYear()} Manara Nexus Fz-LLC. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[10px] tracking-wider uppercase">UAE &middot; UNITED STATES &middot; INDIA</p>
        </div>
      </div>
    </footer>
  );
};
