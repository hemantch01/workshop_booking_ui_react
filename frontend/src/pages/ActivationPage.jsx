import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function ActivationPage() {
  const { key } = useParams();
  const [status, setStatus] = useState("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!key) { setStatus("waiting"); setMsg("Check your email for an activation link."); return; }
    api.get(`/auth/activate/${key}/`).then(d => { setStatus("success"); setMsg(d.message); }).catch(e => { setStatus("error"); setMsg(e.error || "Activation failed"); });
  }, [key]);

  return (
    <>
      <Helmet><title>Account Activation — FOSSEE Workshops</title></Helmet>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center animate-fade-in">
          <CardHeader><CardTitle>{status === "loading" ? "Activating..." : status === "success" ? "Activated!" : status === "waiting" ? "Awaiting Activation" : "Activation Failed"}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{msg}</p>
            {status !== "loading" && <Button className="mt-4" asChild><Link to="/login">Go to Login</Link></Button>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}