import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useToast } from "../components/ui/toast";
import { Save, Edit, X } from "lucide-react";

const states = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Other"];
const titles = ["Mr","Mrs","Ms","Dr","Prof"];

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) setForm({
      title: user.profile?.title || "Mr", first_name: user.first_name || "", last_name: user.last_name || "",
      phone_number: user.profile?.phone_number || "", institute: user.profile?.institute || "",
      department: user.profile?.department || "", location: user.profile?.location || "",
      state: user.profile?.state || "", position: user.profile?.position || "coordinator"
    });
  }, [user]);

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.put("/profile/", form); await fetchUser(); toast("Profile updated!", "success"); setEditing(false); }
    catch { toast("Failed to update profile", "error"); }
    finally { setLoading(false); }
  };

  if (!form) return null;

  const Field = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-2">
      <span className="text-sm font-medium text-muted-foreground sm:w-40 shrink-0">{label}</span>
      <span className="text-sm">{value || "—"}</span>
    </div>
  );

  return (
    <>
      <Helmet><title>My Profile — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Profile</CardTitle>
              {!editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="h-3 w-3" /> Edit</Button>}
              {editing && <Button variant="ghost" size="sm" onClick={() => setEditing(false)}><X className="h-3 w-3" /> Cancel</Button>}
            </div>
          </CardHeader>

          {!editing ? (
            <CardContent className="divide-y divide-border">
              <Field label="Name" value={`${form.title} ${form.first_name} ${form.last_name}`} />
              <Field label="Email" value={user?.email} />
              <Field label="Phone" value={form.phone_number} />
              <Field label="Role" value={form.position} />
              <Field label="Institute" value={form.institute} />
              <Field label="Department" value={form.department} />
              <Field label="Location" value={form.location} />
              <Field label="State" value={form.state} />
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2"><Label>Title</Label><Select value={form.title} onChange={set("title")}>{titles.map(t=><option key={t}>{t}</option>)}</Select></div>
                  <div className="space-y-2"><Label>First Name</Label><Input value={form.first_name} onChange={set("first_name")} required /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input value={form.last_name} onChange={set("last_name")} required /></div>
                </div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone_number} onChange={set("phone_number")} /></div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Institute</Label><Input value={form.institute} onChange={set("institute")} /></div>
                  <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={set("department")} /></div>
                  <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={set("location")} /></div>
                  <div className="space-y-2"><Label>State</Label><Select value={form.state} onChange={set("state")}><option value="">Select</option>{states.map(s=><option key={s}>{s}</option>)}</Select></div>
                </div>
              </CardContent>
              <CardFooter><Button type="submit" className="w-full" disabled={loading}><Save className="h-4 w-4" /> {loading ? "Saving..." : "Save"}</Button></CardFooter>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}