import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getMyVenues, createVenue, getAllVenues } from "../../services/venueService";
import { getMyEvents, createEvent, addExpense, getAllEvents } from "../../services/eventService";
import { TrendingUp, TrendingDown} from "lucide-react";


const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);     
  const [allEvents, setAllEvents] = useState([]); 
  const [allVenues, setAllVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [eventForm, setEventForm] = useState({
    name: "", description: "", startDate: "", startTime: "",
    endDate: "", endTime: "", venueId: "", category: "SOCIAL",
    totalBudget: "", venueRent: "", capacity: "",
    standardPrice: "", vipPrice: "", premiumPrice: ""
  });

  const [venueForm, setVenueForm] = useState({ 
    name: "", address: "", city: "", state: "", zipCode: "", 
    capacity: "", description: "", amenities: "", imageUrl: "" 
  });

  const [expenseForm, setExpenseForm] = useState({ eventId: "", amount: "" });
  
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vRes, eRes, allVRes, allERes] = await Promise.all([
        getMyVenues(),
        getMyEvents(),
        getAllVenues(),
        getAllEvents()
      ]);
      setVenues(Array.isArray(vRes.data) ? vRes.data : []);
      setEvents(Array.isArray(eRes.data) ? eRes.data : []);
      setAllVenues(Array.isArray(allVRes.data) ? allVRes.data : []);
      setAllEvents(Array.isArray(allERes.data) ? allERes.data : []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    try {
      await createVenue({ ...venueForm, capacity: parseInt(venueForm.capacity) });
      toast.success("Venue added!");
      setVenueForm({ name: "", address: "", city: "", state: "", zipCode: "", capacity: "", description: "", amenities: "", imageUrl: "" });
      fetchAll();
    } catch (err) {
      toast.error("Failed to add venue");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const startDateTime = `${eventForm.startDate}T${eventForm.startTime || "09:00"}:00`;
    const endDateTime = `${eventForm.endDate || eventForm.startDate}T${eventForm.endTime || "18:00"}:00`;

    try {
      await createEvent({
        ...eventForm,
        startDateTime,
        endDateTime,
        venueId: parseInt(eventForm.venueId),
        totalBudget: parseFloat(eventForm.totalBudget || 0),
        venueRent: parseFloat(eventForm.venueRent || 0),
        capacity: parseInt(eventForm.capacity || 0),
        standardPrice: parseFloat(eventForm.standardPrice || 0),
        vipPrice: parseFloat(eventForm.vipPrice || 0),
        premiumPrice: parseFloat(eventForm.premiumPrice || 0),
      });
      toast.success("Event launched!");
      setEventForm({ name: "", description: "", startDate: "", startTime: "", endDate: "", endTime: "", venueId: "", category: "SOCIAL", totalBudget: "", venueRent: "", capacity: "", standardPrice: "", vipPrice: "", premiumPrice: "" });
      fetchAll();
    } catch (err) {
      toast.error("Failed to create event");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense(expenseForm.eventId, parseFloat(expenseForm.amount));
      toast.success("Expense recorded!");
      setExpenseForm({ eventId: "", amount: "" });
      fetchAll();
    } catch (err) {
      toast.error("Failed to record expense");
    }
  };

  const totalBudgetVal = events.reduce((s, e) => s + (e.totalBudget || 0), 0);
  const totalSpentVal = events.reduce((s, e) => s + (e.currentExpenses || 0), 0);

  if (loading) return <div className="p-10">Updating Dashboard...</div>;

  return (
    <div className="page-wrapper" style={{ padding: "20px" }}>
      <h1 className="page-title">Vendor Central</h1>

      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="stat-card stat-blue"><div className="stat-value">{venues.length}</div><div className="stat-label">My Venues</div></div>
        <div className="stat-card stat-green"><div className="stat-value">{events.length}</div><div className="stat-label">My Events</div></div>
        <div className="stat-card stat-amber"><div className="stat-value">₹{totalBudgetVal.toLocaleString()}</div><div className="stat-label">Total Budget</div></div>
        <div className="stat-card stat-red"><div className="stat-value">₹{totalSpentVal.toLocaleString()}</div><div className="stat-label">Total Spent</div></div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem" }}>
        {[{ key: "dashboard", label: "Dashboard" }, { key: "all-events", label: "All Events" }, { key: "expenses", label: "Expenses" }].map(t => (
          <button key={t.key} className={`btn btn-sm ${activeTab === t.key ? "btn-primary" : "btn-outline"}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <h2 className="section-title">My Venues</h2>
            {venues.map(v => (
              <div className="card" key={v.id || v.Id} style={{ padding: "1rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><strong>{v.name}</strong><p style={{ fontSize: "0.8rem" }}>{v.city} · Cap: {v.capacity}</p></div>
                  <Link to={`/vendor/edit/${v.id}`} className="btn btn-sm btn-outline">Edit</Link>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="section-title">My Event Performance</h2>
            {events.map(ev => {
              const balance = (ev.earnedRevenue || 0) - (ev.currentExpenses || 0);
              const inRed = balance < 0;
              return (
                <div className="card" key={ev.id} style={{ padding: "1rem", marginBottom: "1rem" }}>
                  <div className="flex justify-between">
                    <strong>{ev.name}</strong>
                    <span className="badge badge-info">{ev.category}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", margin: "10px 0" }}>
                    <p>Spent: Rs.{ev.currentExpenses || 0} / Earned: Rs.{ev.earnedRevenue || 0}</p>
                    <div style={{ padding: "5px 10px", borderRadius: "4px", background: inRed ? "#fee2e2" : "#dcfce7", color: inRed ? "#b91c1c" : "#15803d", fontWeight: "bold" }}>
                      Balance: Rs.{balance} {inRed ? <TrendingDown size={18} strokeWidth={2.5} title="Over Budget" /> : <TrendingUp size={18} strokeWidth={2.5} title="In Profit" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "all-events" && (
        <div>
          <h2 className="section-title">All Events</h2>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {allEvents.map(ev => {
              const venue = allVenues.find(v => 
                (v.id || v.Id)?.toString() === ev.venueId?.toString()
              );
              const isOwn = events.some(e => e.id === ev.id);

              return (
                <div className="card" key={ev.id} style={{ 
                  padding: "1.25rem", 
                  borderLeft: isOwn ? "5px solid var(--primary)" : "5px solid #cbd5e1",
                  position: "relative"
                }}>
                  <div className="flex justify-between items-start">
                    <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{ev.name || ev.title}</h3>
                    {isOwn && <span className="badge badge-info">Your Event</span>}
                  </div>

                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "600", color: "var(--gray-800)" }}>
                        {venue ? (venue.name || venue.Name) : "Unknown Venue"}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--gray-400)" }}>
                        {venue ? `${venue.city}, ${venue.state || ''}` : `ID: ${ev.venueId}`}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: "12px", borderTop: "1px dashed #eee", paddingTop: "10px" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--gray-600)" }}>
                      {ev.startDateTime ? new Date(ev.startDateTime).toLocaleDateString() : "Date TBD"}
                    </p>
                    <div className="flex gap-3" style={{ marginTop: "8px" }}>
                      <span className="badge badge-gray">Std: Rs.{ev.standardPrice || 0}</span>
                      <span className="badge badge-gray">VIP: Rs.{ev.vipPrice || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div className="card" style={{ maxWidth: "500px", margin: "0 auto", padding: "1.5rem" }}>
          <h2 className="section-title">Track Event Expense</h2>
          <form onSubmit={handleAddExpense}>
            <div className="form-group mb-3">
              <label>Select Event</label>
              <select 
                className="form-select" 
                required 
                value={expenseForm.eventId} 
                onChange={e => setExpenseForm({...expenseForm, eventId: e.target.value})}
              >
                <option value="">Choose an event...</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group mb-4">
              <label>Amount (in Rs.)</label>
              <input 
                className="form-input" 
                type="number" 
                placeholder="Enter expense amount" 
                required 
                value={expenseForm.amount} 
                onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} 
              />
            </div>
            <button className="btn btn-primary w-full" type="submit">Update Budget</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;