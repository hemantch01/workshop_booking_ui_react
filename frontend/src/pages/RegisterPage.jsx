import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { UserPlus } from "lucide-react";

const titles = ["Mr", "Mrs", "Ms", "Dr", "Prof"];
const positions = [
  ["coordinator", "Coordinator"],
  ["instructor", "Instructor"],
];
const states = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Other"
];
const sources = ["FOSSEE website","Google","Social Media","College","Others"];

export default function RegisterPage() {
  const [form, setForm] = useState({
    username:"", email:"", password:"", confirm_password:"", title:"Mr", first_name:"", last_name:"",
    phone_number:"", institute:"", department:"", position:"coordinator", location:"", state:"",
    how_did_you_hear_about_us:"FOSSEE website"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
    } catch (err) {
      setErrors(err.errors || { general: err.error || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center animate-fade-in">
        <CardHeader><CardTitle>Registration Successful!</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Check your email for an activation link.</p>
          <Button className="mt-4" onClick={() => navigate("/login")}>Go to Login</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Helmet><title>Register — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Register for FOSSEE Workshop Portal</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {errors.general && <div className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{errors.general}</div>}

              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Account Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="username">Username *</Label><Input id="username" value={form.username} onChange={set("username")} required />{errors.username && <p className="text-xs text-destructive">{errors.username}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={form.email} onChange={set("email")} required />{errors.email && <p className="text-xs text-destructive">{errors.email}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={form.password} onChange={set("password")} required />{errors.password && <p className="text-xs text-destructive">{errors.password}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="confirm_password">Confirm Password *</Label><Input id="confirm_password" type="password" value={form.confirm_password} onChange={set("confirm_password")} required /></div>
                </div>
              </div>

              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Personal Information</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="title">Title</Label><Select id="title" value={form.title} onChange={set("title")}>{titles.map(t=><option key={t} value={t}>{t}</option>)}</Select></div>
                  <div className="space-y-2"><Label htmlFor="position">Role *</Label><Select id="position" value={form.position} onChange={set("position")}>{positions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select></div>
                  <div className="space-y-2"><Label htmlFor="first_name">First Name *</Label><Input id="first_name" value={form.first_name} onChange={set("first_name")} required /></div>
                  <div className="space-y-2"><Label htmlFor="last_name">Last Name *</Label><Input id="last_name" value={form.last_name} onChange={set("last_name")} required /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="phone_number">Phone Number *</Label><Input id="phone_number" value={form.phone_number} onChange={set("phone_number")} required /></div>
                </div>
              </div>

              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Institution</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="institute">Institute *</Label><Input id="institute" value={form.institute} onChange={set("institute")} required /></div>
                  <div className="space-y-2"><Label htmlFor="department">Department *</Label><Input id="department" value={form.department} onChange={set("department")} required /></div>
                  <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={form.location} onChange={set("location")} /></div>
                  <div className="space-y-2"><Label htmlFor="state">State *</Label><Select id="state" value={form.state} onChange={set("state")} required><option value="">Select state</option>{states.map(s=><option key={s} value={s}>{s}</option>)}</Select></div>
                </div>
              </div>

              <Separator />
              <div className="space-y-2">
                <Label htmlFor="how">How did you hear about us?</Label>
                <Select id="how" value={form.how_did_you_hear_about_us} onChange={set("how_did_you_hear_about_us")}>{sources.map(s=><option key={s} value={s}>{s}</option>)}</Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="h-4 w-4" /> {loading ? "Creating..." : "Create Account"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account? <Link to="/login" className="text-foreground underline underline-offset-4">Sign In</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}