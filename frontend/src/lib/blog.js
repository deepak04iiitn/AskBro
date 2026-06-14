export const posts = [
  {
    slug: 'how-to-chat-with-pdf',
    title: 'How to Chat with a PDF Using AI (2026 Guide)',
    description:
      'Step-by-step guide to using AI to ask questions about any PDF document. Learn how semantic search and RAG work, and how to get cited answers from your documents.',
    date: '2026-05-20',
    readingTime: '6 min read',
    tags: ['PDF Q&A', 'AI tools', 'document search'],
    content: `
# How to Chat with a PDF Using AI (2026 Guide)

Tired of scrolling through 80-page PDFs looking for one specific answer? AI-powered document Q&A tools let you ask questions about your PDF in plain English and get cited answers instantly — pointing to the exact page.

This guide explains how it works and how you can start doing it today.

---

## What is "chatting with a PDF"?

"Chatting with a PDF" means you upload a PDF document and then ask questions about it as if you were having a conversation. Instead of using Ctrl+F to find keywords, you ask natural questions like:

- *"What is the refund policy?"*
- *"How many vacation days do employees get?"*
- *"What does the onboarding process look like for new engineers?"*

The AI reads the document, understands it, and gives you a full answer — with a citation telling you which page the information came from.

---

## How does it work? (The technical bit, simply explained)

Modern PDF chat tools use a technique called **RAG — Retrieval-Augmented Generation**:

1. **Upload** — You upload the PDF. The tool reads and splits it into passages called "chunks."
2. **Embed** — Each chunk is converted into a list of numbers that represents its meaning. This is called an "embedding" or "vector."
3. **Store** — All the embeddings are stored in a vector database.
4. **Ask** — When you ask a question, your question is also converted into an embedding.
5. **Search** — The tool finds the chunks most similar in meaning to your question.
6. **Answer** — An AI model reads those chunks and writes a cited answer.

Because the AI only reads the retrieved chunks — not general internet knowledge — the answers are grounded in your document.

---

## What kinds of documents work best?

PDF chat works well for:
- Company policies and HR documents
- Research papers and academic articles
- Legal contracts and terms of service
- Technical documentation and runbooks
- Textbooks and lecture notes
- Financial reports and earnings calls

It works less well for PDFs that are mostly images or scanned without OCR — because there's no extractable text.

---

## How to get started with AskBro

1. **Create a free workspace** at [askbro.app/create](/create) — no credit card required.
2. **Upload your PDF** — drag and drop. Supported formats: PDF, DOCX, Markdown, TXT.
3. **Wait 30–60 seconds** while AskBro indexes your document.
4. **Ask your first question** — type in plain English and see a cited answer with page references.

---

## Tips for better answers

- **Ask specific questions**: "What is the severance policy for employees with over 5 years of service?" gives better results than "What are the HR policies?"
- **One question at a time**: AI document chat works best with focused questions.
- **Upload higher quality PDFs**: PDFs with selectable text (not scanned images) produce much better results.
- **Use the full document**: If you have a 200-page report, upload it all — the AI will still find the relevant section.

---

## Beyond PDF chat: what else can AskBro do?

AskBro isn't just a PDF reader. Once you're set up, you can also:
- [Ask questions about GitHub repos](/features/github-repo)
- [Generate quizzes from your documents](/features/quizzes)
- [Create flashcard decks from study material](/features/flashcards)
- [Practice technical interview questions](/features/interview-prep)

---

[Start chatting with your PDFs for free →](/create)
`,
  },
  {
    slug: 'ai-interview-prep-guide',
    title: 'AI Tools for Technical Interview Prep in 2026 — Complete Guide',
    description:
      'A complete guide to using AI for technical interview preparation in 2026. Covers DSA practice, system design, behavioural questions, and how to use AI for targeted mock interviews.',
    date: '2026-05-28',
    readingTime: '8 min read',
    tags: ['interview prep', 'AI tools', 'software engineering'],
    content: `
# AI Tools for Technical Interview Prep in 2026 — Complete Guide

Landing a software engineering job at a top company has never been more competitive. The good news: AI tools have gotten dramatically better at helping you prepare. This guide covers exactly how to use AI for every part of your technical interview prep.

---

## What a complete technical interview prep covers

Most engineering interviews have four main components:

1. **Data structures & algorithms (DSA)** — LeetCode-style coding problems
2. **System design** — Architecture and scalability questions
3. **Object-oriented design** — Class design and design patterns
4. **Behavioural / STAR** — Communication, leadership, conflict questions

A good AI prep strategy should cover all four.

---

## How AI makes interview prep more effective

Traditional prep means grinding LeetCode or reading books. AI adds three things:

- **Instant feedback** — Submit an answer, get a model response, a score, and specific feedback on what you missed.
- **Targeted practice** — Upload a job description and get questions tailored to that specific role and company.
- **Conversational depth** — Ask follow-up questions like *"Why does this solution use O(n) space? Is there a way to reduce that?"*

---

## Step-by-step AI interview prep strategy

### Week 1–2: DSA foundations

Start with the core data structures: arrays, linked lists, stacks, queues, hash maps, trees, graphs, heaps. Use AI to:
- Explain concepts in plain English
- Walk through example problems step by step
- Quiz you on time and space complexity

### Week 3–4: System design

System design requires breadth. Study common patterns: caching, load balancing, message queues, databases, CDNs. Practice designing:
- A URL shortener (classic starter)
- A social media feed
- A ride-sharing system

Use AI to play "interviewer" — ask you to design a system, then give feedback on your approach.

### Week 5–6: Company-specific prep

Upload the job description (or a blog post from the company's engineering blog) to AskBro. Generate targeted interview questions based on that specific role's requirements.

### Week 7–8: Mock interview sessions

Do full mock interviews with AI. Answer under time pressure. Get scored. Review model answers for questions you struggled with.

---

## What to look for in an AI interview prep tool

- **Feedback quality** — Does it explain *why* an answer is wrong, not just that it is?
- **Question variety** — Can it generate new questions, not just repeat the same 150 patterns?
- **Document integration** — Can you upload a job description for targeted prep?
- **System design support** — Many tools only cover DSA. Make sure system design is included.

---

## Using AskBro for interview prep

AskBro combines document understanding with interview practice:

1. Upload a job description → get role-specific questions generated automatically
2. Ask about data structures, algorithms, or system design → get detailed explanations
3. Submit practice answers → get instant feedback and a model answer
4. Upload company engineering blog posts → understand the tech stack you'll be asked about

[Start your interview prep free →](/features/interview-prep)

---

## Common mistakes in technical interview prep

1. **Only practicing easy problems** — Companies that interview for difficulty don't care if you solved 300 easy LeetCode problems.
2. **Neglecting system design** — This is where senior roles are won or lost.
3. **Not practicing verbal explanations** — In interviews, you need to talk through your approach out loud.
4. **Not using company-specific prep** — Google, Amazon, and Meta all have distinct interview styles.
5. **Cramming the night before** — Spaced repetition over weeks beats a 12-hour cram session.
`,
  },
  {
    slug: 'generate-flashcards-from-notes',
    title: 'How to Generate Flashcards from Your Notes Using AI',
    description:
      'Stop writing flashcards by hand. Learn how AI can automatically extract key concepts from your lecture notes, PDFs, and textbooks and create spaced-repetition flashcard decks.',
    date: '2026-05-15',
    readingTime: '5 min read',
    tags: ['flashcards', 'study tips', 'AI tools', 'spaced repetition'],
    content: `
# How to Generate Flashcards from Your Notes Using AI

Making flashcards by hand is one of the most effective study methods — but it's also extremely time-consuming. If you spend an hour making cards for every 2 hours of lecture notes, that's time you could spend actually reviewing.

AI flashcard generators solve this. Here's everything you need to know.

---

## Why flashcards work (the science)

Flashcards work because of two cognitive principles:

1. **Active recall** — Retrieving information from memory strengthens the memory trace more than re-reading.
2. **Spaced repetition** — Reviewing material at increasing intervals (1 day, 3 days, 7 days, 14 days...) just before you'd forget it locks it into long-term memory.

The problem is that making good flashcards requires identifying the key concepts — which is itself a skill that takes time. AI can automate the identification step while keeping the active recall benefit.

---

## What makes a good AI-generated flashcard?

A good flashcard has:
- **One concept per card** — Not a paragraph of text
- **A clear question on the front** — That requires active recall, not recognition
- **A concise answer on the back** — With the key term or concept

Bad example:
- Front: *"What is photosynthesis?"*
- Back: *"Photosynthesis is a process used by plants and other organisms to convert light energy, usually from the sun, into chemical energy that can be later released to fuel the organism's activities."*

Better example:
- Front: *"What molecule stores the chemical energy produced by photosynthesis?"*
- Back: *"Glucose (C₆H₁₂O₆)"*

Good AI tools generate the better kind.

---

## How AI generates flashcards from your notes

1. **Upload your notes** — PDF, Word, or Markdown format
2. **AI reads and identifies key concepts** — Terms, definitions, formulas, dates, processes
3. **Cards are generated** — One concept per card, front and back
4. **You review and edit** — Remove duplicates, add cards AI missed, adjust wording
5. **Study with spaced repetition** — The algorithm schedules your review sessions

---

## Which subjects work best?

AI flashcard generation works particularly well for:
- **Science** — Biology terms, chemistry reactions, physics formulas
- **Medicine & anatomy** — Drug names, body systems, conditions
- **Law** — Case names, legal definitions, statutes
- **Computer science** — Data structures, algorithm names, API methods
- **Languages** — Vocabulary, grammar rules
- **History** — Events, dates, people

It works less well for subjects requiring deep synthesis and argument (philosophy essays, literary analysis) — though it can still help with key terms and frameworks.

---

## Getting started with AskBro flashcards

1. **Create a free workspace** at [askbro.app/create](/create)
2. **Upload your lecture notes or textbook chapter** (PDF, DOCX, Markdown, TXT)
3. **Generate a flashcard deck** — AskBro creates front-and-back cards automatically
4. **Edit any cards** — Tweak wording, remove cards you don't need
5. **Start studying** — Work through the deck with spaced repetition scheduling

You can also combine flashcards with [AI quizzes](/features/quizzes) — use quizzes to identify weak areas first, then create focused flashcard decks for those topics.

---

[Generate your first flashcard deck free →](/features/flashcards)
`,
  },
  {
    slug: 'understand-github-codebase-with-ai',
    title: 'How to Understand Any GitHub Codebase with AI',
    description:
      'Dropped into a large GitHub codebase and feeling lost? Learn how to use AI tools to understand code architecture, trace functions, and onboard to any repo in minutes instead of days.',
    date: '2026-05-10',
    readingTime: '7 min read',
    tags: ['GitHub', 'AI tools', 'developer tools', 'codebase'],
    content: `
# How to Understand Any GitHub Codebase with AI

Starting on a new codebase is one of the most cognitively demanding things a developer does. You have thousands of files, unfamiliar patterns, and no map.

AI code understanding tools have changed this. Here's how to use them to go from lost to productive in hours, not weeks.

---

## The classic problem: codebase overload

When you start on a new project — whether it's a new job, an open source contribution, or a client project — you face the same wall:

- You don't know what calls what
- You don't know where things are initialised
- You don't know why certain architectural decisions were made
- Asking teammates feels like interrupting them every 5 minutes

The traditional solution is to spend days reading files, drawing diagrams, and slowly building a mental model. AI makes this dramatically faster.

---

## What you can ask AI about a codebase

Once a GitHub repo is indexed, you can ask questions like:

**Architecture:**
- *"How is user authentication implemented?"*
- *"What database is used and how is the connection managed?"*
- *"What is the request lifecycle for an API call?"*

**Function-level:**
- *"What does the processPayment function do and what does it return?"*
- *"Where is the token refresh logic implemented?"*

**Bug investigation:**
- *"Where is the error handling for database timeouts?"*
- *"Which files are involved in processing a webhook?"*

**Onboarding:**
- *"How do I run this project locally?"*
- *"What environment variables are required?"*
- *"What is the recommended way to add a new API endpoint?"*

---

## How AI codebase search works

The approach is similar to document Q&A:

1. **Index the repo** — Source code files are split into chunks (functions, classes, modules)
2. **Embed each chunk** — Each code chunk gets a semantic vector representation
3. **Ask a question** — Your question is also embedded
4. **Retrieve** — The most semantically similar code chunks are retrieved
5. **Answer** — An AI model reads the retrieved code and explains it in plain English

This is much more powerful than GitHub's native search (which is keyword-only) because it understands *meaning*. Asking "where is rate limiting handled?" will find the right code even if it doesn't contain the exact phrase "rate limiting."

---

## Practical workflow for exploring a new codebase

**Day 1: Understand the architecture**

Start with big-picture questions:
- *"What is the overall architecture of this system?"*
- *"What are the main modules and what does each do?"*
- *"What technology stack is used?"*

**Day 2: Follow the request lifecycle**

Pick a common user action (login, create post, place order) and trace it:
- *"What happens when a user logs in?"*
- *"Walk me through the flow for placing an order from frontend to database."*

**Day 3: Dive into your task area**

Once you have your first task, ask targeted questions:
- *"How is the notifications module structured?"*
- *"What existing tests cover the payment module?"*

---

## Open source contribution made easier

AI codebase search is especially useful for open source contributions:

1. Index the repo before even cloning it
2. Understand the architecture without reading every file
3. Find where to make your change before writing a line of code
4. Ask "how should I add X?" before opening a PR

This is the fastest path from "I want to contribute" to "I have a PR ready."

---

## Getting started with AskBro repo Q&A

1. **Create a free workspace** at [askbro.app/create](/create)
2. **Paste a GitHub repo URL** — public or private (with a token)
3. **Wait 2 minutes** while AskBro indexes the code
4. **Start asking questions** — architecture, functions, bugs, anything

[Understand your next codebase in minutes →](/features/github-repo)
`,
  },
  {
    slug: 'best-ai-study-tools-2026',
    title: 'Best AI Study Tools for Students in 2026',
    description:
      'A curated list of the best AI tools for students in 2026 — covering document Q&A, quiz generation, flashcards, and interview prep. Find the right tool for your study style.',
    date: '2026-06-01',
    readingTime: '6 min read',
    tags: ['study tools', 'AI', 'students', '2026'],
    content: `
# Best AI Study Tools for Students in 2026

AI tools for studying have matured enormously in the past two years. In 2026, the best tools go far beyond "chat with your PDF" — they generate quizzes, build flashcard decks, coach you on interview prep, and adapt to your learning gaps.

Here's a curated overview of the categories that matter and what to look for in each.

---

## Category 1: Document Q&A (Chat with your notes)

**What it does:** Upload lecture notes or textbooks and ask questions in plain English. Get cited answers without re-reading the whole document.

**What to look for:**
- Citations that reference the exact page — not just a general "based on your document"
- Support for multiple file types (PDF, DOCX, Markdown)
- Ability to search across multiple documents at once
- No hallucinations — the AI should say "I don't have that in the document" when the answer isn't there

**Best for:** Studying before exams, understanding dense reading material, getting quick answers from assigned readings.

---

## Category 2: AI Quiz Generators

**What it does:** Turn your notes or textbooks into multiple-choice, true/false, and short-answer quizzes automatically.

**What to look for:**
- Question quality — are the distractors (wrong answers) plausible?
- Source citation — does it tell you which part of the doc the question came from?
- Difficulty control — can you set easy, medium, hard?
- Score tracking — does it track what you got right and wrong?

**Best for:** Exam prep, checking your understanding before a lecture, team study groups.

---

## Category 3: AI Flashcard Generators

**What it does:** Extract key concepts from your notes and build spaced-repetition flashcard decks automatically.

**What to look for:**
- Spaced repetition scheduling — cards you know less see you more often
- Editability — can you tweak AI-generated cards?
- Multi-document decks — can you combine cards from multiple sources?
- Progress tracking — mastery score per card and per deck

**Best for:** Vocabulary-heavy subjects (medicine, law, language learning), long-term retention, exam revision.

---

## Category 4: Interview Prep

**What it does:** Practice technical and behavioural interview questions with instant AI feedback and model answers.

**What to look for:**
- Coverage of DSA, system design, and behavioural
- Ability to upload a job description for targeted practice
- Feedback quality — not just "wrong" but *why* and what was missing
- Conversational follow-ups — can you ask "why is this approach better?"

**Best for:** Job seekers, CS students approaching graduation, career changers into tech.

---

## What to look for in an all-in-one study AI

The strongest tools combine all four categories. The advantages:

1. **One workspace** — all your study material in one place
2. **Cross-feature intelligence** — ask a question, then generate a quiz on that topic, then make flashcards from the weak areas
3. **No subscription fatigue** — one tool instead of four different apps

**AskBro** covers all four: [document Q&A](/features/document-qa), [quizzes](/features/quizzes), [flashcards](/features/flashcards), and [interview prep](/features/interview-prep) — in a single private workspace.

---

## Quick comparison summary

| Feature | Importance for students |
|---|---|
| PDF / document Q&A | High — saves hours of re-reading |
| Quiz generation | High — active recall is the most effective study method |
| Flashcards with spaced repetition | High — best for long-term retention |
| Multi-document search | Medium — useful for cross-referencing sources |
| Interview prep | High for CS students and job seekers |
| Team/group workspaces | Medium — great for study groups |

---

The best study approach combines all of these: ask questions to understand the material, generate quizzes to test yourself, review flashcards with spaced repetition, and practice interview questions for the skills that matter in your career.

[Get started with AskBro for free →](/create)
`,
  },
]

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug) ?? null
}

export function getAllPostSlugs() {
  return posts.map((p) => ({ slug: p.slug }))
}
