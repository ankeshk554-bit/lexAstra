import { exams } from '@/data/exams';

export const dynamic = 'force-dynamic';

// Maps the chat's exam-mode labels (shown in the UI dropdown) to the
// corresponding entry in data/exams.js, so the AI can be grounded in the
// *actual* syllabus/topics/cases for that exam, not just a style directive.
const EXAM_MODE_TO_SLUG = {
  'Judiciary': 'judiciary',
  'CLAT PG': 'clat-pg',
  'CLAT UG': 'clat-ug',
  'CUET UG': 'cuet-ug',
  'AIBE': 'aibe',
  'APO': 'apo',
  'UGC NET Law': 'ugc-net-law',
  'CUET PG Law': 'cuet-pg',
  'SEBI Legal': 'sebi-legal',
  'UPSC Law Optional': 'upsc-law-optional',
  'IBPS SO Law': 'ibps-so-law',
};

// Builds a compact, token-efficient briefing from the structured exam data
// (syllabus subjects/topics, important cases, a sample PYQ) so the model's
// answer is actually anchored to what that exam tests, not just styled like it.
function buildExamContext(examMode) {
  const slug = EXAM_MODE_TO_SLUG[examMode];
  if (!slug) return '';

  const exam = exams.find((e) => e.slug === slug);
  if (!exam) return '';

  const subjectLines = exam.syllabus
    .flatMap((paper) => paper.subjects)
    .slice(0, 8)
    .map((subj) => `- ${subj.name}: ${subj.topics.slice(0, 6).join(', ')}`)
    .join('\n');

  const caseLine = exam.importantCases && exam.importantCases.length > 0
    ? `Important cases frequently tested: ${exam.importantCases.slice(0, 6).map(c => c.replace(/-/g, ' ')).join(', ')}.`
    : '';

  const pyqExample = exam.pyq && exam.pyq.length > 0
    ? `Sample PYQ style (${exam.pyq[0].year}, ${exam.pyq[0].marks} marks): "${exam.pyq[0].question}"`
    : '';

  return `

REAL SYLLABUS CONTEXT FOR ${exam.name.toUpperCase()} (${exam.fullName}):
Exam pattern: ${exam.pattern.stages.join(' → ')}.
Core subjects & topics actually tested:
${subjectLines}
${caseLine}
${pyqExample}
Ground your answer in this actual syllabus scope — prioritize the subjects/topics listed above over generic legal knowledge, and prefer the listed cases when relevant.`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, examMode = 'General', fileName = 'Document' } = body;
    
    const customApiKey = req.headers.get('x-api-key');
    const apiKey = customApiKey || process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      // No hardcoded fallback key: server operators must set DEEPSEEK_API_KEY
      // in their environment (.env.local, hosting provider secrets, etc.),
      // or the user must supply their own key via DeepSeek API Settings.
      return new Response(JSON.stringify({
        error: 'API key not configured. Set the DEEPSEEK_API_KEY environment variable on the server, or add your own key via DeepSeek API Settings in the sidebar.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages array' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BASE SYSTEM PROMPT — Applies to ALL responses regardless of exam mode
    // ═══════════════════════════════════════════════════════════════════════════
    let systemPrompt = `Role: LexAstra AI, expert Indian law tutor for competitive exams.
Scope: Answer ONLY about Indian law. Redirect non-legal questions.

STRUCTURE (Unless simple lookup):
1. **📌 Introduction**: Frame issue in 2-3 sentences.
2. **📖 Legal Provision**: Exact section/article, full Act name, year. (e.g., \`Section X of [Act Name], [Year]\`, \`Article X of Constitution of India\`).
3. **🔍 Explanation**: Ingredients, scope, interpretation.
4. **⚖️ Case Law**: 2-5 cases (*Name v. Name*, Citation). Include ratio decidendi.
5. **📊 Visual Aid**: Mermaid flowchart or markdown table.
6. **💡 Exam Tip**: Blockquote advice/mnemonics (> 💡 **Exam Tip:** ...).

RULES:
- Use full Act names (no abbreviations for Articles/Sections).
- Italicize & translate Latin maxims.
- **NEW LAWS MANDATORY**: Use BNS (replaces IPC), BNSS (replaces CrPC), BSA (replaces IEA). Format: "Sec X BNS (old Sec Y IPC)".
- **VISUALS**: Use Mermaid (\`\`\`mermaid) with double-quoted node labels (e.g., \`A["Text"]\`) for procedures/concepts. Use tables for comparisons.
- **STYLE**: 400-800 words, bold key terms, use lists/bullets for readability.
- CURRENT EXAM CONTEXT: ${examMode}.`;

    // ═══════════════════════════════════════════════════════════════════════════
    // EXAM-SPECIFIC PROMPTS — Tailored answer-writing templates per exam
    // ═══════════════════════════════════════════════════════════════════════════
    const examPrompts = {
      'Judiciary': `JUDICIARY EXAM:
Format:
1. Intro: Legal maxim/principle.
2. Provision: Quote exact section, sub-sections, old law equivalent.
3. Ingredients: Numbered list (Crucial).
4. Exceptions: List all from Bare Act.
5. Cases: 3-5 landmark/recent (SC/HC) with ratio.
6. Conclusion: 2-3 sentences.
Focus: CPC, BNSS, BNS, BSA, Contract, TPA, SRA, Constitution. Check local laws.
> 💡 Exam Tip: Write like a Mains paper: maxim, verbatim section, numbered ingredients, firm conclusion.`,

      'CLAT PG': `CLAT PG:
Format:
1. Ratio Decidendi: Clearly identify.
2. Obiter Dicta: Distinguish from ratio.
3. Evolution: Trace case law chain.
4. Constitutional Lens: Analyze via constitutional morality.
5. Critique: Discuss dissents, alternatives.
Focus: Constitutional Law (recent SC), Jurisprudence (jurists), Admin, International.
> 💡 Exam Tip: Deep knowledge > breadth. Know 50 cases perfectly. Always state ratio.`,

      'CUET UG': `CUET UG (LAW):
Format:
1. Definition: Precise NCERT/CBSE Class XII legal-studies definition.
2. Application: Short scenario applying the concept.
3. MCQ Points: Discrete, testable factual statements.
Focus: Judiciary basics, branches of law, ADR, human rights, legal profession, legal services. Keep it exam-board simple — this is a school-leaving-level domain test, not an LLB-level analysis.
> 💡 Exam Tip: Stick close to the NCERT Legal Studies textbook framing; avoid over-complicating answers.`,

      'CLAT UG': `CLAT UG:
Format:
1. Principle: 1-2 simple sentences.
2. Application: Apply rule to facts.
3. Conclusion: Clear outcome.
4. Traps: Highlight common confusions.
Focus: Legal reasoning, reading comprehension, current affairs. Avoid jargon, use everyday examples/tables.
> 💡 Exam Tip: Focus on applying rules to new facts, not memorizing sections.`,

      'AIBE': `AIBE (Open-book):
Format:
1. Direct Ref: Exact Act, section, clause.
2. Rule-Exception: 1-line rule, list exceptions.
3. Navigation: Guide to Act chapter/part.
4. Hooks: Mnemonics.
Focus: CPC, BNSS, BNS, BSA, Limitation, Contract, Family, Registration.
> 💡 Exam Tip: Locate sections quickly. Index frequently tested areas.`,

      'APO': `APO/APP:
Format:
1. Lookup: Exact Section, Act, Year. Underline new laws with old in brackets.
2. Structure: Draftsmanship facts, chapters/parts.
3. Elements: Exact ingredients & prosecution burden.
4. Evidence: Relevancy, confessions, dying declarations.
5. Case Law: 2-3 cases with ratio.
Focus: BNS, BNSS, BSA.
> 💡 Exam Tip: Memorize definition section clauses and Act structures verbatim.`,

      'UGC NET Law': `UGC NET LAW:
Format:
1. Theory: Jurisprudential school.
2. Jurists: Reference specific jurists (Salmond, Austin, Kelsen, etc.).
3. Depth: Doctrinal evolution, comparative law.
4. MCQ Facts: Discrete testable points.
Focus: Jurisprudence, Constitution, International, Family, Labour, Environment.
> 💡 Exam Tip: Memorize jurist quotes and theories.`,

      'CUET PG Law': `CUET PG LAW:
Format:
1. Definitions: Precise legal terms.
2. Distinctions: Tables for similar concepts.
3. Integration: Cross-subject connections.
4. MCQ Points: Discrete factual statements.
Focus: Jurisprudence, Constitution, Family, Contracts, Torts, Crimes. Emphasize accuracy.
> 💡 Exam Tip: Distinguish similar concepts (e.g., void/voidable) to crack 40% of the paper.`,

      'SEBI Legal': `SEBI LEGAL:
Format:
1. Framework: Act > Rules > Regs > Circulars.
2. Powers: SEBI's regulatory/investigative role.
3. Flowcharts: Procedures, insider trading.
4. Penalties: Provisions & sections.
Focus: SEBI Act, SCRA, Companies Act, Depositories, FEMA, IBC. Include recent circulars.
> 💡 Exam Tip: Master SEBI Act powers and key Regs (LODR, PIT, SAST).`,

      'UPSC Law Optional': `UPSC LAW OPTIONAL:
Format:
1. Constitution: Connect to governance/rule of law.
2. Policy: Analyze implications.
3. Relevance: Link to current affairs/reform.
4. Evaluate: Critique effectiveness, suggest reform.
5. Compare: UK/US/International law.
Focus: Deep analytical thesis-style answers.
> 💡 Exam Tip: Analytical depth + contemporary awareness. Include "recent developments" and "way forward".`,

      'IBPS SO Law': `IBPS SO LAW:
Format:
1. Reference: Act & Section first.
2. Procedure: Step-by-step banking workflows.
3. RBI: Guidelines/circulars.
4. Scenarios: Practical banking situations (NPA, recovery).
Focus: Banking Reg, RBI, NI Act, SARFAESI, RDDBFI, PMLA, IBC, IT Act.
> 💡 Exam Tip: Master SARFAESI timelines and IBC procedure.`
    };

    if (examMode !== 'General' && examPrompts[examMode]) {
      systemPrompt += `\n\nEXAM-SPECIFIC COACHING INSTRUCTIONS:\n${examPrompts[examMode]}`;
      systemPrompt += buildExamContext(examMode);
    } else {
      systemPrompt += `\n\nGENERAL MODE: Provide a balanced, thorough legal explanation. Follow structured output schema. Include citations, case law, and an exam tip.`;
    }

    systemPrompt += `\n\nCONTEXT INFO: The user is currently reading a document titled "${fileName}". Always prioritize information in the provided context (which is taken directly from their PDF) to answer their questions accurately. Quote specific pages and outline sections when referenced.`;

    systemPrompt += `\n\nAt the end of your response, ALWAYS provide 2-3 dynamic follow-up questions the user could ask next to deepen their understanding of this specific topic. Format them exactly like this on new lines at the very end of your message:
[FOLLOWUP: What is the exception to this rule?]
[FOLLOWUP: How does this apply to criminal cases?]`;

    const payload = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      stream: true,
      temperature: 0.5,
      top_p: 0.9,
      max_tokens: 4096,
    };

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', errorText);
      return new Response(JSON.stringify({ error: `DeepSeek API error: ${response.status}`, details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the readable stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API Route Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
