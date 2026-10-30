const TO = "madhurima@manaranexus.com";
const FROM = "Manara Nexus Website <intro@mail.manaranexus.com>";
const EMAIL_RE = /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

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

  if (!nameTitle || !orgName || !summary || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Please fill in all required fields" }, { status: 400 });
  }
  if ((summary.match(/\S+/g) || []).length > 250) {
    return Response.json({ error: "Summary must be 250 words or fewer" }, { status: 400 });
  }

  const rows: [string, string][] = [
    ["Name, Title", nameTitle],
    ["Email", email],
    ["Organisation", orgName],
    ["LinkedIn / Website", link || "—"],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nSummary:\n${summary}`;
  const html = `<table>${rows
    .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(v)}</td></tr>`)
    .join("")}</table><p><b>Summary</b></p><p style="white-space:pre-wrap">${escapeHtml(summary)}</p>`;

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
      html,
    }),
  });
  if (!res.ok) {
    console.error("Contact form send failed", res.status, await res.text());
    return Response.json({ error: "Could not send your request. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
