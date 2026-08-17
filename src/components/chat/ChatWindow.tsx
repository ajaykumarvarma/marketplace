import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Check, CheckCheck, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ChatWindowProps {
  orderId: string;
  receiverId: string;
  otherParty: Profile | null;
}

export function ChatWindow({ orderId, receiverId, otherParty }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
  }, [orderId]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    setSending(true);
    await supabase.from("messages").insert({
      order_id: orderId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: input.trim(),
      read: false,
    });
    setInput("");
    setSending(false);
  };

  const handleFileAttachment = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB for chat attachments.");
      return;
    }
    setUploadingFile(true);
    const path = `chat/${orderId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("chat-attachments")
      .upload(path, file, { upsert: false });
    setUploadingFile(false);
    if (error) {
      alert("Upload failed: " + error.message);
      return;
    }
    await supabase.from("messages").insert({
      order_id: orderId,
      sender_id: user!.id,
      receiver_id: receiverId,
      content: `📎 FILE:${data.path}|${file.name}`,
      read: false,
    });
  };

  const markRead = async () => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("order_id", orderId)
      .neq("sender_id", user?.id || "")
      .eq("read", false);
  };

  useEffect(() => {
    markRead();
  }, [messages.length]);

  if (!user) return null;

  return (
    <div className="flex flex-col h-[400px] sm:h-[500px] max-h-[70vh] bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {otherParty?.full_name?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{otherParty?.full_name || "Trading Partner"}</p>
          <p className="text-xs text-muted-foreground">Order chat</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3" ref={bottomRef}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === user.id;
            const fileMatch = msg.content.match(/^📎 FILE:([^|]+)\|(.+)$/);
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${isMe ? "bg-primary/15 text-foreground" : "bg-muted text-foreground"}`}>
                  {fileMatch ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chat-attachments/${fileMatch[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{fileMatch[2]}</span>
                    </a>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMe && (
                      msg.read ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileAttachment(e.target.files[0])}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Attach file"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFile}
        >
          {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Paperclip className="h-4 w-4 text-muted-foreground" />}
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button size="icon" onClick={sendMessage} disabled={sending || !input.trim()} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}