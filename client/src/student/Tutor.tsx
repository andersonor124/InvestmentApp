import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Card, PageHeader } from "../components/ui";
import { useStore } from "../store";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What's a P/E ratio, explained with pizza?",
  "Why do stock prices go down when nothing bad happened?",
  "Is it better to buy one Apple share or an index ETF?",
  "How does a TFSA work and when can I open one?",
  "What's the difference between saving and investing?",
];

export default function Tutor() {
  const { status, updateProgress } = useStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    updateProgress((p) => ({ ...p, tutorQuestions: p.tutorQuestions + 1 }));
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "The tutor is unavailable right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + chunk };
          return copy;
        });
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${(e as Error).message}` };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  if (status && !status.tutor) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader emoji="💬" title="Ask Penny" subtitle="An AI tutor that explains investing in plain language." />
        <Card>
          <p className="font-semibold">The AI tutor isn't switched on yet.</p>
          <p className="mt-2 text-sm text-muted">
            Whoever runs this app needs to add an <code>ANTHROPIC_API_KEY</code> to the server's <code>.env</code> file and restart it. Meanwhile, the glossary and lessons cover all the
            core ideas!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader emoji="💬" title="Ask Penny" subtitle="Penny is an AI tutor. Ask anything about investing and she'll explain it in plain English. She teaches; she won't tell you what to buy." />
      <Card className="flex h-[min(70vh,40rem)] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div>
              <p className="text-sm text-muted">Try one of these:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => void send(s)} className="rounded-full border border-line px-3 py-1.5 text-left text-sm hover:border-accent hover:text-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-accent text-accent-ink" : "bg-surface-2"}`}>
                {m.role === "assistant" && <span className="mb-1 block text-xs font-semibold text-accent">🦉 Penny</span>}
                {m.content || (busy && i === messages.length - 1 ? <span className="animate-pulse text-muted">thinking…</span> : null)}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t border-line p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about investing…"
            maxLength={1000}
            className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5"
            aria-label="Your question"
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            Send
          </Button>
        </form>
      </Card>
      <p className="mt-2 text-xs text-muted">AI can make mistakes. Double-check important facts with a teacher, parent or official source. Don't share personal information.</p>
    </div>
  );
}
