import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "../components/ui/button";

export default function ViewProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/profile/${userId}/`).then(d => { setProfile(d.profile); setWorkshops(d.workshops || []); setLoading(false); }).catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="container mx-auto p-8"><Skeleton className="h-48 w-full max-w-2xl mx-auto" /></div>;
  if (!profile) return <div className="container mx-auto p-8 text-center text-muted-foreground">Profile not found.</div>;

  const Field = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-2">
      <span className="text-sm font-medium text-muted-foreground sm:w-40 shrink-0">{label}</span>
      <span className="text-sm">{value || "—"}</span>
    </div>
  );

  return (
    <>
      <Helmet><title>{profile.name} — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4"><Link to="/"><ArrowLeft className="h-3 w-3" /> Back</Link></Button>
        <Card className="animate-fade-in mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> {profile.name}</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            <Field label="Email" value={profile.email} />
            <Field label="Position" value={profile.position} />
            <Field label="Institute" value={profile.institute} />
            <Field label="Department" value={profile.department} />
            <Field label="Phone" value={profile.phone_number} />
            <Field label="Location" value={profile.location} />
          </CardContent>
        </Card>

        {workshops.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Workshop History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Instructor</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead></TableRow></TableHeader>
                <TableBody>
                  {workshops.map((w, i) => (
                    <TableRow key={i}>
                      <TableCell>{w.instructor_name || <Badge variant="warning">Pending</Badge>}</TableCell>
                      <TableCell>{w.date}</TableCell>
                      <TableCell>{w.workshop_type_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}