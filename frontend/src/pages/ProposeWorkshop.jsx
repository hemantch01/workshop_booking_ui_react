import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Dialog, DialogTitle } from "../components/ui/dialog";
import { useToast } from "../components/ui/toast";
import { Send } from "lucide-react";

export default function ProposeWorkshop() {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ workshop_type: "", date: "", tnc_accepted: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tncContent, setTncContent] = useState("");
  const [tncOpen, setTncOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { api.get("/workshop-types/").then(d => setTypes(d.types || [])).catch(() => {}); }, []);

  const viewTnc = async () => {
    if (!form.workshop_type) return;
    try { const d = await api.get(`/workshop-types/${form.workshop_type}/tnc/`); setTncContent(d.content || "No terms available."); setTncOpen(true); } catch { setTncContent("Could not load terms."); setTncOpen(true); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tnc_accepted) { setErrors({ tnc: "You must accept terms & conditions" }); return; }
    setErrors({}); setLoading(true);
    try {
      await api.post("/workshops/propose/", form);
      toast("Workshop proposed successfully!", "success");
      navigate("/");
    } catch (err) {
      setErrors(err.errors || { general: err.error || "Failed to propose" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Propose Workshop — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-lg px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Propose a Workshop</CardTitle>
            <CardDescription>Select a workshop type, date, and accept terms</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors.general && <div className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{errors.general}</div>}
              <div className="space-y-2">
                <Label htmlFor="wtype">Workshop Type *</Label>
                <Select id="wtype" value={form.workshop_type} onChange={e => setForm({...form, workshop_type: e.target.value})} required>
                  <option value="">Select type...</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.duration} days)</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date *</Label>
                <Input id="date" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="tnc" checked={form.tnc_accepted} onChange={e => setForm({...form, tnc_accepted: e.target.checked})} />
                <Label htmlFor="tnc" className="text-sm">I accept the <button type="button" onClick={viewTnc} className="underline underline-offset-4 cursor-pointer">terms & conditions</button></Label>
              </div>
              {errors.tnc && <p className="text-xs text-destructive">{errors.tnc}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                <Send className="h-4 w-4" /> {loading ? "Proposing..." : "Propose Workshop"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Dialog open={tncOpen} onClose={() => setTncOpen(false)} className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogTitle>Terms & Conditions</DialogTitle>
        <div className="mt-4 text-sm whitespace-pre-wrap">{tncContent}</div>
      </Dialog>
    </>
  );
}