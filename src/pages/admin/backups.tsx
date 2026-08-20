import { useState, useEffect, useCallback } from "react";
import { Shield, Download, Database, Clock, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

interface BackupFile {
  name: string;
  createdAt: string;
  size: number;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const { session } = useAuth();

  const fetchBackups = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/backups/list", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (err) {
      console.error("Failed to fetch backups:", err);
    }
    setLoading(false);
  }, [session?.access_token]);

  async function runBackup() {
    setRunning(true);
    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchBackups();
      }
    } catch (err) {
      console.error("Backup failed:", err);
    }
    setRunning(false);
  }

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <>
      <SEO
        title="Database Backups"
        description="Manage Supabase database backups for TradeVault."
        noIndex
      />
      <div className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Database Backups
            </h1>
            <p className="text-muted-foreground">
              Automated and on-demand backups of all platform data
            </p>
          </div>
          <Button
            onClick={runBackup}
            disabled={running}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {running ? "Running..." : "Run Backup"}
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold text-foreground">
                Backup History
              </h2>
            </div>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              {backups.length} backup{backups.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading backups...
            </div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No backups yet</p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Click Run Backup to create your first backup
              </p>
            </div>
          ) : (
            <div>
              {backups.map((b) => (
                <div
                  key={b.name}
                  className="flex items-center justify-between px-6 py-4 border-b border-border last:border-0 hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-mono text-foreground">
                        {b.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(b.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatSize(b.size)}
                    </span>
                    <Button size="sm" variant="outline" className="gap-1 border-border">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}