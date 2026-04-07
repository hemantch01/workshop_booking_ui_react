import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { Clock, Edit, ArrowLeft } from "lucide-react";

export default function WorkshopTypeDetails() {
  const { id } = useParams();
  const [wt, setWt] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isInstructor } = useAuth();

  useEffect(() => {
    api.get(`/workshop-types/${id}/`).then(d => { setWt(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container mx-auto p-8 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /></div>;
  if (!wt) return <div className="container mx-auto p-8 text-center text-muted-foreground">Workshop type not found.</div>;

  return (
    <>
      <Helmet><title>{wt.name} — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4"><Link to="/workshops/types"><ArrowLeft className="h-3 w-3" /> Back to list</Link></Button>
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl">{wt.name}</CardTitle>
              {isInstructor && <Button variant="outline" size="sm" asChild><Link to={`/workshops/types/${id}/edit`}><Edit className="h-3 w-3" /> Edit</Link></Button>}
            </div>
            <Badge variant="secondary" className="w-fit"><Clock className="h-3 w-3 mr-1" /> {wt.duration} day{wt.duration > 1 ? "s" : ""}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {wt.description && <><h4 className="text-sm font-semibold text-muted-foreground uppercase">Description</h4><p className="text-sm">{wt.description}</p><Separator /></>}
            {wt.terms && <><h4 className="text-sm font-semibold text-muted-foreground uppercase">Terms & Conditions</h4><p className="text-sm whitespace-pre-wrap">{wt.terms}</p><Separator /></>}
            {wt.attachments && wt.attachments.length > 0 && (
              <><h4 className="text-sm font-semibold text-muted-foreground uppercase">Attachments</h4>
              <ul className="space-y-1">{wt.attachments.map((a, i) => <li key={i}><a href={a.url} className="text-sm underline underline-offset-4">{a.name}</a></li>)}</ul></>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}