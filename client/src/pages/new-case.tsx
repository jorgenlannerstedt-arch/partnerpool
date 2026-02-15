import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function NewCasePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (file) formData.append("pdf", file);

      const res = await fetch("/api/cases", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: "Case created", description: "Your case has been submitted and is being analyzed." });
      navigate(`/cases/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      toast({ title: "Invalid file", description: "Please upload a PDF file.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-new-case-title">New Case</h1>
          <p className="text-muted-foreground text-sm">Upload a document and our AI will create an anonymized case summary.</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Case Title</Label>
          <Input
            id="title"
            placeholder="e.g., Employment Dispute, Property Claim"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-case-title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Additional Details (optional)</Label>
          <Textarea
            id="description"
            placeholder="Any additional context about your case..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            data-testid="input-case-description"
          />
        </div>

        <div className="space-y-2">
          <Label>Upload Document (PDF)</Label>
          <div
            className={`border-2 border-dashed rounded-md p-8 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/5"
                : file
                ? "border-primary/50 bg-primary/5"
                : "border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            data-testid="dropzone-pdf"
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium" data-testid="text-file-name">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop a PDF here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Personal information will be automatically redacted
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-md bg-primary/5">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Our AI will analyze your document, redact personal information, and generate an anonymized case description for law firms to review.
          </p>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!title || uploadMutation.isPending}
          onClick={() => uploadMutation.mutate()}
          data-testid="button-submit-case"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Document...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Submit Case
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
