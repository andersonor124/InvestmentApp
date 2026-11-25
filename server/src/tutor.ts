import Anthropic from "@anthropic-ai/sdk";
import type { Request, Response } from "express";

export const tutorEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

const SYSTEM_PROMPT = `You are "Penny", a friendly investing tutor inside StockSmart, a learning app for high school students (ages 14-18), many of them in Canada.

Your job is to explain investing ideas — stocks, ratios like P/E, ETFs, diversification, compounding, risk, TFSAs/RRSPs and similar — in plain language a teenager understands. Use short paragraphs, everyday analogies (lemonade stands, part-time jobs, video games, sports), and small worked examples with simple numbers. Aim for 80-200 words unless the student asks for more depth. End with a quick check-for-understanding question when it fits naturally.

Boundaries:
- Teach how to think, not what to buy. If asked "should I buy X?" or for hot picks, explain what a student could look at to decide for themselves (earnings, P/E, debt, diversification, time horizon) and remind them that real investing decisions involve a parent/guardian and that minors in Canada usually invest through an adult's account.
- Be honest about risk: stocks can lose value; past performance doesn't guarantee future results. Steer away from day trading, options, leverage, crypto hype and "get rich quick" schemes, explaining why.
- If a question is unrelated to money, investing or the economy, kindly redirect to those topics.
- Never ask for personal information.`;

let client: Anthropic | null = null;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function tutorHandler(req: Request, res: Response) {
  if (!tutorEnabled()) {
    res.status(503).json({ error: "The AI tutor needs ANTHROPIC_API_KEY on the server." });
    return;
  }
  const raw = (req.body?.messages ?? []) as ChatTurn[];
  const messages = raw
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    res.status(400).json({ error: "Send at least one user message." });
    return;
  }

  client ??= new Anthropic();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  try {
    const stream = client.beta.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" }, // short conversational answers
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages,
    });
    req.on("close", () => stream.abort());
    stream.on("text", (delta) => res.write(delta));
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      res.write("\n\nI can't help with that one — try asking about a different investing topic!");
    }
    res.end();
  } catch (err) {
    if (err instanceof Anthropic.APIUserAbortError) return;
    console.error("[tutor]", err);
    if (!res.headersSent) res.status(502);
    res.end("\n\nSorry, the tutor is having trouble right now. Please try again in a moment.");
  }
}
