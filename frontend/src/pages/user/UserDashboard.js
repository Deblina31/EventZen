import React, { useEffect, useState } from "react";
import { getAllEvents, getEventsByCategory } from "../../services/eventService";
import { getAllVenues } from "../../services/venueService";
import { createBooking } from "../../services/bookingService";
import { toast } from "react-toastify";
import { Ticket, Star, Gem, CreditCard, Smartphone, Banknote, MapPin, Calendar, Users } from "lucide-react";

const CATEGORIES = ["ALL", "SOCIAL", "CORPORATE", "SPORTS", "TECH"];

const TICKET_TYPES = [
  { key: "STANDARD", label: "Standard", icon: <Ticket size={20} className="text-blue-500" />, desc: "General admission" },
  { key: "VIP", label: "VIP", icon: <Star size={20} className="text-amber-500" />, desc: "Priority seating + perks" },
  { key: "PREMIUM", label: "Premium", icon: <Gem size={20} className="text-purple-500" />, desc: "Exclusive access + lounge" },
];

const priceForType = (event, type) => {
  if (type === "STANDARD") return event.standardPrice || 0;
  if (type === "VIP") return event.vipPrice || 0;
  if (type === "PREMIUM") return event.premiumPrice || 0;
  return 0;
};

// --- Sub-Component: Ticket Selector ---
const TicketSelector = ({ event, onSelect, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const available = event.availableCapacity ?? ((event.capacity || 0) - (event.soldTickets || 0));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div className="card" style={{ width: 460, maxWidth: "95vw", padding: "2rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ fontWeight: 600 }}>Select Ticket</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginBottom: "1rem" }}>
          {event.name} · {available} seats left
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", padding: "0.75rem", background: "var(--gray-50)", borderRadius: 8 }}>
          <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--gray-600)", flex: 1 }}>Number of Tickets</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button type="button" className="btn btn-outline btn-sm" style={{ width: 32, height: 32 }} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", minWidth: 24, textAlign: "center" }}>{quantity}</span>
            <button type="button" className="btn btn-outline btn-sm" style={{ width: 32, height: 32 }} onClick={() => setQuantity(q => Math.min(available, q + 1))}>+</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {TICKET_TYPES.map(t => {
            const price = priceForType(event, t.key);
            const total = price * quantity;
            return (
              <button key={t.key} onClick={() => onSelect(t.key, price, quantity)} className="btn btn-outline w-full" style={{ justifyContent: "space-between", padding: "1rem", height: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", textAlign: "left" }}>
                  {t.icon}
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.label}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{t.desc}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, color: "var(--primary)" }}>{price > 0 ? `₹${price.toLocaleString()}` : "Free"}</p>
                  {quantity > 1 && <p style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>Total: ₹{total.toLocaleString()}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Payment Modal ---
const PaymentModal = ({ event, ticketType, price, quantity, onConfirm, onClose }) => {
  const [method, setMethod] = useState("card");
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({ cardNumber: "", expiry: "", cvv: "", upiId: "" });

  const totalPrice = price * quantity;

  const handlePay = async () => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate bank delay
    setPaying(false);
    onConfirm();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
      <div className="card" style={{ width: 440, maxWidth: "95vw", padding: "2rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ fontWeight: 600 }}>Checkout</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "1rem", marginBottom: "1.25rem" }}>
          <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{event.name}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{ticketType} Ticket × {quantity}</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontWeight: 700, borderTop: "1px solid #ddd", paddingTop: "0.5rem" }}>
            <span>Total Amount</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {["card", "upi", "cash"].map(m => (
            <button key={m} className={`btn btn-sm ${method === m ? "btn-primary" : "btn-outline"}`} onClick={() => setMethod(m)} style={{ flex: 1, textTransform: "capitalize" }}>{m}</button>
          ))}
        </div>

        {method === "card" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input className="form-input" placeholder="Card Number" value={form.cardNumber} onChange={e => setForm({ ...form, cardNumber: e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim() })} maxLength={19} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <input className="form-input" placeholder="MM/YY" maxLength={5} />
              <input className="form-input" type="password" placeholder="CVV" maxLength={3} />
            </div>
          </div>
        )}

        {method === "upi" && <input className="form-input" placeholder="Enter UPI ID (e.g. name@upi)" />}

        <button className="btn btn-primary w-full" onClick={handlePay} disabled={paying} style={{ marginTop: "1.5rem" }}>
          {paying ? "Processing Payment..." : `Confirm & Pay ₹${totalPrice.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [ticketModal, setTicketModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchData(); }, [category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, vnRes] = await Promise.all([
        category === "ALL" ? getAllEvents() : getEventsByCategory(category),
        getAllVenues()
      ]);
      setEvents(evRes.data || []);
      setVenues(vnRes.data || []);
    } catch { toast.error("Failed to load dashboard data"); }
    finally { setLoading(false); }
  };

  const getVenue = id => venues.find(v => (v.id || v.Id)?.toString() === id?.toString());

  const handleTicketSelect = (ticketType, price, quantity) => {
    setPayModal({ event: ticketModal, ticketType, price, quantity });
    setTicketModal(null);
  };

  const handlePaymentConfirm = async () => {
    setProcessing(true);
    try {
      await createBooking({
        eventId: payModal.event.id,
        ticketType: payModal.ticketType,
        quantity: payModal.quantity,
        price: payModal.price,
        status: "confirmed",
        paymentStatus: "paid"
      });
      toast.success("Booking Successful!");
      setPayModal(null);
      fetchData();
    } catch { toast.error("Booking failed"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">Explore Events</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {CATEGORIES.map(c => (
            <button key={c} className={`btn btn-sm ${category === c ? "btn-primary" : "btn-outline"}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {events.map(event => {
          const venue = getVenue(event.venueId);
          const available = (event.capacity || 0) - (event.soldTickets || 0);
          return (
            <div className="card" key={event.id}>
              <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontWeight: 600 }}>{event.name}</h3>
                <span className={`badge ${available > 0 ? 'badge-info' : 'badge-danger'}`}>{available > 0 ? event.category : "Sold Out"}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
                <span className="flex items-center gap-1"><MapPin size={14} /> {venue?.name || "TBD"}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.startDateTime).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {available} seats left</span>
              </div>
              <button className="btn btn-primary w-full btn-sm" onClick={() => setTicketModal(event)} disabled={available <= 0}>Book Now</button>
            </div>
          );
        })}
      </div>

      {ticketModal && <TicketSelector event={ticketModal} onSelect={handleTicketSelect} onClose={() => setTicketModal(null)} />}
      {payModal && <PaymentModal {...payModal} onConfirm={handlePaymentConfirm} onClose={() => !processing && setPayModal(null)} />}
    </div>
  );
};

export default UserDashboard;