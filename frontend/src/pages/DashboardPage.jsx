import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs } from "../components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { Dialog, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PlusCircle, Calendar, CheckCircle, Clock, Eye } from "lucide-react";

function WorkshopTable({ workshops, isInstructor, onAccept, onDateChange }) {
  if (!workshops.length) return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-lg">No workshops found</p>
      {!isInstructor && <Button className="mt-4" asChild><Link to="/workshops/propose"><PlusCircle className="h-4 w-4" /> Propose Workshop</Link></Button>}
    </div>
  );

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workshop</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>{isInstructor ? "Coordinator" : "Instructor"}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workshops.map(w => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.workshop_type_name}</TableCell>
                <TableCell>{w.date}</TableCell>
                <TableCell>{isInstructor ? w.coordinator_name : (w.instructor_name || "—")}</TableCell>
                <TableCell><Badge variant={w.status === "Accepted" ? "success" : w.status === "Deleted" ? "destructive" : "warning"}>{w.status}</Badge></TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" asChild><Link to={`/workshops/${w.id}`}><Eye className="h-3 w-3" /></Link></Button>
                  {isInstructor && w.status === "Pending" && <Button size="sm" onClick={() => onAccept(w.id)}><CheckCircle className="h-3 w-3" /> Accept</Button>}
                  {isInstructor && w.status === "Pending" && <Button variant="outline" size="sm" onClick={() => onDateChange(w)}><Calendar className="h-3 w-3" /></Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {workshops.map(w => (
          <Card key={w.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-medium">{w.workshop_type_name}</span>
                <Badge variant={w.status === "Accepted" ? "success" : w.status === "Deleted" ? "destructive" : "warning"}>{w.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {w.date}</div>
              <div className="text-sm text-muted-foreground">{isInstructor ? `Coordinator: ${w.coordinator_name}` : `Instructor: ${w.instructor_name || "Pending"}`}</div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild><Link to={`/workshops/${w.id}`}>View</Link></Button>
                {isInstructor && w.status === "Pending" && <Button size="sm" onClick={() => onAccept(w.id)}>Accept</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user, isInstructor, isCoordinator } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateDialog, setDateDialog] = useState(null);
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    api.get("/workshops/").then(d => { setWorkshops(d.workshops || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleAccept = async (id) => {
    try { await api.post(`/workshops/${id}/accept/`); setWorkshops(ws => ws.map(w => w.id === id ? {...w, status: "Accepted", instructor_name: user.name} : w)); } catch {}
  };

  const handleDateChange = async () => {
    if (!dateDialog || !newDate) return;
    try { await api.post(`/workshops/${dateDialog.id}/change-date/`, { date: newDate }); setWorkshops(ws => ws.map(w => w.id === dateDialog.id ? {...w, date: newDate} : w)); setDateDialog(null); } catch {}
  };

  const accepted = workshops.filter(w => w.status === "Accepted");
  const pending = workshops.filter(w => w.status !== "Accepted" && w.status !== "Deleted");

  if (loading) return <div className="container mx-auto p-8 space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;

  const tabs = [
    { value: "pending", label: `Pending (${pending.length})`, content: <WorkshopTable workshops={pending} isInstructor={isInstructor} onAccept={handleAccept} onDateChange={w => { setDateDialog(w); setNewDate(w.date); }} /> },
    { value: "accepted", label: `Accepted (${accepted.length})`, content: <WorkshopTable workshops={accepted} isInstructor={isInstructor} onAccept={handleAccept} onDateChange={w => { setDateDialog(w); setNewDate(w.date); }} /> },
  ];

  return (
    <>
      <Helmet><title>Dashboard — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.first_name || user?.username}</h1>
            <p className="text-muted-foreground mt-1">{isInstructor ? "Instructor Dashboard" : "Coordinator Dashboard"}</p>
          </div>
          {isCoordinator && <Button asChild><Link to="/workshops/propose"><PlusCircle className="h-4 w-4" /> Propose Workshop</Link></Button>}
        </div>
        <Tabs tabs={tabs} defaultTab="pending" />
      </div>

      <Dialog open={!!dateDialog} onClose={() => setDateDialog(null)}>
        <DialogTitle>Change Workshop Date</DialogTitle>
        <div className="mt-4 space-y-4">
          <div className="space-y-2"><Label>New Date</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
          <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setDateDialog(null)}>Cancel</Button><Button onClick={handleDateChange}>Save</Button></div>
        </div>
      </Dialog>
    </>
  );
}