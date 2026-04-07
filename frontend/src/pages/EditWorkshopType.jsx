import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../components/ui/toast";
import { Save } from "lucide-react";

export default function EditWorkshopType() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { api.get(`/workshop-types/${id}/`).then(d => setForm({ name: d.name, duration: String(d.duration), description: d.description || "", terms: d.terms || "" })).catch(() => {}); }, [id]);

  if (!form) return <div className="container mx-auto p-8"><Skeleton className="h-64 w-full max-w-lg mx-auto" /></div>;

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({}); setLoading(true);
    try {
      await api.put(`/workshop-types/${id}/`, form);
      toast("Workshop type updated!", "success");
      navigate(`/workshops/types/${id}`);
    } catch (err) {
      setErrors(err.errors || { general: err.error || "Failed" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Edit Workshop Type — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-lg px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader><CardTitle>Edit Workshop Type</CardTitle></CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors.general && <div className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{errors.general}</div>}
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={set("name")} required /></div>
              <div className="space-y-2"><Label>Duration (days) *</Label><Input type="number" min="1" value={form.duration} onChange={set("duration")} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={set("description")} rows={4} /></div>
              <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea value={form.terms} onChange={set("terms")} rows={4} /></div>
            </CardContent>
            <CardFooter><Button type="submit" className="w-full" disabled={loading}><Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Changes"}</Button></CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}