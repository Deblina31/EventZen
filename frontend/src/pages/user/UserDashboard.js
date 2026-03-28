import { useEffect, useState } from "react";
import { getAllEvents, getEventsByCategory } from "../../services/eventService";
import { getAllVenues } from "../../services/venueService";
import { createBooking } from "../../services/bookingService";
import { toast } from "react-toastify";
import { Ticket, Star, Gem , CreditCard, Smartphone, Banknote, MapPin, Calendar, Users} from "lucide-react";

const CATEGORIES = ["ALL", "SOCIAL", "CORPORATE", "SPORTS", "TECH"];

const TICKET_TYPES = [
  { key: "STANDARD", label: "Standard",  icon: <Ticket size={20} className="text-blue-500"/>,  desc: "General admission" },
  { key: "VIP",      label: "VIP",       icon: <Star size={20} className="text-amber-500" />,  desc: "Priority seating + perks" },
  { key: "PREMIUM",  label: "Premium",   icon: <Gem size={20} className="text-purple-500" />,  desc: "Exclusive access + lounge" },
];

const priceForType = (event, type) => {
  if (type === "STANDARD") return event.standardPrice || 0;
  if (type === "VIP")      return event.vipPrice      || 0;
  if (type === "PREMIUM")  return event.premiumPrice  || 0;
  return 0;
};

const TicketSelector = ({ event, onSelect, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
    display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div className="card" style={{ width:440, maxWidth:"95vw", padding:"2rem" }}>
      <div className="flex items-center justify-between" style={{ marginBottom:"1.25rem" }}>
        <h3 style={{ fontWeight:600 }}>Select Ticket Type</h3>
        <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
      </div>

      <p style={{ fontSize:"0.875rem", color:"var(--gray-600)", marginBottom:"1rem" }}>
        {event.name} · {event.availableCapacity ?? (event.capacity - event.soldTickets)} seats left
      </p>

      <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
        {TICKET_TYPES.map(t => {
          const price = priceForType(event, t.key);
          return (
            <button key={t.key} onClick={() => onSelect(t.key, price)}
              className="btn btn-outline w-full"
              style={{ justifyContent:"space-between", padding:"1rem",
                       height:"auto", flexDirection:"row" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                <span style={{ fontSize:"1.5rem" }}>{t.icon}</span>
                <div style={{ textAlign:"left" }}>
                  <p style={{ fontWeight:600, fontSize:"0.9rem" }}>{t.label}</p>
                  <p style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>{t.desc}</p>
                </div>
              </div>
              <span style={{ fontWeight:700, color:"var(--primary)", fontSize:"1rem" }}>
                {price > 0 ? `Rs.${price.toLocaleString()}` : "Free"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const PaymentModal = ({ event, ticketType, price, onConfirm, onClose }) => {
  const [method,  setMethod]  = useState("card");
  const [paying,  setPaying]  = useState(false);
  const [form,    setForm]    = useState({ cardNumber:"", expiry:"", cvv:"", upiId:"" });

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    if (method === "card") {
      const raw = form.cardNumber.replace(/\s/g,"");
      if (raw.length < 16)        { toast.error("Enter a valid 16-digit card number"); return false; }
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) { toast.error("Expiry must be MM/YY");  return false; }
      if (form.cvv.length < 3)    { toast.error("CVV must be 3 digits");                return false; }
    }
    if (method === "upi" && !form.upiId.includes("@")) {
      toast.error("Enter a valid UPI ID like name@upi"); return false;
    }
    return true;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setPaying(true);
    await new Promise(r => setTimeout(r, 1800));
    setPaying(false);
    onConfirm();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1001 }}>
      <div className="card" style={{ width:440, maxWidth:"95vw", padding:"2rem" }}>

        <div className="flex items-center justify-between" style={{ marginBottom:"1.25rem" }}>
          <h3 style={{ fontWeight:600 }}>Payment</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ background:"var(--gray-50)", borderRadius:8,
          padding:"1rem", marginBottom:"1.25rem", fontSize:"0.875rem" }}>
          <p style={{ fontWeight:600, marginBottom:"0.25rem" }}>{event.name}</p>
          <p className="text-muted">
            {TICKET_TYPES.find(t => t.key === ticketType)?.icon} {ticketType} ticket
          </p>
          <div style={{ display:"flex", justifyContent:"space-between",
            marginTop:"0.5rem", fontWeight:700, color:"var(--primary)" }}>
            <span>Total</span>
            <span>{price > 0 ? `Rs${price.toLocaleString()}` : "Free"}</span>
          </div>
        </div>

        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.25rem" }}>
          {[
            { key:"card", label:"Card" ,icon: <CreditCard size={18} className="text-blue-600" />},
            { key:"upi",  label:"UPI",icon: <Smartphone size={18} className="text-purple-600" />  },
            { key:"cash", label:"Cash" , icon: <Banknote size={18} className="text-green-600" />},
          ].map(m => (
            <button key={m.key}
              className={`btn btn-sm ${method===m.key?"btn-primary":"btn-outline"}`}
              onClick={() => setMethod(m.key)}>{m.label}
            </button>
          ))}
        </div>

        {method === "card" && (
          <>
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input className="form-input" placeholder="1234 5678 9012 3456"
                maxLength={19} value={form.cardNumber}
                onChange={e => setForm(p => ({ ...p,
                  cardNumber: e.target.value.replace(/\D/g,"")
                    .replace(/(.{4})/g,"$1 ").trim().slice(0,19) }))} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
              <div className="form-group">
                <label className="form-label">Expiry (MM/YY)</label>
                <input className="form-input" placeholder="MM/YY" maxLength={5}
                  value={form.expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g,"");
                    if (v.length >= 2) v = v.slice(0,2) + "/" + v.slice(2,4);
                    setForm(p => ({ ...p, expiry: v }));
                  }} />
              </div>
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input className="form-input" placeholder="•••" maxLength={3}
                  type="password" value={form.cvv} onChange={set("cvv")} />
              </div>
            </div>
          </>
        )}

        {method === "upi" && (
          <div className="form-group">
            <label className="form-label">UPI ID</label>
            <input className="form-input" placeholder="yourname@upi"
              value={form.upiId} onChange={set("upiId")} />
          </div>
        )}

        {method === "cash" && (
          <div style={{ background:"var(--gray-50)", borderRadius:8,
            padding:"0.875rem", fontSize:"0.875rem", marginBottom:"1rem" }}>
            <p style={{ fontWeight:600, marginBottom:"0.25rem" }}>Pay at Venue</p>
            <p className="text-muted">
              Pay Rs.{price.toLocaleString()} at the venue counter on the event day.
              Your booking will be confirmed immediately.
            </p>
          </div>
        )}

        <button className="btn btn-primary w-full"
          onClick={handlePay} disabled={paying}
          style={{ marginTop:"0.5rem" }}>
          {paying
            ? <span>Processing payment...</span>
            : <span>Pay {price > 0 ? `Rs.${price.toLocaleString()}` : "& Confirm"}</span>
          }
        </button>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const [events,     setEvents]     = useState([]);
  const [venues,     setVenues]     = useState([]);
  const [category,   setCategory]   = useState("ALL");
  const [loading,    setLoading]    = useState(false);
  const [ticketModal, setTicketModal] = useState(null);          
  const [payModal,    setPayModal]    = useState(null); 
  const [processing,  setProcessing]  = useState(false);

  useEffect(() => { fetchData(); }, [category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, vnRes] = await Promise.all([
        category === "ALL" ? getAllEvents() : getEventsByCategory(category),
        getAllVenues()
      ]);
      setEvents(Array.isArray(evRes.data) ? evRes.data : []);
      setVenues(Array.isArray(vnRes.data) ? vnRes.data : []);
    } catch { toast.error("Failed to load events"); }
    finally  { setLoading(false); }
  };

  const getVenue = venueId =>
    venues.find(v => (v.id||v.Id)?.toString() === venueId?.toString());

  const handleBookClick = event => {
    const available = event.availableCapacity ??
      ((event.capacity || 0) - (event.soldTickets || 0));
    if (available <= 0) { toast.error("This event is fully booked"); return; }
    setTicketModal(event);
  };

  const handleTicketSelect = (ticketType, price) => {
    setPayModal({ event: ticketModal, ticketType, price });
    setTicketModal(null);
  };

  const handlePaymentConfirm = async () => {
    const { event, ticketType, price } = payModal;
    setProcessing(true);
    try {
      await createBooking({
        eventId:    event.id,
        ticketType,
        quantity: 1,
        price,
        status: "confirmed",
        paymentStatus:"paid",
      });

      toast.success(`Booking confirmed! ${ticketType} ticket for ${event.name}`);
      setPayModal(null);
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.error || "Booking failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between"
        style={{ marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <h1 className="page-title" style={{ margin:0 }}>Browse Events</h1>
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c}
              className={`btn btn-sm ${category===c?"btn-primary":"btn-outline"}`}
              onClick={() => setCategory(c)}>{c}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-muted">Loading events...</p>}
      {!loading && events.length === 0 &&
        <div className="empty-state"><p>No events found for this category.</p></div>}

      <div className="grid-2">
        {events.map(event => {
          const venue     = getVenue(event.venueId);
          const available = event.availableCapacity ??
            ((event.capacity||0) - (event.soldTickets||0));
          const isFull    = available <= 0;

          return (
            <div className="card" key={event.id}>
              <div className="flex items-center justify-between"
                style={{ marginBottom:"0.75rem" }}>
                <h3 style={{ fontSize:"1rem", fontWeight:600 }}>
                  {event.name || event.title}
                </h3>
                <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
                  {event.category &&
                    <span className="badge badge-info">{event.category}</span>}
                  {isFull &&
                    <span className="badge badge-danger">Sold Out</span>}
                </div>
              </div>

              <p style={{ fontSize:"0.85rem", color:"var(--gray-600)",
                marginBottom:"0.75rem" }}>
                {event.description || "No description"}
              </p>
              <div style={{ fontSize:"0.8rem", color:"var(--gray-400)",
                marginBottom:"1rem", display:"flex", flexDirection:"column", gap:"0.3rem" }}>
                <p><MapPin size={14} className="text-primary" />{venue
                  ? `${venue.name||venue.Name} — ${venue.city||venue.City||""}`
                  : "Venue TBD"}</p>
                <p><Calendar size={14} className="text-primary" />{event.startDateTime
                  ? new Date(event.startDateTime).toLocaleString()
                  : "Date TBD"}</p>
                <p><Users size={14} className="text-primary" />{available} / {event.capacity||0} seats available</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
                gap:"0.5rem", marginBottom:"1rem" }}>
                {TICKET_TYPES.map(t => {
                  const p = priceForType(event, t.key);
                  return (
                    <div key={t.key} style={{ textAlign:"center", padding:"0.5rem",
                      background:"var(--gray-50)", borderRadius:6 }}>
                      <div style={{ fontSize:"1rem" }}>{t.icon}</div>
                      <div style={{ fontSize:"0.7rem", color:"var(--gray-400)" }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize:"0.8rem", fontWeight:600,
                        color:"var(--primary)" }}>
                        {p > 0 ? `Rs.${p.toLocaleString()}` : "Free"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className={`btn w-full btn-sm ${isFull?"btn-outline":"btn-primary"}`}
                onClick={() => handleBookClick(event)}
                disabled={isFull}>
                {isFull ? "Sold Out" : "Book Now"}
              </button>
            </div>
          );
        })}
      </div>

      {ticketModal && (
        <TicketSelector
          event={ticketModal}
          onSelect={handleTicketSelect}
          onClose={() => setTicketModal(null)}
        />
      )}

      {payModal && (
        <PaymentModal
          event={payModal.event}
          ticketType={payModal.ticketType}
          price={payModal.price}
          onConfirm={handlePaymentConfirm}
          onClose={() => { if (!processing) setPayModal(null); }}
        />
      )}
    </div>
  );
};

export default UserDashboard;