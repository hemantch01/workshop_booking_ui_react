import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../components/ui/toast";
import { ArrowLeft, Send, User, Calendar, BookOpen, EyeOff } from "lucide-react";

export default function WorkshopDetails() {
  const { id } = useParams();
  const { user, isInstructor } = useAuth();
  const [ws, setWs] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([api.get(`/workshops/${id}/`), api.get(`/workshops/${id}/comments/`)])
      .then(([w, c]) => { setWs(w); setComments(c.comments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const c = await api.post(`/workshops/${id}/comments/`, { comment, public: isPublic });
      setComments([c, ...comments]);
      setComment("");
      toast("Comment posted", "success");
    } catch {}
  };

  if (loading) return <div className="container mx-auto p-8 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /></div>;
  if (!ws) return <div className="container mx-auto p-8 text-center text-muted-foreground">Workshop not found.</div>;

  return (
    <>
      <Helmet><title>Workshop Details — FOSSEE Workshops</title></Helmet>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4"><Link to="/"><ArrowLeft className="h-3 w-3" /> Back</Link></Button>

        <Card className="animate-fade-in mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>{ws.workshop_type_name}</CardTitle>
              <Badge variant={ws.status === "Accepted" ? "success" : ws.status === "Deleted" ? "destructive" : "warning"}>{ws.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Date: {ws.date}</span></div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>Coordinator: {ws.coordinator_name}</span></div>
              {ws.instructor_name && <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>Instructor: {ws.instructor_name}</span></div>}
              <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" /><Link to={`/workshops/types/${ws.workshop_type_id}`} className="underline underline-offset-4">View workshop type</Link></div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Post a Comment</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={postComment} className="space-y-3">
              <Textarea placeholder="Write your comment..." value={comment} onChange={e => setComment(e.target.value)} rows={3} />
              {isInstructor && <div className="flex items-center gap-2"><Checkbox id="pub" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} /><Label htmlFor="pub" className="text-sm">Public</Label><span className="text-xs text-muted-foreground">(Non-public visible to instructors only)</span></div>}
              <Button type="submit" size="sm"><Send className="h-3 w-3" /> Post</Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
        <div className="space-y-3">
          {comments.map(c => (
            <Card key={c.id} className="animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link to={`/profile/${c.author_id}`} className="text-sm font-semibold underline underline-offset-4">{c.author_name}</Link>
                  {!c.public && <Badge variant="secondary" className="text-xs"><EyeOff className="h-2.5 w-2.5 mr-1" />Hidden</Badge>}
                  <span className="text-xs text-muted-foreground ml-auto">{c.created_date}</span>
                </div>
                <p className="text-sm">{c.comment}</p>
              </CardContent>
            </Card>
          ))}
          {comments.length === 0 && <p className="text-center text-muted-foreground py-8">No comments yet.</p>}
        </div>
      </div>
    </>
  );
}