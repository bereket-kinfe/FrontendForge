"use client";
import { useState } from "react";

export default function ClientLeadForm({ brandName, contact = {}, kind = "contact", primary = "#222222" }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", time: "", guests: "2", message: "" });
  const [feedback, setFeedback] = useState("");
  const fields = kind === "booking";
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function submit(event) {
    event.preventDefault();
    const lines = [
      `Hello ${brandName}, I'd like to ${kind === "booking" ? "make a reservation" : kind === "catering" ? "ask about catering" : "send an enquiry"}.`,
      `Name: ${form.name}`, `Phone: ${form.phone}`,
      ...(form.email ? [`Email: ${form.email}`] : []),
      ...(fields ? [`Preferred date: ${form.date}`, `Preferred time: ${form.time}`, `Guests: ${form.guests}`] : []),
      ...(form.message ? [`Message: ${form.message}`] : [])
    ];
    const message = encodeURIComponent(lines.join("\n"));
    const whatsapp = String(contact.whatsapp || contact.phone || "").replace(/\D/g, "");
    if (whatsapp) {
      const url = `https://wa.me/${whatsapp}?text=${message}`;
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) window.location.assign(url);
      setFeedback("Your request is ready in WhatsApp. Press Send there to submit it to the business.");
    } else if (contact.email) {
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`${kind} enquiry — ${brandName}`)}&body=${message}`;
      setFeedback("Your email app should open with the enquiry details ready to send.");
    } else {
      setFeedback("The business needs to add a verified phone, WhatsApp or email address before this form can send.");
    }
  }
  return <form className="ff-lead-form" onSubmit={submit}>
    <div className="ff-lead-grid">
      <label>Full name *<input name="name" value={form.name} onChange={update} required autoComplete="name" maxLength={100}/></label>
      <label>Phone number *<input name="phone" type="tel" value={form.phone} onChange={update} required autoComplete="tel" maxLength={35}/></label>
      <label>Email address<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" maxLength={120}/></label>
      {fields && <>
        <label>Preferred date *<input name="date" type="date" value={form.date} onChange={update} required/></label>
        <label>Preferred time *<input name="time" type="time" value={form.time} onChange={update} required/></label>
        <label>Number of guests<select name="guests" value={form.guests} onChange={update}>{[1,2,3,4,5,6,7,8,9,10,12,15,20].map((n)=><option key={n} value={n}>{n}</option>)}</select></label>
      </>}
      <label className="ff-lead-wide">{fields ? "Special requests" : "How can we help?"}<textarea name="message" value={form.message} onChange={update} rows={4} maxLength={1200}/></label>
    </div>
    <button type="submit" style={{ "--lead-primary": primary }}>{fields ? "Send reservation request ↗" : "Send enquiry ↗"}</button>
    {feedback && <p role="status" className="ff-lead-feedback">{feedback}</p>}
    <small>This form prepares a message for the business; it does not create a confirmed booking or server-side ticket.</small>
  </form>;
}
