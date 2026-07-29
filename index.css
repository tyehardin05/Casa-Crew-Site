import React, { useState, useEffect } from "react";
import {
  Home, ClipboardList, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  Camera, Shield, Clock, DollarSign, Users, Star, Mail, Phone
} from "lucide-react";

// =============================================================================
// GOOGLE FORM SUBMISSION
// =============================================================================
// This sends real form data into Google Forms (which you own and can view via
// the linked Google Sheet), so nothing depends on this artifact's own storage.
// Google Forms doesn't allow reading the response (CORS), so this is a
// fire-and-forget POST — we can't 100% confirm delivery from the browser side,
// but the request does reach Google's servers.

const CLEANER_FORM_ID = "1FAIpQLSeSYVStJTCKkPoHZ_1UKUkURXDF9KjIuInf1fPzSBgWVEKfmA";
const CLEANER_FORM_ENTRIES = {
  name: "entry.1418396918",
  phone: "entry.1953275802",
  email: "entry.143907988",
  area: "entry.370459579",
  experience: "entry.2138317907",
  references: "entry.142120838",
  ownSupplies: "entry.665244679",
  availability: "entry.514495301",
};

const OWNER_FORM_ID = "1FAIpQLSecWgrB3uw9YtWW6toCh4WDrzmpbYLn7A4H6d6vS8Th8QODmg";
const OWNER_FORM_ENTRIES = {
  name: "entry.1183545556",
  phone: "entry.689009145",
  email: "entry.707725991",
  propertyCount: "entry.473766639",
  area: "entry.1557325937",
  propertyType: "entry.1046785451",
  frequency: "entry.1263127383",
  notes: "entry.1362793287",
};

async function submitToGoogleForm(formId, entryMap, data) {
  if (!formId) {
    console.error("[CasaCrew] Google Form ID not configured for this form yet.");
    return false;
  }
  const url = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
  const body = new URLSearchParams();
  Object.entries(entryMap).forEach(([field, entryId]) => {
    if (entryId) body.append(entryId, data[field] ?? "");
  });

  console.log("[CasaCrew] Submitting to Google Form:", url);
  console.log("[CasaCrew] Payload:", Object.fromEntries(body.entries()));

  // Guard against a request that hangs indefinitely with no error and no response —
  // without this, a stalled network call would leave the button stuck on
  // "Submitting..." forever with no feedback to the user.
  const timeout = (ms) =>
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms));

  try {
    await Promise.race([
      fetch(url, {
        method: "POST",
        mode: "no-cors", // Google Forms doesn't send CORS headers back — this is expected and required.
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }),
      timeout(8000),
    ]);
    console.log("[CasaCrew] Google Form request completed without throwing (response is opaque due to no-cors — check your Google Sheet to confirm the row landed).");
    // With no-cors we can't read the actual response status, so we treat a
    // non-throwing request as a success. Verify by checking the linked Sheet.
    return true;
  } catch (e) {
    console.error("[CasaCrew] Google Form submission failed or timed out:", e);
    return false;
  }
}

// =============================================================================
// STORAGE HELPERS
// =============================================================================

// In-memory fallback so the form still works within this session
// even if persistent storage is unavailable in this environment.
const memoryFallback = { cleaner_application: [], owner_request: [] };

async function saveSubmission(type, data) {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const record = { id, type, submittedAt: new Date().toISOString(), ...data };

  // Always keep the in-memory copy so the admin view has something to show
  // even if persistent storage isn't available.
  memoryFallback[type] = [record, ...(memoryFallback[type] || [])];

  if (typeof window === "undefined" || !window.storage) {
    console.error("window.storage is not available — saved in-memory only for this session");
    return true;
  }

  try {
    const setResult = await window.storage.set(id, JSON.stringify(record), true);
    if (!setResult) return true; // still succeeded via memory fallback

    let existingIds = [];
    try {
      const listResult = await window.storage.get(`index:${type}`, true);
      existingIds = listResult ? JSON.parse(listResult.value) : [];
    } catch (e) {
      existingIds = [];
    }
    await window.storage.set(`index:${type}`, JSON.stringify([...existingIds, id]), true);
    return true;
  } catch (e) {
    console.error("Storage error (saved in-memory only for this session):", e);
    return true; // still succeeded via memory fallback
  }
}

async function loadSubmissions(type) {
  let persisted = [];
  if (typeof window !== "undefined" && window.storage) {
    try {
      const listResult = await window.storage.get(`index:${type}`, true).catch(() => null);
      if (listResult) {
        const ids = JSON.parse(listResult.value);
        const records = await Promise.all(
          ids.map((id) =>
            window.storage.get(id, true).then((r) => (r ? JSON.parse(r.value) : null)).catch(() => null)
          )
        );
        persisted = records.filter(Boolean);
      }
    } catch (e) {
      console.error("Load error:", e);
    }
  }

  // Merge with in-memory fallback (dedupe by id, in-memory wins for this session)
  const memoryRecords = memoryFallback[type] || [];
  const memoryIds = new Set(memoryRecords.map((r) => r.id));
  const merged = [...memoryRecords, ...persisted.filter((r) => !memoryIds.has(r.id))];

  return merged.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

// =============================================================================
// SHARED UI
// =============================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
    .font-serif { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .font-sans { font-family: 'Inter', sans-serif; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fadeUp { animation: fadeUp 0.5s ease-out both; }
    * { -webkit-tap-highlight-color: transparent; }
    button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
      outline: 2px solid #2F6B4F; outline-offset: 2px;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #2F6B4F !important;
      box-shadow: 0 0 0 3px rgba(47,107,79,0.1);
    }
  `}</style>
);

function Logo({ size = "base" }) {
  const dims = size === "lg" ? "w-10 h-10 text-lg" : "w-8 h-8 text-sm";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dims} rounded-lg bg-[#1C2B24] flex items-center justify-center`}>
        <span className="text-[#F7F5F0] font-serif">C</span>
      </div>
      <span className="font-serif text-lg text-[#1C2B24]">Casa Crew</span>
    </div>
  );
}

function TopNav({ onNav, current }) {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0]/95 backdrop-blur-sm border-b border-[#E8E3D8]">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => onNav("home")} className="shrink-0">
          <Logo />
        </button>
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNav("cleaners")}
            className={`text-sm font-medium px-3 py-2 rounded-full transition-colors ${
              current === "cleaners" ? "bg-[#1C2B24] text-white" : "text-[#5A6B60] hover:text-[#1C2B24]"
            }`}
          >
            Cleaners
          </button>
          <button
            onClick={() => onNav("owners")}
            className={`text-sm font-medium px-3 py-2 rounded-full transition-colors ${
              current === "owners" ? "bg-[#1C2B24] text-white" : "text-[#5A6B60] hover:text-[#1C2B24]"
            }`}
          >
            Property owners
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#E8E3D8] mt-24">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Logo />
        <p className="text-xs text-[#8A9B90]">Austin, TX · Turnover & home cleaning</p>
      </div>
    </footer>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#8A9B90] font-medium block mb-1.5">
        {label} {required && <span className="text-[#C9622A]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#8A9B90] mt-1.5">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full bg-white border border-[#E8E3D8] rounded-xl px-4 py-3 text-sm text-[#1C2B24] placeholder:text-[#B8C0BA] focus:border-[#2F6B4F] outline-none transition-colors";

// =============================================================================
// HOME PAGE
// =============================================================================

function HomePage({ onNav }) {
  return (
    <>
      <section className="max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-16">
        <p className="text-xs uppercase tracking-[0.15em] text-[#2F6B4F] font-medium mb-4 animate-fadeUp">
          Austin, TX · Now taking early sign-ups
        </p>
        <h1
          className="font-serif text-4xl sm:text-6xl text-[#1C2B24] leading-[1.05] mb-6 max-w-3xl animate-fadeUp"
          style={{ animationDelay: "0.05s" }}
        >
          Every turnover, handled. Every clean, proven.
        </h1>
        <p
          className="text-[#5A6B60] text-base sm:text-lg max-w-xl mb-10 leading-relaxed animate-fadeUp"
          style={{ animationDelay: "0.1s" }}
        >
          Casa Crew connects Austin short-term rental hosts with vetted local cleaners —
          flat-rate pricing, photo-verified completion, and no scheduling headaches.
          We're building this with our first hosts and cleaners right now.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 animate-fadeUp" style={{ animationDelay: "0.15s" }}>
          <button
            onClick={() => onNav("cleaners")}
            className="flex items-center justify-center gap-2 bg-[#1C2B24] text-white px-6 py-3.5 rounded-full font-medium hover:bg-[#2F6B4F] transition-colors duration-200"
          >
            <ClipboardList size={17} /> Apply as a cleaner
          </button>
          <button
            onClick={() => onNav("owners")}
            className="flex items-center justify-center gap-2 bg-white border border-[#E8E3D8] text-[#1C2B24] px-6 py-3.5 rounded-full font-medium hover:border-[#C9622A] transition-colors duration-200"
          >
            <Home size={17} /> Request cleaning for my property
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-[#E8E3D8]">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#2F6B4F]/10 flex items-center justify-center mb-4">
              <Shield size={18} className="text-[#2F6B4F]" />
            </div>
            <h3 className="font-serif text-lg text-[#1C2B24] mb-2">Vetted, not anonymous</h3>
            <p className="text-sm text-[#5A6B60] leading-relaxed">
              Every cleaner is personally reviewed before they touch a property — references checked, work verified.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#C9622A]/10 flex items-center justify-center mb-4">
              <Camera size={18} className="text-[#C9622A]" />
            </div>
            <h3 className="font-serif text-lg text-[#1C2B24] mb-2">Photo-proof on every job</h3>
            <p className="text-sm text-[#5A6B60] leading-relaxed">
              Cleaners submit photos before marking a job done. You see proof before your next guest checks in.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#1C2B24]/10 flex items-center justify-center mb-4">
              <Clock size={18} className="text-[#1C2B24]" />
            </div>
            <h3 className="font-serif text-lg text-[#1C2B24] mb-2">Built for tight turnovers</h3>
            <p className="text-sm text-[#5A6B60] leading-relaxed">
              We work around guest checkout and check-in windows, not generic cleaning-service hours.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-[#E8E3D8]">
        <div className="bg-white border border-[#E8E3D8] rounded-3xl p-8 sm:p-10">
          <p className="text-xs uppercase tracking-wider text-[#8A9B90] font-medium mb-3">Where we are today</p>
          <h2 className="font-serif text-2xl text-[#1C2B24] mb-4">We're building this with our first crew, not a big platform yet.</h2>
          <p className="text-sm text-[#5A6B60] leading-relaxed max-w-2xl">
            Casa Crew is brand new. Right now, applying or requesting service means a real person — not an algorithm —
            will personally reach out to get you set up. That's on purpose: we're starting small in Austin so every
            first job goes right, before we open things up further.
          </p>
        </div>
      </section>
    </>
  );
}

// =============================================================================
// CLEANER APPLICATION
// =============================================================================

function CleanerPage({ onNav }) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", area: "", experience: "",
    references: "", ownSupplies: "", availability: "",
  });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    console.log("[CasaCrew] handleSubmit fired");
    setError("");

    const missing = [];
    if (!form.name.trim()) missing.push("Full name");
    if (!form.phone.trim()) missing.push("Phone");
    if (!form.email.trim()) missing.push("Email");
    if (!form.area.trim()) missing.push("Area of Austin");
    if (!form.experience.trim()) missing.push("Cleaning experience");
    if (!form.ownSupplies) missing.push("Supplies & transportation");
    if (!form.availability) missing.push("Availability");

    if (missing.length > 0) {
      console.log("[CasaCrew] Validation failed, missing:", missing);
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    console.log("[CasaCrew] Validation passed, submitting...");
    setSaving(true);
    // Send to your Google Form first — this is the reliable, persistent copy.
    const sentToGoogle = await submitToGoogleForm(CLEANER_FORM_ID, CLEANER_FORM_ENTRIES, form);
    console.log("[CasaCrew] submitToGoogleForm returned:", sentToGoogle);
    // Also keep the local/admin-page copy as a secondary view within this session.
    await saveSubmission("cleaner_application", form);
    console.log("[CasaCrew] saveSubmission (local) completed");
    setSaving(false);

    if (sentToGoogle) {
      console.log("[CasaCrew] Showing confirmation screen");
      setSubmitted(true);
    } else {
      setError("Something went wrong submitting your application. Please try again, or reach out directly.");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-[#2F6B4F]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={26} className="text-[#2F6B4F]" />
        </div>
        <h1 className="font-serif text-2xl text-[#1C2B24] mb-3">Application received</h1>
        <p className="text-sm text-[#5A6B60] leading-relaxed mb-8">
          Thanks, {form.name.split(" ")[0] || "there"}. We review every application personally —
          expect to hear from us within a few days at {form.email || "the email you gave us"}.
        </p>
        <button
          onClick={() => onNav("home")}
          className="text-sm font-medium text-[#1C2B24] underline decoration-[#2F6B4F] decoration-2 underline-offset-4"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-14 pb-24">
      <button
        onClick={() => onNav("home")}
        className="flex items-center gap-1.5 text-sm text-[#5A6B60] hover:text-[#1C2B24] transition-colors mb-8"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <p className="text-xs uppercase tracking-[0.15em] text-[#2F6B4F] font-medium mb-3">For cleaners</p>
      <h1 className="font-serif text-3xl sm:text-4xl text-[#1C2B24] leading-tight mb-3">
        Apply to join Casa Crew
      </h1>
      <p className="text-[#5A6B60] text-base leading-relaxed mb-10 max-w-lg">
        You'll work as an independent contractor, choose the jobs you want, and get paid per job —
        no set schedule. Tell us about yourself and we'll follow up personally.
      </p>

      <div className="space-y-5 bg-white border border-[#E8E3D8] rounded-2xl p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Full name" required>
            <input value={form.name} onChange={update("name")} className={inputClass} placeholder="Jordan Rivera" />
          </Field>
          <Field label="Phone" required>
            <input type="tel" value={form.phone} onChange={update("phone")} className={inputClass} placeholder="(512) 555-0134" />
          </Field>
        </div>

        <Field label="Email" required>
          <input type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@example.com" />
        </Field>

        <Field label="Area of Austin you'd work in" required hint="e.g. East Austin, South Congress, Downtown, Zilker, The Domain">
          <input value={form.area} onChange={update("area")} className={inputClass} placeholder="East Austin" />
        </Field>

        <Field label="Cleaning experience" required hint="STR turnovers, house cleaning, hospitality — however long, however it started">
          <textarea
            value={form.experience}
            onChange={update("experience")}
            rows={3}
            className={inputClass}
            placeholder="I've cleaned Airbnbs for 2 years, mostly turnover cleans in the East Austin area..."
          />
        </Field>

        <Field label="References" hint="Names/contacts of past clients or employers who can vouch for your work — optional but helps your application move faster">
          <textarea
            value={form.references}
            onChange={update("references")}
            rows={2}
            className={inputClass}
            placeholder="Maria G., former host client — (512) 555-0199"
          />
        </Field>

        <Field label="Do you have your own cleaning supplies & transportation?" required>
          <select value={form.ownSupplies} onChange={update("ownSupplies")} className={inputClass}>
            <option value="">Select one</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </Field>

        <Field label="Availability" required>
          <select value={form.availability} onChange={update("availability")} className={inputClass}>
            <option value="">Select one</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="All of the above">All of the above</option>
          </select>
        </Field>

        {error && (
          <p className="text-sm text-[#C9622A]">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: "100%",
            backgroundColor: "#1C2B24",
            color: "#FFFFFF",
            padding: "14px 0",
            borderRadius: "9999px",
            fontWeight: 500,
            fontSize: "14px",
            border: "none",
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "default" : "pointer",
          }}
        >
          {saving ? "Submitting..." : "Submit application"}
        </button>
        <p className="text-xs text-[#8A9B90] text-center">
          No commitment yet — we'll follow up to discuss references, a trial job, and the contractor agreement.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// OWNER REQUEST
// =============================================================================

function OwnerPage({ onNav }) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", propertyCount: "", area: "",
    propertyType: "", frequency: "", notes: "",
  });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    console.log("[CasaCrew] handleSubmit (owner) fired");
    setError("");

    const missing = [];
    if (!form.name.trim()) missing.push("Full name");
    if (!form.phone.trim()) missing.push("Phone");
    if (!form.email.trim()) missing.push("Email");
    if (!form.propertyCount) missing.push("Number of properties");
    if (!form.area.trim()) missing.push("Primary area");
    if (!form.propertyType) missing.push("Property type");
    if (!form.frequency) missing.push("Cleaning frequency");

    if (missing.length > 0) {
      console.log("[CasaCrew] Validation failed, missing:", missing);
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    console.log("[CasaCrew] Validation passed, submitting...");
    setSaving(true);
    const sentToGoogle = await submitToGoogleForm(OWNER_FORM_ID, OWNER_FORM_ENTRIES, form);
    console.log("[CasaCrew] submitToGoogleForm (owner) returned:", sentToGoogle);
    await saveSubmission("owner_request", form);
    setSaving(false);

    if (sentToGoogle) {
      setSubmitted(true);
    } else {
      setError("Something went wrong submitting your request. Please try again, or reach out directly.");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-[#C9622A]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={26} className="text-[#C9622A]" />
        </div>
        <h1 className="font-serif text-2xl text-[#1C2B24] mb-3">Request received</h1>
        <p className="text-sm text-[#5A6B60] leading-relaxed mb-8">
          Thanks, {form.name.split(" ")[0] || "there"}. We'll personally reach out at{" "}
          {form.email || "the email you gave us"} to talk through your properties and get your first turnover covered.
        </p>
        <button
          onClick={() => onNav("home")}
          className="text-sm font-medium text-[#1C2B24] underline decoration-[#C9622A] decoration-2 underline-offset-4"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-14 pb-24">
      <button
        onClick={() => onNav("home")}
        className="flex items-center gap-1.5 text-sm text-[#5A6B60] hover:text-[#1C2B24] transition-colors mb-8"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <p className="text-xs uppercase tracking-[0.15em] text-[#C9622A] font-medium mb-3">For property owners</p>
      <h1 className="font-serif text-3xl sm:text-4xl text-[#1C2B24] leading-tight mb-3">
        Get your turnovers covered
      </h1>
      <p className="text-[#5A6B60] text-base leading-relaxed mb-10 max-w-lg">
        Tell us about your property or portfolio, and we'll personally set up a plan for coverage —
        including a no-commitment trial period before anything's official.
      </p>

      <div className="space-y-5 bg-white border border-[#E8E3D8] rounded-2xl p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Full name" required>
            <input value={form.name} onChange={update("name")} className={inputClass} placeholder="Sam Chen" />
          </Field>
          <Field label="Phone" required>
            <input type="tel" value={form.phone} onChange={update("phone")} className={inputClass} placeholder="(512) 555-0134" />
          </Field>
        </div>

        <Field label="Email" required>
          <input type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@example.com" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Number of properties" required>
            <select value={form.propertyCount} onChange={update("propertyCount")} className={inputClass}>
              <option value="">Select one</option>
              <option value="1">Just 1</option>
              <option value="2-5">2–5</option>
              <option value="6-15">6–15</option>
              <option value="16+">16 or more</option>
            </select>
          </Field>
          <Field label="Primary area" required>
            <input value={form.area} onChange={update("area")} className={inputClass} placeholder="East Austin" />
          </Field>
        </div>

        <Field label="Property type" required>
          <select value={form.propertyType} onChange={update("propertyType")} className={inputClass}>
            <option value="">Select one</option>
            <option value="str">Short-term rental (Airbnb/VRBO)</option>
            <option value="home">Personal home / regular cleaning</option>
            <option value="both">Both</option>
          </select>
        </Field>

        <Field label="How often do you need cleanings?" required>
          <select value={form.frequency} onChange={update("frequency")} className={inputClass}>
            <option value="">Select one</option>
            <option value="per-turnover">Every guest turnover</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every other week</option>
            <option value="varies">Varies / as-needed</option>
          </select>
        </Field>

        <Field label="Anything else we should know?" hint="Property size, current cleaning setup, specific concerns — optional">
          <textarea
            value={form.notes}
            onChange={update("notes")}
            rows={3}
            className={inputClass}
            placeholder="3 units in East Austin, currently using a cleaner I found on Facebook who's unreliable..."
          />
        </Field>

        {error && (
          <p className="text-sm text-[#C9622A]">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: "100%",
            backgroundColor: "#1C2B24",
            color: "#FFFFFF",
            padding: "14px 0",
            borderRadius: "9999px",
            fontWeight: 500,
            fontSize: "14px",
            border: "none",
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "default" : "pointer",
          }}
        >
          {saving ? "Submitting..." : "Submit request"}
        </button>
        <p className="text-xs text-[#8A9B90] text-center">
          No commitment — this starts a conversation, not a contract.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// ADMIN VIEW — lets the owner (you) see submissions
// =============================================================================

const NOTIFY_EMAIL = "tyehardin05@gmail.com";
const NOTIFY_PHONE = "5124225111";

function buildCleanerSummary(item) {
  return [
    `New cleaner application: ${item.name}`,
    ``,
    `Phone: ${item.phone}`,
    `Email: ${item.email}`,
    `Area: ${item.area}`,
    `Experience: ${item.experience}`,
    item.references ? `References: ${item.references}` : null,
    `Supplies/transport: ${item.ownSupplies}`,
    `Availability: ${item.availability}`,
    ``,
    `Submitted: ${new Date(item.submittedAt).toLocaleString("en-US")}`,
  ].filter(Boolean).join("\n");
}

function buildOwnerSummary(item) {
  return [
    `New property owner request: ${item.name}`,
    ``,
    `Phone: ${item.phone}`,
    `Email: ${item.email}`,
    `Area: ${item.area}`,
    `Properties: ${item.propertyCount} · ${item.propertyType}`,
    `Frequency: ${item.frequency}`,
    item.notes ? `Notes: ${item.notes}` : null,
    ``,
    `Submitted: ${new Date(item.submittedAt).toLocaleString("en-US")}`,
  ].filter(Boolean).join("\n");
}

function mailtoLink(item, isCleaner) {
  const subject = isCleaner
    ? `New cleaner application — ${item.name}`
    : `New property owner request — ${item.name}`;
  const body = isCleaner ? buildCleanerSummary(item) : buildOwnerSummary(item);
  return `mailto:${NOTIFY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function smsLink(item, isCleaner) {
  const summary = isCleaner ? buildCleanerSummary(item) : buildOwnerSummary(item);
  // Keep texts short — SMS bodies with too much text/encoding can fail to open properly on some devices.
  const shortSummary = isCleaner
    ? `New cleaner app: ${item.name}, ${item.phone}, ${item.area}`
    : `New owner request: ${item.name}, ${item.phone}, ${item.propertyCount} properties in ${item.area}`;
  return `sms:${NOTIFY_PHONE}?&body=${encodeURIComponent(shortSummary)}`;
}


function AdminPage({ onNav }) {
  const [cleaners, setCleaners] = useState(null);
  const [owners, setOwners] = useState(null);
  const [tab, setTab] = useState("cleaners");
  const [storageStatus, setStorageStatus] = useState("checking"); // checking | working | broken | unavailable

  useEffect(() => {
    loadSubmissions("cleaner_application").then(setCleaners);
    loadSubmissions("owner_request").then(setOwners);

    // Live test: actually write and read back a value to confirm persistence works.
    (async () => {
      if (typeof window === "undefined" || !window.storage) {
        setStorageStatus("unavailable");
        return;
      }
      try {
        const testKey = "casa-crew-storage-test";
        const testValue = String(Date.now());
        const setResult = await window.storage.set(testKey, testValue, true);
        if (!setResult) {
          setStorageStatus("broken");
          return;
        }
        const getResult = await window.storage.get(testKey, true);
        if (getResult && getResult.value === testValue) {
          setStorageStatus("working");
        } else {
          setStorageStatus("broken");
        }
      } catch (e) {
        console.error("Storage diagnostic failed:", e);
        setStorageStatus("broken");
      }
    })();
  }, []);

  const list = tab === "cleaners" ? cleaners : owners;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <button
        onClick={() => onNav("home")}
        className="flex items-center gap-1.5 text-sm text-[#5A6B60] hover:text-[#1C2B24] transition-colors mb-8"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <p className="text-xs uppercase tracking-[0.15em] text-[#8A9B90] font-medium mb-3">Internal</p>
      <h1 className="font-serif text-3xl text-[#1C2B24] leading-tight mb-6">Submissions</h1>

      {storageStatus !== "checking" && storageStatus !== "working" && (
        <div className="flex items-start gap-2.5 bg-[#C9622A]/10 border border-[#C9622A]/30 rounded-xl px-4 py-3 mb-6">
          <span className="text-sm text-[#1C2B24]">
            <strong>This page is a live view only, not permanent storage.</strong> Anything listed here
            will disappear if this page is closed or reloaded. Your real, permanent record of every
            submission lives in the Google Sheet linked to your Google Forms — check that for anything
            you need to keep.
          </span>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("cleaners")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            tab === "cleaners" ? "bg-[#1C2B24] text-white border-[#1C2B24]" : "bg-white text-[#5A6B60] border-[#E8E3D8]"
          }`}
        >
          Cleaner applications {cleaners ? `(${cleaners.length})` : ""}
        </button>
        <button
          onClick={() => setTab("owners")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            tab === "owners" ? "bg-[#1C2B24] text-white border-[#1C2B24]" : "bg-white text-[#5A6B60] border-[#E8E3D8]"
          }`}
        >
          Owner requests {owners ? `(${owners.length})` : ""}
        </button>
      </div>

      {list === null && <p className="text-sm text-[#8A9B90]">Loading...</p>}
      {list && list.length === 0 && (
        <div className="bg-white border border-[#E8E3D8] rounded-2xl p-8 text-center">
          <p className="text-sm text-[#8A9B90]">No submissions yet. Once someone applies, they'll show up here.</p>
        </div>
      )}

      <div className="space-y-3">
        {list && list.map((item) => (
          <div key={item.id} className="bg-white border border-[#E8E3D8] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-serif text-lg text-[#1C2B24]">{item.name}</h3>
              <span className="text-xs text-[#8A9B90] font-mono">
                {new Date(item.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#5A6B60] mb-3">
              <span className="flex items-center gap-1.5"><Mail size={13} /> {item.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={13} /> {item.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {item.area}</span>
            </div>
            {tab === "cleaners" ? (
              <div className="text-sm text-[#1C2B24] space-y-1.5 border-t border-[#F0EDE5] pt-3 mb-4">
                <p><span className="text-[#8A9B90]">Experience:</span> {item.experience}</p>
                {item.references && <p><span className="text-[#8A9B90]">References:</span> {item.references}</p>}
                <p><span className="text-[#8A9B90]">Supplies/transport:</span> {item.ownSupplies}</p>
                <p><span className="text-[#8A9B90]">Availability:</span> {item.availability}</p>
              </div>
            ) : (
              <div className="text-sm text-[#1C2B24] space-y-1.5 border-t border-[#F0EDE5] pt-3 mb-4">
                <p><span className="text-[#8A9B90]">Properties:</span> {item.propertyCount} · {item.propertyType}</p>
                <p><span className="text-[#8A9B90]">Frequency:</span> {item.frequency}</p>
                {item.notes && <p><span className="text-[#8A9B90]">Notes:</span> {item.notes}</p>}
              </div>
            )}

            <div className="flex gap-2">
              <a
                href={mailtoLink(item, tab === "cleaners")}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border border-[#E8E3D8] text-[#1C2B24] hover:border-[#2F6B4F] transition-colors"
              >
                <Mail size={13} /> Email me this
              </a>
              <a
                href={smsLink(item, tab === "cleaners")}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border border-[#E8E3D8] text-[#1C2B24] hover:border-[#C9622A] transition-colors"
              >
                <Phone size={13} /> Text me this
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ROOT APP
// =============================================================================

export default function App() {
  const [page, setPage] = useState("home");

  const handleNav = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] font-sans">
      <GlobalStyles />
      <TopNav onNav={handleNav} current={page} />

      {page === "home" && <HomePage onNav={handleNav} />}
      {page === "cleaners" && <CleanerPage onNav={handleNav} />}
      {page === "owners" && <OwnerPage onNav={handleNav} />}
      {page === "admin" && <AdminPage onNav={handleNav} />}

      <Footer />

      {/* Quiet internal link — not part of the public nav */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => handleNav("admin")}
          className="text-[10px] text-[#B8C0BA] hover:text-[#8A9B90] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#E8E3D8]"
        >
          View submissions
        </button>
      </div>
    </div>
  );
}
