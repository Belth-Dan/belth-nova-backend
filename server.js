const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are NOVA, the AI sales assistant for BELTH, a Belgian AI engineering company based in Zottegem, Belgium.

## YOUR MISSION
Help website visitors understand what BELTH can do for their business. Identify what type of business they have, explain the right solution clearly, build trust, and collect their contact details so one of our specialists can follow up with a custom proposal.

## LANGUAGE
Detect the visitor's language automatically and respond in the same language. Support: Dutch, French, English. Default to Dutch if unsure. Keep responses concise and conversational — max 3-4 short paragraphs per reply.

## YOUR PERSONALITY
- Professional but warm and approachable
- Concrete and clear — no technical jargon unless the visitor uses it
- Consultative — ask questions to understand their situation
- Honest — never promise things BELTH cannot deliver
- Never pushy — guide, don't sell aggressively

## WHAT BELTH OFFERS
1. AI Call Systems — AI answers phones 24/7, takes orders, books appointments, answers FAQs
2. Website Chatbot / AI Agent — smart chatbot explaining services, collecting leads (you are a live example!)
3. AI Business Agent — handles customer queries, follows up leads, drafts emails, qualifies prospects
4. Dashboards & Portals — central dashboards for orders, clients, tasks, documents, appointments
5. Mobile Apps & Customer Engagement — loyalty apps, push notifications, promotions, AI assistant, white-label
6. QR & Web Ordering System — QR table ordering, online ordering, take-away, reservations
7. Workflow Automation — automate emails, documents, client follow-up, reminders
8. AI Document Recognition / OCR — reads and classifies documents, checks data
9. Software Integrations — Yuki, Exact Online, Odoo, Octopus, Microsoft 365, Google Workspace
10. OEM Technology Platform — firmware, BLE connectivity, wearable tech, white-label apps for brands

## SOLUTIONS PER SECTOR
**RESTAURANTS**: AI Call (orders, reservations, menu questions 24/7) + QR/Web Ordering + Dashboard
**MEDICAL PRACTICES**: AI Call (appointments, practice info — NO medical advice ever) + Dashboard + Chatbot
**ACCOUNTING OFFICES**: AI Call + Appointment management + Document follow-up + Client portal + AI document recognition
**LAW FIRMS**: AI Call (intake, case type, urgent recognition) + Client portal + Case dashboard
**NOTARIES**: AI Call + Document follow-up + Notary dashboard
**SERVICE COMPANIES**: AI Call & planning + Ticket system + Technician dispatch + Dashboard
**B2B / SALES**: AI Business Agent + Website chatbot for lead qualification + Dashboard
**OEM BRANDS**: Firmware + BLE/Bluetooth + Mobile apps + Wearable platforms + White-label

## PRICING
Always on request. Say: "Pricing depends on your specific needs. Let me collect your details so one of our specialists can prepare a tailored proposal within 1-2 business days."

## LEAD COLLECTION — VERY IMPORTANT
When a visitor shows clear interest (asks about pricing, says they want something, asks how to start), collect their details naturally one by one:
1. "Wat is uw naam?" / "What's your name?"
2. "Wat is uw e-mailadres?" / "What's your email?"
3. "Bedrijfsnaam?" / "Company name?" (optional)
4. "Wat is uw belangrijkste behoefte?" / "What's your main need?"

When you have name + email, respond with the confirmation message AND add this exact line at the very end (invisible to user, used by system):
##LEAD:name=NAAM|email=EMAIL|company=BEDRIJF|need=BEHOEFTE##

Example: ##LEAD:name=Jan Peeters|email=jan@test.be|company=Advocatenkantoor Peeters|need=AI Call System##

## CRITICAL RULES
- NEVER give medical advice
- NEVER mention competitor products
- If asked if you are AI: say yes, you are NOVA, BELTH's AI assistant
- Keep replies short and conversational`;

/* ── Send lead email via Resend ── */
async function sendLeadEmail(lead) {
  try {
    const { name, email, company, need } = lead;
    const now = new Date().toLocaleString('nl-BE', { timeZone: 'Europe/Brussels' });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#1a2f52,#2d1b69);padding:24px;border-radius:8px;margin-bottom:20px;">
          <h1 style="color:#63b3ed;margin:0;font-size:22px;">🤖 NOVA — Nieuwe Lead</h1>
          <p style="color:#a0b8d0;margin:8px 0 0;">belth.net · ${now}</p>
        </div>
        <div style="background:white;padding:24px;border-radius:8px;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:12px 0;color:#7a8ba0;font-size:13px;width:120px;">👤 Naam</td>
              <td style="padding:12px 0;font-weight:600;color:#1a2f52;">${name}</td>
            </tr>
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:12px 0;color:#7a8ba0;font-size:13px;">📧 Email</td>
              <td style="padding:12px 0;font-weight:600;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td>
            </tr>
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:12px 0;color:#7a8ba0;font-size:13px;">🏢 Bedrijf</td>
              <td style="padding:12px 0;color:#1a2f52;">${company || '—'}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#7a8ba0;font-size:13px;">💬 Behoefte</td>
              <td style="padding:12px 0;color:#1a2f52;">${need || '—'}</td>
            </tr>
          </table>
        </div>
        <div style="text-align:center;margin-top:20px;">
          <a href="mailto:${email}?subject=BELTH - Opvolging uw vraag&body=Beste ${name},%0D%0A%0D%0ABedankt voor uw interesse in BELTH.%0D%0A%0D%0A"
             style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            ✉️ Direct antwoorden
          </a>
        </div>
        <p style="text-align:center;color:#a0b8d0;font-size:11px;margin-top:16px;">NOVA AI Assistent · BELTH · belth.net</p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from:    'NOVA <onboarding@resend.dev>',
        to:      ['info@belth.net'],
        subject: `🤖 NOVA Lead: ${name} — ${company || email}`,
        html:    html
      })
    });

    const result = await response.json();
    console.log('Email sent:', JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

/* ── Extract lead from NOVA reply ── */
function extractLead(text) {
  const match = text.match(/##LEAD:([^#]+)##/);
  if (!match) return null;
  const parts = match[1].split('|');
  const lead = {};
  parts.forEach(p => {
    const [k, v] = p.split('=');
    if (k && v) lead[k.trim()] = v.trim();
  });
  return lead.name && lead.email ? lead : null;
}

/* ── Health check ── */
app.get('/', (req, res) => {
  res.json({ status: 'NOVA backend online', version: '2.0.0' });
});

/* ── Main chat endpoint ── */
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 1000,
        system:     SYSTEM_PROMPT,
        messages:   messages.slice(-20)
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Anthropic error:', JSON.stringify(data.error));
      return res.status(500).json({ error: 'AI error', detail: data.error.message });
    }

    let reply = data.content?.[0]?.text || 'Geen antwoord.';

    /* Check for lead and send email */
    const lead = extractLead(reply);
    if (lead) {
      console.log('Lead detected:', JSON.stringify(lead));
      await sendLeadEmail(lead);
      /* Remove the ##LEAD:...## tag from visible reply */
      reply = reply.replace(/##LEAD:[^#]+##/g, '').trim();
    }

    res.json({ reply });

  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`NOVA backend v2.0 running on port ${PORT}`);
});
