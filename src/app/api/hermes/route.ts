import Anthropic from "@anthropic-ai/sdk";
import { getUser } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import { HERMES_TOOLS, executeHermesTool } from "@/lib/hermes/tools";

const MODEL = "claude-opus-4-8";
const MAX_TOOL_ROUNDS = 6;

function systemPrompt() {
  return [
    "You are Hermes, the AI copilot inside DIAB — a deal-management app for social-media creators.",
    `Today is ${todayISO()}.`,
    "Answer questions about the creator's deals, deliverables, payments, and schedule.",
    "ALWAYS ground answers in the tools — never invent deal data, amounts, dates, or statuses. If a tool returns nothing, say so.",
    "You are read-only right now: you can look things up and advise, but you cannot send emails, change deals, or take actions. If asked to do a write action, explain that it's coming soon and that the creator will confirm every change.",
    "Be concise and practical. Lead with the answer. Use the creator's own currency formatting as returned by the tools.",
  ].join(" ");
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ text: "Hermes isn't configured yet (missing ANTHROPIC_API_KEY)." });
  }

  const body = (await req.json()) as { messages?: Anthropic.MessageParam[] };
  const convo: Anthropic.MessageParam[] = Array.isArray(body.messages) ? body.messages : [];
  if (convo.length === 0) return Response.json({ text: "Ask me anything about your deals." });

  const client = new Anthropic();

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt(),
      tools: HERMES_TOOLS,
      messages: convo,
    });

    if (res.stop_reason === "tool_use") {
      convo.push({ role: "assistant", content: res.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of res.content) {
        if (block.type === "tool_use") {
          const out = await executeHermesTool(block.name, block.input as Record<string, unknown>);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(out),
          });
        }
      }
      convo.push({ role: "user", content: toolResults });
      continue;
    }

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return Response.json({ text: text || "…" });
  }

  return Response.json({ text: "That took more steps than expected — try narrowing the question." });
}
