import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import { Lock } from "lucide-react";

export default function ChangePassword() {
  const [form, setForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({}); setLoading(true);
    try { await api.post("/auth/change-password/", form); toast("Password changed!", "success"); setForm({ old_password: "", new_password: "", confirm_password: "" }); }
    catch (err) { setErrors(err.errors || { general: err.error || "Failed" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Change Password — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors.general && <div className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{errors.general}</div>}
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={form.old_password} onChange={set("old_password")} required /></div>
              <div className="space-y-2"><Label>New Password</Label><Input type="password" value={form.new_password} onChange={set("new_password")} required /></div>
              <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={form.confirm_password} onChange={set("confirm_password")} required /></div>
            </CardContent>
            <CardFooter><Button type="submit" className="w-full" disabled={loading}><Lock className="h-4 w-4" /> {loading ? "Changing..." : "Change Password"}</Button></CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}