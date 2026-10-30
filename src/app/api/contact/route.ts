import { DOMAIN_RE, MAX_SUMMARY_WORDS, countWords } from "@/lib/contact";

const TO = "madhurima@manaranexus.com";
const FROM = "Manara Nexus Website <intro@mail.manaranexus.com>";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

  // Honeypot: real visitors never see or fill this field
  if (body.website) return Response.json({ ok: true });

  const field = (key: string, max: number) => String(body[key] ?? "").trim().slice(0, max);
  const nameTitle = field("nameTitle", 200);
  const email = field("email", 254);
  const orgName = field("orgName", 200);
  const link = field("link", 500);
  const summary = field("summary", 5000);

  const [local, domain, ...rest] = email.split("@");
  if (!nameTitle || !orgName || !summary || !local || rest.length || !DOMAIN_RE.test(domain ?? "")) {
    return Response.json({ error: "Please fill in all required fields" }, { status: 400 });
  }
  if (countWords(summary) > MAX_SUMMARY_WORDS) {
    return Response.json({ error: `Summary must be ${MAX_SUMMARY_WORDS} words or fewer` }, { status: 400 });
  }

  const text = [
    `Name, Title: ${nameTitle}`,
    `Email: ${email}`,
    `Organisation: ${orgName}`,
    `LinkedIn / Website: ${link || "—"}`,
    "",
    "Summary:",
    summary,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: TO,
      reply_to: email,
      subject: `Intro call request: ${orgName}`,
      text,
    }),
  });
  if (!res.ok) {
    console.error("Contact form send failed", res.status, await res.text());
    return Response.json({ error: "Could not send your request. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
