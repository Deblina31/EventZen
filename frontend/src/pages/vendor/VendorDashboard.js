import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown} from "lucide-react";
import { getMyVenues, createVenue, getAllVenues } from "../../services/venueService";
import { getMyEvents, createEvent, addExpense, getAllEvents } from "../../services/eventService";
import { getFeedbackByEvent } from "../../services/feedbackService";

const CATEGORIES = ["SOCIAL", "CORPORATE", "SPORTS", "TECH"];

const VendorDashboard = () => {
  const [activeTab,  setActiveTab]  = useState("dashboard");
  const [venues,     setVenues]     = useState([]);
  const [events,     setEvents]     = useState([]);
  const [allEvents,  setAllEvents]  = useState([]);
  const [allVenues,  setAllVenues]  = useState([]);
  const [loading,    setLoading]    = useState(false);

  //feedback
  const [eventFeedback, setEventFeedback] = useState({});

  const [venueForm, setVenueForm] = useState({
    name: "", address: "", city: "", state: "", zipCode: "",
    capacity: "", description: "", amenities: "", imageUrl: ""
  });

  const [eventForm, setEventForm] = useState({
    name: "", description: "", startDate: "", startTime: "",
    endDate: "", endTime: "", venueId: "", category: "SOCIAL",
    totalBudget: "", venueRent: "", capacity: "",
    standardPrice: "", vipPrice: "", premiumPrice: ""
  });

  const [expenseForm, setExpenseForm] = useState({ eventId: "", amount: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vRes, eRes, allVRes, allERes] = await Promise.all([
        getMyVenues(),
        getMyEvents(),
        getAllVenues(),
        getAllEvents()
      ]);
      setVenues(Array.isArray(vRes.data)    ? vRes.data    : []);
      setEvents(Array.isArray(eRes.data)    ? eRes.data    : []);
      setAllVenues(Array.isArray(allVRes.data) ? allVRes.data : []);
      setAllEvents(Array.isArray(allERes.data) ? allERes.data : []);

      //feedback for vendor's own events
      const myEvents = Array.isArray(eRes.data) ? eRes.data : [];
      if (myEvents.length > 0) {
        const feedbackResults = await Promise.allSettled(
          myEvents.map(ev => getFeedbackByEvent(ev.id))
        );
        const feedbackMap = {};
        feedbackResults.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            feedbackMap[myEvents[idx].id] = result.value.data || [];
          } else {
            feedbackMap[myEvents[idx].id] = [];
          }
        });
        setEventFeedback(feedbackMap);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    try {
      await createVenue({ ...venueForm, capacity: parseInt(venueForm.capacity) });
      toast.success("Venue registered!");
      setVenueForm({
        name: "", address: "", city: "", state: "", zipCode: "",
        capacity: "", description: "", amenities: "", imageUrl: ""
      });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add venue");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.venueId)   { toast.error("Select a venue");   return; }
    if (!eventForm.startDate) { toast.error("Set a start date"); return; }

    const startDateTime = `${eventForm.startDate}T${eventForm.startTime || "09:00"}:00`;
    const endDateTime   = `${eventForm.endDate || eventForm.startDate}T${eventForm.endTime || "18:00"}:00`;

    try {
      await createEvent({
        name:          eventForm.name,
        description:   eventForm.description,
        startDateTime,
        endDateTime,
        venueId:       parseInt(eventForm.venueId),
        category:      eventForm.category,
        totalBudget:   parseFloat(eventForm.totalBudget   || 0),
        venueRent:     parseFloat(eventForm.venueRent     || 0),
        capacity:      parseInt(eventForm.capacity        || 0),
        standardPrice: parseFloat(eventForm.standardPrice || 0),
        vipPrice:      parseFloat(eventForm.vipPrice      || 0),
        premiumPrice:  parseFloat(eventForm.premiumPrice  || 0),
      });
      toast.success("Event launched!");
      setEventForm({
        name: "", description: "", startDate: "", startTime: "",
        endDate: "", endTime: "", venueId: "", category: "SOCIAL",
        totalBudget: "", venueRent: "", capacity: "",
        standardPrice: "", vipPrice: "", premiumPrice: ""
      });
      fetchAll();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object" && !data.error) {
        Object.values(data).forEach(msg => toast.error(msg));
      } else {
        toast.error(data?.error || "Failed to create event");
      }
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense(expenseForm.eventId, parseFloat(expenseForm.amount));
      toast.success("Expense recorded!");
      setExpenseForm({ eventId: "", amount: "" });
      fetchAll();
    } catch {
      toast.error("Failed to record expense");
    }
  };

  const totalBudgetVal = events.reduce((s, e) => s + (e.totalBudget      || 0), 0);
  const totalSpentVal  = events.reduce((s, e) => s + (e.currentExpenses  || 0), 0);

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  if (loading) return (
    <div className="page-wrapper">
      <p className="text-muted">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Vendor Dashboard</h1>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          { label:"MY VENUES",    value: venues.length,                        cls:"stat-blue"  },
          { label:"MY EVENTS",    value: events.length,                        cls:"stat-green" },
          { label:"TOTAL BUDGET", value:`Rs.${totalBudgetVal.toLocaleString()}`, cls:"stat-amber" },
          { label:"TOTAL SPENT",  value:`Rs.${totalSpentVal.toLocaleString()}`,  cls:"stat-red"   },
        ].map(s => (
          <div className={`stat-card ${s.cls}`} key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem",
        borderBottom:"1px solid var(--gray-200)", paddingBottom:"0.75rem" }}>
        {[
          { key:"dashboard",  label:"Dashboard"  },
          { key:"all-events", label:"All Events"  },
          { key:"expenses",   label:"Expenses"    },
        ].map(t => (
          <button key={t.key}
            className={`btn btn-sm ${activeTab===t.key?"btn-primary":"btn-outline"}`}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem" }}>
          <div>
            <h2 className="section-title">My Venues</h2>
            <div style={{ display:"flex", flexDirection:"column",
              gap:"0.75rem", marginBottom:"1.25rem" }}>
              {venues.length === 0 && (
                <div className="empty-state"><p>No venues yet</p></div>
              )}
              {venues.map(v => (
                <div className="card" key={v.id||v.Id}
                  style={{ padding:"1rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center" }}>
                    <div>
                      <p style={{ fontWeight:600 }}>{v.name||v.Name}</p>
                      <p style={{ fontSize:"0.8rem", color:"var(--gray-400)" }}>
                        {v.city||v.City} · Cap: {v.capacity||v.Capacity}
                      </p>
                      {(v.amenities||v.Amenities) && (
                        <p style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>
                          {v.amenities||v.Amenities}
                        </p>
                      )}
                    </div>
                    <Link to={`/vendor/edit/${v.id||v.Id}`}
                      className="btn btn-sm btn-outline">Edit</Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 className="section-title">Register New Venue</h3>
              <form onSubmit={handleAddVenue}>
                <div className="form-group">
                  <label className="form-label">Venue Name *</label>
                  <input className="form-input" placeholder="Venue Name" required
                    value={venueForm.name}
                    onChange={e => setVenueForm({...venueForm, name: e.target.value})} />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                  gap:"0.5rem" }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" placeholder="Enter City" required
                      value={venueForm.city}
                      onChange={e => setVenueForm({...venueForm, city: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity *</label>
                    <input className="form-input" type="number" placeholder="Ex. 200" required
                      value={venueForm.capacity}
                      onChange={e => setVenueForm({...venueForm, capacity: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" placeholder="Enter Address"
                    value={venueForm.address}
                    onChange={e => setVenueForm({...venueForm, address: e.target.value})} />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                  gap:"0.5rem" }}>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" placeholder=" Enter State"
                      value={venueForm.state}
                      onChange={e => setVenueForm({...venueForm, state: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zip Code</label>
                    <input className="form-input" placeholder="400001"
                      value={venueForm.zipCode}
                      onChange={e => setVenueForm({...venueForm, zipCode: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Amenities</label>
                  <input className="form-input"
                    placeholder="WiFi, Parking, AC, etc..."
                    value={venueForm.amenities}
                    onChange={e => setVenueForm({...venueForm, amenities: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input"
                    placeholder="https://example.com/venue.jpg"
                    value={venueForm.imageUrl}
                    onChange={e => setVenueForm({...venueForm, imageUrl: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2}
                    placeholder="Describe your venue..."
                    value={venueForm.description}
                    onChange={e => setVenueForm({...venueForm, description: e.target.value})} />
                </div>

                <button className="btn btn-primary w-full" type="submit">
                  Register Venue
                </button>
              </form>
            </div>
          </div>

          <div>
            <h2 className="section-title">Budget Analysis</h2>

            <div style={{ display:"flex", flexDirection:"column",
              gap:"0.75rem", marginBottom:"1.25rem" }}>
              {events.length === 0 && (
                <div className="empty-state"><p>No events yet</p></div>
              )}
              {events.map(ev => {
                const balance   = (ev.earnedRevenue||0) - (ev.currentExpenses||0);
                const inRed     = balance < 0;
                const breakEven = ev.venueRent && ev.standardPrice
                  ? Math.ceil(ev.venueRent / ev.standardPrice) : null;
                const sold = ev.soldTickets || 0;
                const cap  = ev.capacity    || 0;
                const pct  = cap > 0 ? Math.min(100,(sold/cap)*100) : 0;
                const fb   = eventFeedback[ev.id] || [];
                const avgRating = fb.length > 0
                  ? (fb.reduce((s,f) => s + f.rating, 0) / fb.length).toFixed(1)
                  : null;

                return (
                  <div className="card" key={ev.id} style={{ padding:"1rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"flex-start", marginBottom:"0.5rem" }}>
                      <p style={{ fontWeight:600, fontSize:"0.9rem" }}>{ev.name}</p>
                      <span className="badge badge-info">{ev.category}</span>
                    </div>

                    {cap > 0 && (
                      <div style={{ marginBottom:"0.5rem" }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          fontSize:"0.72rem", color:"var(--gray-400)",
                          marginBottom:"0.2rem" }}>
                          <span>{sold} sold</span>
                          <span>{cap - sold} left of {cap}</span>
                        </div>
                        <div style={{ height:5, background:"var(--gray-100)",
                          borderRadius:3 }}>
                          <div style={{ height:"100%", borderRadius:3,
                            background: pct >= 100
                              ? "var(--danger)" : "var(--success)",
                            width:`${pct}%` }} />
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize:"0.78rem", display:"grid",
                      gridTemplateColumns:"1fr 1fr", gap:"0.2rem 0.75rem",
                      marginBottom:"0.5rem" }}>
                      <p>Budget: Rs.{(ev.totalBudget||0).toLocaleString()}</p>
                      <p>Rent: Rs.{(ev.venueRent||0).toLocaleString()}</p>
                      <p>Spent: Rs.{(ev.currentExpenses||0).toLocaleString()}</p>
                      <p>Earned: <span style={{ color:"var(--success)" }}>
                        Rs.{(ev.earnedRevenue||0).toLocaleString()}</span></p>
                    </div>

                    <div style={{ padding:"0.4rem 0.75rem", borderRadius:6,
                      fontSize:"0.78rem", fontWeight:600,
                      display:"flex", alignItems:"center", gap:"0.5rem",
                      background: inRed ? "#fee2e2" : "#dcfce7",
                      color: inRed ? "var(--danger)" : "var(--success)" }}>
                      Balance: {inRed?"-":"+"}Rs{Math.abs(balance).toLocaleString()}
                      {inRed
                        ? <TrendingDown size={14} />
                        : <TrendingUp   size={14} />}
                    </div>

                    {breakEven && (
                      <p style={{ fontSize:"0.72rem", color:"var(--gray-400)",
                        marginTop:"0.3rem" }}>
                        Break-even: {breakEven} Standard tickets
                      </p>
                    )}

                    {fb.length > 0 && (
                      <div style={{ marginTop:"0.75rem", borderTop:
                        "1px solid var(--gray-100)", paddingTop:"0.75rem" }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"center", marginBottom:"0.5rem" }}>
                          <p style={{ fontSize:"0.8rem", fontWeight:600 }}>
                            Reviews ({fb.length})
                          </p>
                          <span style={{ fontSize:"0.8rem", color:"#f59e0b",
                            fontWeight:600 }}>
                            {stars(Math.round(parseFloat(avgRating)))} {avgRating}
                          </span>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column",
                          gap:"0.4rem", maxHeight:140, overflowY:"auto" }}>
                          {fb.map(f => (
                            <div key={f.id} style={{ background:"var(--gray-50)",
                              borderRadius:6, padding:"0.5rem 0.625rem",
                              fontSize:"0.78rem" }}>
                              <div style={{ display:"flex",
                                justifyContent:"space-between",
                                marginBottom:"0.2rem" }}>
                                <span style={{ fontWeight:600 }}>
                                  {f.username}
                                </span>
                                <span style={{ color:"#f59e0b" }}>
                                  {"★".repeat(f.rating)}
                                  {"☆".repeat(5-f.rating)}
                                </span>
                              </div>
                              {f.comment && (
                                <p style={{ color:"var(--gray-600)", margin:0 }}>
                                  {f.comment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {fb.length === 0 && (
                      <p style={{ fontSize:"0.75rem", color:"var(--gray-400)",
                        marginTop:"0.5rem" }}>
                        No reviews yet
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="card">
              <h3 className="section-title">Create New Event</h3>
              <form onSubmit={handleAddEvent}>
                <div className="form-group">
                  <label className="form-label">Event Name *</label>
                  <input className="form-input" placeholder="Event Name"
                    required value={eventForm.name}
                    onChange={e => setEventForm({...eventForm, name: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2}
                    placeholder="Describe the event..."
                    value={eventForm.description}
                    onChange={e => setEventForm({...eventForm,
                      description: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                    gap:"0.5rem" }}>
                    <input className="form-input" type="date"
                      value={eventForm.startDate}
                      onChange={e => setEventForm({...eventForm,
                        startDate: e.target.value})} />
                    <input className="form-input" type="time"
                      value={eventForm.startTime}
                      onChange={e => setEventForm({...eventForm,
                        startTime: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                    gap:"0.5rem" }}>
                    <input className="form-input" type="date"
                      value={eventForm.endDate}
                      onChange={e => setEventForm({...eventForm,
                        endDate: e.target.value})} />
                    <input className="form-input" type="time"
                      value={eventForm.endTime}
                      onChange={e => setEventForm({...eventForm,
                        endTime: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue *</label>
                  <select className="form-select" required
                    value={eventForm.venueId}
                    onChange={e => setEventForm({...eventForm,
                      venueId: e.target.value})}>
                    <option value="">Select a venue</option>
                    {allVenues.map(v => (
                      <option key={v.id||v.Id} value={v.id||v.Id}>
                        {v.name||v.Name} — {v.city||v.City}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={eventForm.category}
                    onChange={e => setEventForm({...eventForm,
                      category: e.target.value})}>
                    {CATEGORIES.map(c =>
                      <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                  gap:"0.5rem" }}>
                  <div className="form-group">
                    <label className="form-label">Budget Cap (in Rs)</label>
                    <input className="form-input" type="number" placeholder="100000"
                      value={eventForm.totalBudget}
                      onChange={e => setEventForm({...eventForm,
                        totalBudget: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue Rent (in Rs)</label>
                    <input className="form-input" type="number" placeholder="20000"
                      value={eventForm.venueRent}
                      onChange={e => setEventForm({...eventForm,
                        venueRent: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Total Capacity *</label>
                  <input className="form-input" type="number" placeholder="200"
                    required value={eventForm.capacity}
                    onChange={e => setEventForm({...eventForm,
                      capacity: e.target.value})} />
                </div>

                <div style={{ background:"var(--gray-50)", borderRadius:8,
                  padding:"0.875rem", marginBottom:"1rem" }}>
                  <p style={{ fontWeight:600, fontSize:"0.8rem",
                    marginBottom:"0.5rem" }}>
                    Ticket Prices
                  </p>
                  <div style={{ display:"grid",
                    gridTemplateColumns:"1fr 1fr 1fr", gap:"0.5rem" }}>
                    {[
                      { label:"Standard", name:"standardPrice", ph:"500"  },
                      { label:"VIP",      name:"vipPrice",      ph:"1000" },
                      { label:"Premium",  name:"premiumPrice",  ph:"2000" },
                    ].map(f => (
                      <div key={f.name}>
                        <label style={{ fontSize:"0.7rem",
                          color:"var(--gray-600)" }}>{f.label}</label>
                        <input className="form-input" type="number"
                          placeholder={f.ph} value={eventForm[f.name]}
                          onChange={e => setEventForm({...eventForm,
                            [f.name]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary w-full" type="submit">
                  Add Event
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === "all-events" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:"1rem" }}>
            <h2 className="section-title" style={{ margin:0 }}>
              All Events
            </h2>
            <span style={{ fontSize:"0.8rem", color:"var(--gray-400)" }}>
              {allEvents.length} events total
            </span>
          </div>

          {allEvents.length === 0 && (
            <div className="empty-state"><p>No events found</p></div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:"1.5rem" }}>
            {allEvents.map(ev => {
              const venue = allVenues.find(v =>
                (v.id||v.Id)?.toString() === ev.venueId?.toString());
              const isOwn = events.some(e => e.id === ev.id);
              const sold  = ev.soldTickets || 0;
              const cap   = ev.capacity    || 0;
              const pct   = cap > 0 ? Math.min(100,(sold/cap)*100) : 0;

              return (
                <div className="card" key={ev.id}
                  style={{ borderLeft: isOwn
                    ? "3px solid var(--primary)"
                    : "3px solid var(--gray-200)" }}>

                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"flex-start", marginBottom:"0.75rem" }}>
                    <h3 style={{ fontSize:"1rem", fontWeight:600 }}>
                      {ev.name||ev.title}
                    </h3>
                    <div style={{ display:"flex", gap:"0.4rem",
                      flexWrap:"wrap" }}>
                      {isOwn && (
                        <span className="badge badge-info">My Event</span>
                      )}
                      {ev.category && (
                        <span className="badge badge-gray">{ev.category}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ background:"var(--gray-50)", borderRadius:6,
                    padding:"0.625rem", marginBottom:"0.75rem",
                    fontSize:"0.82rem" }}>
                    {venue ? (
                      <>
                        <p style={{ fontWeight:600 }}>
                          {venue.name||venue.Name}
                        </p>
                        <p style={{ color:"var(--gray-400)" }}>
                          {[
                            venue.address||venue.Address,
                            venue.city||venue.City,
                            venue.state||venue.State
                          ].filter(Boolean).join(", ")}
                        </p>
                        {(venue.amenities||venue.Amenities) && (
                          <p style={{ color:"var(--gray-400)" }}>
                            ✨ {venue.amenities||venue.Amenities}
                          </p>
                        )}
                      </>
                    ) : (
                      <p style={{ color:"var(--gray-400)" }}>
                        Venue details unavailable
                      </p>
                    )}
                  </div>

                  <div style={{ fontSize:"0.8rem", color:"var(--gray-600)",
                    marginBottom:"0.75rem", display:"flex",
                    flexDirection:"column", gap:"0.25rem" }}>
                    <p>{ev.startDateTime
                      ? new Date(ev.startDateTime).toLocaleString()
                      : "Date TBD"}</p>
                    <div style={{ display:"flex", gap:"0.75rem" }}>
                      <span>Rs. {ev.standardPrice||0}</span>
                      <span>Rs. {ev.vipPrice||0}</span>
                      <span>Rs. {ev.premiumPrice||0}</span>
                    </div>
                  </div>

                  {cap > 0 && (
                    <div>
                      <div style={{ display:"flex",
                        justifyContent:"space-between",
                        fontSize:"0.72rem", color:"var(--gray-400)",
                        marginBottom:"0.2rem" }}>
                        <span>{sold} sold</span>
                        <span>{cap - sold} left</span>
                      </div>
                      <div style={{ height:4, background:"var(--gray-100)",
                        borderRadius:2 }}>
                        <div style={{ height:"100%", borderRadius:2,
                          background: pct>=100
                            ? "var(--danger)" : "var(--primary)",
                          width:`${pct}%`, transition:"width 0.3s" }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:"2rem" }}>

          <div className="card">
            <h3 className="section-title">Record Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label className="form-label">Event</label>
                <select className="form-select" required
                  value={expenseForm.eventId}
                  onChange={e => setExpenseForm({...expenseForm,
                    eventId: e.target.value})}>
                  <option value="">Select event</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name||ev.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (in Rs)</label>
                <input className="form-input" type="number"
                  placeholder="Enter amount" required
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({...expenseForm,
                    amount: e.target.value})} />
              </div>
              <button className="btn btn-primary" type="submit">
                Record Expense
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="section-title">Expense Summary</h3>
            {events.length === 0 && (
              <div className="empty-state"><p>No events yet</p></div>
            )}
            {events.map(ev => {
              const pct = ev.totalBudget > 0 ? Math.min(100,((ev.currentExpenses||0)/ev.totalBudget)*100): 0;
              const over = (ev.currentExpenses||0) > (ev.totalBudget||0);

              return (
                <div key={ev.id} style={{ marginBottom:"1rem" }}>
                  <div style={{ display:"flex",
                    justifyContent:"space-between",
                    fontSize:"0.82rem", marginBottom:"0.25rem" }}>
                    <span style={{ fontWeight:600 }}>{ev.name}</span>
                    <span style={{ color: over
                      ? "var(--danger)" : "var(--gray-600)" }}>
                      ₹{(ev.currentExpenses||0).toLocaleString()}
                      <span style={{ color:"var(--gray-400)",
                        fontWeight:400 }}>
                        {" "}/ Rs{(ev.totalBudget||0).toLocaleString()}
                      </span>
                    </span>
                  </div>
                  <div style={{ height:6, background:"var(--gray-100)",
                    borderRadius:3 }}>
                    <div style={{ height:"100%", borderRadius:3,
                      background: over
                        ? "var(--danger)" : "var(--primary)",
                      width:`${pct}%`, transition:"width 0.3s" }} />
                  </div>
                  {over && (
                    <p style={{ fontSize:"0.72rem", color:"var(--danger)",
                      marginTop:"0.2rem" }}>Over budget by Rs{
                        ((ev.currentExpenses||0)-(ev.totalBudget||0))
                          .toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;