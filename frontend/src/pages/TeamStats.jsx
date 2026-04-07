import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TeamStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/statistics/team/").then(d => { setData(d.members || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>Team Statistics — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Team Statistics</h1>
        {loading ? <Skeleton className="h-80 w-full" /> : (
          <Card className="animate-fade-in">
            <CardHeader><CardTitle className="text-lg">Workshop Count by Team Member</CardTitle></CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="count" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}