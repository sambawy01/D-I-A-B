import { getUser } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import { HERMES_TOOLS, executeHermesTool, type ToolDef } from "@/lib/hermes/tools";

// Hermes runs on the shared Ollama endpoint (from the Hermes Gateway).
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const HERMES_MODEL = process.env.HERMES_MODEL || "qwen2.5"; // must be a tool-capable model
const MAX_TOOL_ROUNDS = 6;

type ChatMsg =
  | { role: "system" | "user" | "assistant"; content: string; tool_calls?: OllamaToolCall[] }
  | { role: "tool"; content: string; tool_name?: string };

type OllamaToolCall = { function: { name: string; arguments: Record<string, unknown> | string } };

function ollamaTools(defs: ToolDef[]) {
  return defs.map((d) => ({
    type: "function" as const,
    function: { name: d.name, description: d.description, parameters: d.parameters },
  }));
}

function systemPrompt() {
  return [
    "You are Hermes, the AI copilot inside DIAB — a deal-management app for social-media creators.",
    `Today is ${todayISO()}.`,
    "Answer questions about the creator's deals, deliverables, payments, and schedule.",
    "ALWAYS use the tools to look up data — never invent deal data, amounts, dates, or statuses. If a tool returns nothing, say so.",
    "You are read-only right now: you can look things up and advise, but you cannot send emails or change deals. If asked to take an action, say it's coming soon and that the creator will confirm every change.",
    "Be concise and practical. Lead with the answer.",
  ].join(" ");
}

async function ollamaChat(messages: ChatMsg[]) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(OLLAMA_API_KEY ? { authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: HERMES_MODEL,
      messages,
      tools: ollamaTools(HERMES_TOOLS),
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text().catch(() => "")}`);
  return (await res.json()) as {
    message: { role: "assistant"; content?: string; tool_calls?: OllamaToolCall[] };
  };
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  if (!OLLAMA_BASE_URL) {
    return Response.json({ text: "Hermes isn't configured yet (missing OLLAMA_BASE_URL)." });
  }

  const body = (await req.json()) as { messages?: { role: "user" | "assistant"; content: string }[] };
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  if (incoming.length === 0) return Response.json({ text: "Ask me anything about your deals." });

  const convo: ChatMsg[] = [{ role: "system", content: systemPrompt() }, ...incoming];

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const { message } = await ollamaChat(convo);

      const calls = message.tool_calls ?? [];
      if (calls.length > 0) {
        convo.push({ role: "assistant", content: message.content ?? "", tool_calls: calls });
        for (const call of calls) {
          const args =
            typeof call.function.arguments === "string"
              ? safeParse(call.function.arguments)
              : call.function.arguments;
          const out = await executeHermesTool(call.function.name, args);
          convo.push({ role: "tool", tool_name: call.function.name, content: JSON.stringify(out) });
        }
        continue;
      }

      return Response.json({ text: (message.content ?? "").trim() || "…" });
    }
    return Response.json({ text: "That took more steps than expected — try narrowing the question." });
  } catch (e) {
    return Response.json({ text: `Hermes couldn't reach the model: ${(e as Error).message}` });
  }
}

function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
