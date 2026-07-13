import { getUser } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import {
  HERMES_TOOLS,
  HERMES_WRITE_TOOLS,
  WRITE_TOOL_NAMES,
  buildProposal,
  executeHermesTool,
  type ToolDef,
} from "@/lib/hermes/tools";

// Hermes runs on the shared Ollama-cloud endpoint (from the Hermes Gateway),
// which is OpenAI-compatible — OLLAMA_BASE_URL ends in /v1.
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const HERMES_MODEL = process.env.HERMES_MODEL || "glm-5.2";
const MAX_TOOL_ROUNDS = 6;

type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
type ChatMsg =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; content: string; tool_call_id: string };

function openaiTools(defs: ToolDef[]) {
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
    "ALWAYS use the read tools to look up the creator's own data — never invent deal data, amounts, dates, or statuses. If a tool returns nothing, say so.",
    "For anything the creator's data can't answer — typical rates, a brand's reputation/recent campaigns, trends, contract norms — use web_search (and web_fetch to read a result in detail). Summarize findings and cite the source URLs. Keep the creator's private deal data separate from public web info.",
    "You can also PROPOSE changes with the write tools (set_stage, set_payment_status, add_deliverable, draft_message). Calling one does NOT change anything — it shows the creator a confirmation card they must approve. First look up the deal to get its id, then call the write tool with exact values. In your text, briefly say what you're proposing.",
    "Never claim you already made a change — you only propose; the creator confirms.",
    "Be concise and practical. Lead with the answer.",
  ].join(" ");
}

async function chat(messages: ChatMsg[]) {
  const res = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(OLLAMA_API_KEY ? { authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: HERMES_MODEL,
      messages,
      tools: openaiTools([...HERMES_TOOLS, ...HERMES_WRITE_TOOLS]),
      tool_choice: "auto",
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`model ${res.status}: ${await res.text().catch(() => "")}`);
  return (await res.json()) as {
    choices: { message: { content: string | null; tool_calls?: ToolCall[] } }[];
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
      const { choices } = await chat(convo);
      const msg = choices?.[0]?.message;
      if (!msg) return Response.json({ text: "Hermes returned no response." });

      const calls = msg.tool_calls ?? [];

      // A write-tool call becomes a proposal — nothing is executed here.
      const writeCall = calls.find((c) => WRITE_TOOL_NAMES.has(c.function.name));
      if (writeCall) {
        const proposal = await buildProposal(writeCall.function.name, safeParse(writeCall.function.arguments));
        if (proposal) {
          return Response.json({
            text: (msg.content ?? "").trim() || "Here's what I'd change — confirm to apply:",
            proposal,
          });
        }
      }

      if (calls.length > 0) {
        convo.push({ role: "assistant", content: msg.content ?? "", tool_calls: calls });
        for (const call of calls) {
          const out = await executeHermesTool(call.function.name, safeParse(call.function.arguments));
          convo.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(out) });
        }
        continue;
      }

      return Response.json({ text: (msg.content ?? "").trim() || "…" });
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
