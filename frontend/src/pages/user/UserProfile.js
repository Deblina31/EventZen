import { useEffect, useState } from "react";
import { getProfile, uploadProfilePicture } from "../../services/authService";
import { toast } from "react-toastify";
import { Camera} from "lucide-react";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getProfile()
      .then(r => setProfile(r.data))
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024)    { toast.error("Image must be under 2MB"); return; }

    setUploading(true);
    try {
      const res = await uploadProfilePicture(file);
      setProfile(p => ({ ...p, profilePicture: res.data.profilePicture }));
      toast.success("Profile picture updated!");
    } catch { toast.error("Upload failed"); }
    finally  { setUploading(false); }
  };

  if (!profile) return <div className="page-wrapper"><p className="text-muted">Loading...</p></div>;

  return (
    <div className="page-wrapper" style={{ maxWidth: 500 }}>
      <h1 className="page-title">My Profile</h1>

      <div className="card">
        <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
          <div style={{ position:"relative", display:"inline-block" }}>
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile"
                style={{ width:100, height:100, borderRadius:"50%", objectFit:"cover", border:"3px solid var(--primary)" }} />
            ) : (
              <div style={{ width:100, height:100, borderRadius:"50%", background:"var(--primary-light)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"2rem", border:"3px solid var(--primary)" }}>
                {profile.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <label style={{ position:"absolute", bottom:0, right:0, background:"var(--primary)", color:"#fff",
              borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center",
              justifyContent:"center", cursor:"pointer", fontSize:"0.8rem" }}>
              {uploading ? "..." : <Camera size={18} />}
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleFileChange} />
            </label>
          </div>
          <p style={{ marginTop:"0.5rem", fontWeight:600 }}>{profile.username}</p>
          <p className="text-muted" style={{ fontSize:"0.8rem" }}>{profile.role}</p>
        </div>

        <div style={{ display:"grid", gap:"0.75rem", fontSize:"0.875rem" }}>
          {[
            { label:"Email",        value: profile.email },
            { label:"First Name",   value: profile.firstName  || "—" },
            { label:"Last Name",    value: profile.lastName   || "—" },
            { label:"Phone",        value: profile.phoneNumber || "—" },
          ].map(f => (
            <div key={f.label} style={{ display:"flex", justifyContent:"space-between",
              padding:"0.5rem 0", borderBottom:"1px solid var(--gray-100)" }}>
              <span className="text-muted">{f.label}</span>
              <span>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;