"use client";

import { useState } from "react";

export default function ClientContactForm({ brandName, email, whatsapp }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [feedback, setFeedback] = useState("");

  function submit(event) {
    event.preventDefault();
    const message = `Hello ${brandName},\n\n${form.message}\n\nName: ${form.name}\nReply email: ${form.email}`;
    const phone = String(whatsapp || "").replace(/\D/g, "");
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setFeedback("Your message is ready in WhatsApp. Review it and press Send to contact the business.");
    } else if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Website enquiry — ${brandName}`)}&body=${encodeURIComponent(message)}`;
      setFeedback("Your email app should open with the enquiry. Send the message to complete it.");
    } else {
      setFeedback("The business needs to add an email or WhatsApp contact before this form can send messages.");
    }
  }

  return <form className="client-project-contact-form" onSubmit={submit}>
    <label>Your name<input required maxLength={80} autoComplete="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" /></label>
    <label>Email for reply<input required type="email" maxLength={120} autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" /></label>
    <label>Your message<textarea required rows={3} maxLength={1500} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="How can we help?" /></label>
    <button className="client-project-button" type="submit">Prepare enquiry ↗</button>
    {feedback && <p className="client-project-form-feedback" role="status">{feedback}</p>}
  </form>;
}
