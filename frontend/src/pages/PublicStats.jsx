import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Pagination } from "../components/ui/pagination";
import { Dialog, DialogTitle } from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Filter, Download, BarChart3, X } from "lucide-react";

const states = ["","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Other"];

export default function PublicStats() {
  const { user } = useAuth();
  const [data, setData] = useState({ workshops: [], total_pages: 1, state_chart: [], type_chart: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ from_date: "", to_date: "", state: "", workshop_type: "", sort: "-date", show_mine: false });
  const [types, setTypes] = useState([]);
  const [chartDialog, setChartDialog] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { api.get("/workshop-types/").then(d => setTypes(d.types || [])).catch(() => {}); }, []);

  const fetchData = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/statistics/public/?${params}`).then(d => { setData(d); setPage(p); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const setF = (k) => (e) => setFilters({...filters, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value});

  return (
    <>
      <Helmet><title>Statistics — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Workshop Statistics</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setChartDialog("state")}><BarChart3 className="h-3 w-3" /> States</Button>
            <Button variant="outline" size="sm" onClick={() => setChartDialog("type")}><BarChart3 className="h-3 w-3" /> Types</Button>
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setFiltersOpen(!filtersOpen)}><Filter className="h-3 w-3" /></Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className={`${filtersOpen ? "block" : "hidden"} md:block md:w-64 shrink-0`}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setFilters({ from_date: "", to_date: "", state: "", workshop_type: "", sort: "-date", show_mine: false }); }}><X className="h-3 w-3" /> Clear</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1"><Label className="text-xs">From</Label><Input type="date" value={filters.from_date} onChange={setF("from_date")} /></div>
                <div className="space-y-1"><Label className="text-xs">To</Label><Input type="date" value={filters.to_date} onChange={setF("to_date")} /></div>
                <div className="space-y-1"><Label className="text-xs">Workshop</Label><Select value={filters.workshop_type} onChange={setF("workshop_type")}><option value="">All</option>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></div>
                <div className="space-y-1"><Label className="text-xs">State</Label><Select value={filters.state} onChange={setF("state")}>{states.map(s => <option key={s} value={s}>{s || "All"}</option>)}</Select></div>
                <div className="space-y-1"><Label className="text-xs">Sort</Label><Select value={filters.sort} onChange={setF("sort")}><option value="-date">Latest</option><option value="date">Oldest</option></Select></div>
                {user && <div className="flex items-center gap-2"><Checkbox checked={filters.show_mine} onChange={setF("show_mine")} /><Label className="text-xs">My workshops only</Label></div>}
                <Button className="w-full" size="sm" onClick={() => fetchData(1)}>Apply</Button>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="flex-1 min-w-0">
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead><TableHead>Coordinator</TableHead><TableHead>Institute</TableHead>
                        <TableHead>Instructor</TableHead><TableHead>Workshop</TableHead><TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.workshops.map((w, i) => (
                        <TableRow key={i}>
                          <TableCell>{(page - 1) * 20 + i + 1}</TableCell>
                          <TableCell>{w.coordinator_name}</TableCell><TableCell>{w.institute}</TableCell>
                          <TableCell>{w.instructor_name}</TableCell><TableCell>{w.workshop_type_name}</TableCell>
                          <TableCell>{w.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3">
                  {data.workshops.map((w, i) => (
                    <Card key={i}><CardContent className="p-4 text-sm space-y-1">
                      <div className="font-medium">{w.workshop_type_name}</div>
                      <div className="text-muted-foreground">{w.date}</div>
                      <div>{w.coordinator_name} — {w.institute}</div>
                      <div className="text-muted-foreground">Instructor: {w.instructor_name}</div>
                    </CardContent></Card>
                  ))}
                </div>
                {data.workshops.length === 0 && <p className="text-center text-muted-foreground py-12">No workshops match your filters.</p>}
                <Pagination page={page} totalPages={data.total_pages} onPageChange={p => fetchData(p)} />
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!chartDialog} onClose={() => setChartDialog(null)} className="max-w-2xl">
        <DialogTitle>{chartDialog === "state" ? "State-wise Workshops" : "Type-wise Workshops"}</DialogTitle>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDialog === "state" ? data.state_chart : data.type_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
              <Bar dataKey="count" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Dialog>
    </>
  );
}