import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import { Plus } from "lucide-react";

export default function AddWorkshopType() {
  const [form, setForm] = useState({ name: "", duration: "1", description: "", terms: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({}); setLoading(true);
    try {
      const d = await api.post("/workshop-types/", form);
      toast("Workshop type added!", "success");
      navigate(`/workshops/types/${d.id}`);
    } catch (err) {
      setErrors(err.errors || { general: err.error || "Failed" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Add Workshop Type — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-lg px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader><CardTitle>Add Workshop Type</CardTitle></CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors.general && <div className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{errors.general}</div>}
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={set("name")} required />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
              <div className="space-y-2"><Label>Duration (days) *</Label><Input type="number" min="1" value={form.duration} onChange={set("duration")} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={set("description")} rows={4} /></div>
              <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea value={form.terms} onChange={set("terms")} rows={4} /></div>
            </CardContent>
            <CardFooter><Button type="submit" className="w-full" disabled={loading}><Plus className="h-4 w-4" /> {loading ? "Adding..." : "Add Type"}</Button></CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}