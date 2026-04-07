import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
import { Skeleton } from "../components/ui/skeleton";
import { BookOpen, Clock, Plus, ArrowRight } from "lucide-react";

export default function WorkshopTypeList() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isInstructor } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.get(`/workshop-types/?page=${page}`).then(d => { setTypes(d.types || []); setTotalPages(d.total_pages || 1); setLoading(false); }).catch(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="container mx-auto p-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32" />)}</div>;

  return (
    <>
      <Helmet><title>Workshop Types — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Workshop Types</h1>
            <p className="text-muted-foreground mt-1">Browse available workshop formats</p>
          </div>
          {isInstructor && <Button asChild><Link to="/workshops/types/add"><Plus className="h-4 w-4" /> Add Type</Link></Button>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map(t => (
            <Link key={t.id} to={`/workshops/types/${t.id}`} className="group">
              <Card className="h-full transition-colors hover:border-foreground/30">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> {t.duration} day{t.duration > 1 ? "s" : ""}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t.name}</h3>
                  <div className="mt-auto flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    View details <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}