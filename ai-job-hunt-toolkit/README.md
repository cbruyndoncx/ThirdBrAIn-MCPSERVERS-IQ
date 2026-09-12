# AI Job Hunt Toolkit

An AI-powered job hunting system that manages your entire job search. Built on [Claude Code](https://claude.com/claude-code), it handles resume writing, cover letters, applications, LinkedIn outreach, contact networking, career coaching, and progress tracking through a team of specialized AI agents.

You talk to one agent, the **job coach**, and it orchestrates everything else.

## What It Does

The toolkit turns your job search into a structured pipeline. Every job you're interested in gets tracked from discovery through offer, with AI handling the tedious parts: tailoring resumes, drafting cover letters, filling out application forms, writing outreach messages, and keeping track of where everything stands.

A database keeps track of all your jobs, applications, contacts, and activity. The coach uses this to tell you what to work on next, so you never have to wonder "what should I do today?"

## Getting Started

### 1. Install

Open [Claude Code](https://claude.com/claude-code) and paste this repo URL:

```
https://github.com/dfrysinger/ai-job-hunt-toolkit
```

Tell Claude: "Clone this repo and set it up for me as a job hunting toolkit. Copy agents/ to ~/.claude/agents/, skills/ to ~/.claude/skills/, and create a new project folder at ~/job-hunt/ with the contents of templates/ and coach-tools/."

### 2. First Run

```
cd ~/job-hunt
claude --agent job-coach
```

The coach walks you through everything on your first session:

1. **Your info** -- Name, contact details, career goals. Takes about 5 minutes. The coach asks one question at a time and fills in your config automatically.

2. **Database setup** -- The coach launches a setup assistant that creates a free database to track your jobs, applications, and contacts. It walks you through each step and handles the technical parts. About 10-15 minutes.

3. **Your experience** -- Share your existing resume (or multiple versions if you have them) and the coach parses everything into organized libraries: accomplishment bullets by company, skills by category, and profile paragraphs by angle. If you have cover letters you liked, it captures those too. About 15-20 minutes.

4. **Your priorities** -- The coach helps you build a personal job ranking rubric. What matters most to you? Domain excitement? Culture? Location? Compensation? You pick your top priorities and weight them. This rubric drives every future recommendation about what to work on next. About 10 minutes.

### 3. Start Hunting

After setup, every session starts with the coach. It checks your pipeline, flags anything that needs attention (unanswered messages, stale applications), and suggests what to work on next. When you need something specific done, it hands off to the right specialist agent.

## The Agents

### Job Coach (the one you talk to)

Your strategic partner for the entire job search. The coach runs every session and coordinates everything else.

**What it does:**
- Helps you evaluate and rank new job opportunities using your personal rubric
- Figures out what you should work on next based on your pipeline state
- Challenges your assumptions about targeting, positioning, and strategy
- Researches companies, roles, and market trends when you need context
- Hands off to specialist agents when you need a resume, cover letter, outreach message, or application filled out
- Tracks your progress and adapts recommendations based on what's working

**Coaching style:** Socratic by default. It asks probing questions before giving answers and challenges fuzzy thinking. When you want a direct recommendation, just ask for one.

**Coaching tools:** The coach draws from a library of career frameworks including transferable skills mapping, competitive positioning research, career transition strategies, energy mapping, and multi-path career planning.

### Resume Optimizer

Creates tailored resumes for specific job postings.

**What it does:**
- Reads the job description and matches requirements to your accomplishment library
- Selects the best bullets, skills, and profile angle for each application
- Clones your base resume template to preserve formatting
- Produces a ready-to-submit .docx file
- Tracks the resume in the database so other agents know it exists

**How it works:** You share a job posting URL, and it fetches the description, maps your experience to the requirements, and produces a tailored resume. It never fabricates experience. Everything comes from your actual accomplishments.

### Cover Letter Optimizer

Writes compelling, authentic cover letters through a 4-phase process.

**What it does:**
- **Phase 1 (Briefing):** Researches the company deeply, including funding, news, leadership, and competitive landscape
- **Phase 2 (Story Matching):** Proposes stories from your career that connect to the company's work. You pick which ones to use.
- **Phase 3 (Outline):** Produces a structured outline for your approval before writing anything
- **Phase 4 (Draft):** Writes the letter from your approved outline

**Voice:** The letters read like a thoughtful email from a peer, not a sales pitch. It tells stories about what you did and lets the reader connect the dots.

### Job Applicator

Fills out job application forms so you don't have to.

**What it does:**
- Opens the application in a visible browser window (you can watch everything it does)
- Fills in your information, work history, education, and answers to common questions
- Handles Workday, Greenhouse, Lever, and other major applicant tracking systems
- Pauses at each page for your review before continuing
- Never clicks Submit without your explicit confirmation
- Uploads your resume and cover letter PDFs

**ATS knowledge:** Includes tips for each major platform's quirks (Workday's search fields, Greenhouse's single-page forms, etc.) and learns new ones as it goes.

### LinkedIn Outreach

Drafts personalized LinkedIn messages for job-related networking.

**What it does:**
- Selects the right message template based on your relationship to the contact (former colleague, hiring manager, recruiter, network connection, etc.)
- Customizes each message with relevant highlights from your resume
- Works through your contact queue systematically or handles one-off requests
- Logs all outreach for tracking

**9 relationship types:** Each gets a different tone and approach. A message to a former colleague is warm and direct. A message to a hiring manager leads with relevant impact. A message to a recruiter is enthusiastic and clear about value.

### Contact Discovery

Guides you through researching contacts at target companies.

**What it does:**
- Opens LinkedIn search pages for you to browse manually (it never scrapes LinkedIn)
- Provides a scratchpad where you paste whatever you find: URLs, names, titles, or raw text
- Parses your messy input into structured contact records
- Suggests relationship classifications (recruiter, hiring manager, network connection, etc.)
- Saves contacts to the database linked to the right job posting

**Important:** This agent does NOT automatically browse or scrape LinkedIn. You do the browsing, it does the organizing.

### Setup Assistant

Handles the technical infrastructure setup during your first session.

**What it does:**
- Creates a free database (Supabase) to store your job pipeline
- Deploys the server that lets agents read and write to the database
- Configures credential storage (macOS Keychain, 1Password, or config file)
- Optionally sets up email and Slack notifications
- Optionally configures daily progress emails

## Your Job Pipeline Database

The database is the backbone of the toolkit. It keeps track of everything so the agents always know the current state of your job search.

**What it stores:**

- **Companies** -- Name, website, notes. One record per company, linked to all their job postings.
- **Job postings** -- Every role you're interested in. Title, URL, salary info, location, your priority ranking, and where it stands in the networking/application process.
- **Applications** -- When you applied, which resume you used, current status (draft, ready, applied, screening, interviewing, offer, accepted, rejected, withdrawn). Links to the posting and tracks dates.
- **Contacts** -- People you've found at target companies. Name, title, LinkedIn URL, relationship type, when you last contacted them. Links to the posting they're relevant for.
- **Interviews** -- Scheduled interviews with date, time, type (phone, video, onsite), interviewer name, and your notes.
- **Activity log** -- Every action taken by you or an agent (resume created, application submitted, status changed, contact added). This powers the progress tracking and daily summaries.

**How it helps:**

The coach uses the database to answer "what should I work on next?" without you having to remember where everything stands. It walks your ranked job list top to bottom, finds the next unfinished step for each job, and suggests the highest-impact work. When you're blocked on one job (waiting for a reply), it drops to the next one.

The database also prevents things from falling through the cracks. Jobs where you applied weeks ago but never heard back get flagged. Contacts you researched but never messaged show up in your outreach queue. Nothing gets lost.

## Optional: Daily Progress Emails

The toolkit can send you a daily email summarizing what happened in the last 7 days and suggesting the next steps to focus on. There's also a weekly summary that lists all applications submitted that week.

These are completely optional and configured during setup. They're meant to be helpful reminders, not guilt trips. No targets, no streaks, no "you fell behind" messaging.

## Quick Start Summary

| Step | What happens | Time |
|------|-------------|------|
| Install | Copy files into Claude Code | 2 min |
| Config | Coach asks your name, contact info, goals | 5 min |
| Database | Setup assistant creates your pipeline database | 10-15 min |
| Content | Coach parses your resume(s) into the system | 15-20 min |
| Priorities | Coach helps you build your job ranking rubric | 10 min |
| **Total first-time setup** | | **~45 min** |

After that, every session is just: open Claude Code, start the coach, and get to work.

## Technical Details

For developers and contributors:

- **Agents** are Claude Code agent definitions in `agents/`. Each is a markdown file with specialized instructions.
- **Database** is PostgreSQL on Supabase (free tier). Schema is in `mcp-server/schema/`.
- **MCP server** is a Supabase Edge Function that gives agents database access through the Model Context Protocol.
- **Scheduled scripts** are Deno/TypeScript in `extension/`, triggered by macOS launchd (or cron/systemd on Linux).
- **Credentials** support three backends: 1Password, OS keychain (macOS/Linux), or `.env` files.
- **Coach tools** in `coach-tools/` are markdown-based career frameworks the coach reads on demand.

## Credits

Built by Daniel Frysinger during a 2026 job search using Claude Code.

This toolkit represents months of iterative development: each agent was refined through hundreds of real job applications, and the coaching frameworks were developed through dozens of strategy sessions with the job-coach agent.

## License

MIT License. See [LICENSE](LICENSE) for details.
