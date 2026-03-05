# Career Readiness Modules — Pedagogical Approach

This document describes the evidence-based pedagogical approach used in the AI-led career readiness tutoring modules. It is intended for review by TEVET, the World Bank, and other stakeholders.

## Executive Summary

The career readiness modules use **scaffolded Socratic tutoring** — an approach where the AI agent guides students to build understanding through questions and hints rather than giving answers directly. Research shows this is critical: a Wharton/UPenn study (Bastani et al., 2024, published in PNAS) found that unrestricted AI access **actively harmed** student learning, while a Socratic-guardrailed version significantly improved it. A Harvard study (Kestin et al., 2025, published in Nature) confirmed that scaffolded AI tutoring produced learning gains more than double those of traditional classrooms.

In practice, the agent: (1) assesses what the student already knows, (2) asks guiding questions, (3) provides hints when the student struggles, and (4) gives direct explanations only as a last resort. Every conversation turn doubles as a comprehension check — the agent asks students to explain concepts back, apply them to their situation, and predict outcomes. The quiz only becomes available after all lesson plan topics have been covered and the student has demonstrated understanding through these checks.

After passing the quiz, the module stays open in support mode so students can return for follow-up questions — reinforcing retention through spaced practice.

This approach is aligned with World Bank, UNESCO-UNEVOC, and OECD recommendations for AI integration in technical and vocational education (TVET), and builds on 40 years of research showing that one-to-one tutoring with mastery learning produces the largest known effect on student achievement (Bloom, 1984).

## Overview

Each career readiness module is powered by an AI conversational agent that acts as a personal tutor. The agent guides students through structured lesson plan content using techniques grounded in published research on intelligent tutoring systems, AI-led pedagogy, and vocational education.

The approach is designed around three core principles:

1. **Scaffolded Socratic tutoring** — guide students to construct understanding rather than passively receive information
2. **Continuous formative assessment** — treat every dialogue turn as an opportunity to check comprehension
3. **Mastery-based progression** — students must demonstrate topic coverage before advancing to the quiz

---

## 1. Teaching Method: Scaffolded Socratic Tutoring

The agent uses a graduated assistance model that combines Socratic questioning with adaptive scaffolding:

1. **Assess** — begin each topic by probing what the student already knows
2. **Guide** — ask leading questions that help the student reason through the material
3. **Hint** — if the student struggles, provide partial information or worked examples
4. **Explain** — give direct explanations only as a last resort
5. **Fade** — as the student demonstrates understanding, reduce support and encourage independent reasoning

This approach avoids two failure modes identified in research: unguarded AI access (which harms learning by giving answers too easily) and naive Socratic questioning without scaffolding (which frustrates students without producing measurable learning gains).

### Supporting Evidence

- **Bastani, H., Bastani, O., Sungu, A., Ge, H., Kabakci, O., & Mariman, R. (2024).** "Generative AI Can Harm Learning." *Proceedings of the National Academy of Sciences (PNAS).* Wharton School, University of Pennsylvania. — In a randomized controlled trial with ~1,000 high school students, unrestricted ChatGPT access improved practice scores by 48% but **reduced subsequent test scores by 17%** when access was removed. A pedagogically designed "GPT Tutor" with Socratic guardrails (refusing to give direct answers, requiring students to show work) improved practice by 127% and mitigated the negative transfer effects. This is the strongest causal evidence that unguided AI access harms learning, while scaffolded Socratic design protects it.
  - Paper: https://www.pnas.org/doi/10.1073/pnas.2422633122
  - Pre-print: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4895486

- **Kestin, G., Miller, K., et al. (2025).** "AI Tutoring Outperforms Active Learning." *Scientific Reports* (Nature). Harvard University, Department of Physics. — In a randomized controlled trial, an AI tutor designed with scaffolding and Socratic questioning produced learning gains **more than double** those of active learning classrooms (median post-test 4.5 vs. 3.5). Students also reported higher engagement and motivation.
  - Paper: https://www.nature.com/articles/s41598-025-97652-6

- **Blasco, A. & Charisi, V. (2024).** "AI Chatbots in K-12 Education: Socratic vs. Non-Socratic Approaches." Harvard University / European Commission Joint Research Centre. — RCT with 122 students (ages 14-18). A Socratic GPT-4 tutor produced **no measurable learning gains** compared to a direct-help tutor. Demonstrates that naive Socratic questioning alone is insufficient — it must be combined with proper scaffolding and adaptive difficulty.
  - Paper: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5040921

- **Beale, R. (2025).** "Dialogic Pedagogy for Large Language Models." University of Birmingham, UK. — Synthesizes Vygotsky's Zone of Proximal Development, Socratic method, and Laurillard's Conversational Framework into practical LLM design recommendations. Recommends graduated assistance, tiered Socratic prompting, and fading scaffolds.
  - Paper: https://arxiv.org/html/2506.19484v1

- **Burns, M. (2026).** "What the Research Shows About Generative AI in Tutoring." Brookings Institution. — Review of 400+ articles. Concludes the most effective AI tutoring platforms "teach, not tell" with Socratic approaches, managing cognitive load through sequential, scaffolded content.
  - Article: https://www.brookings.edu/articles/what-the-research-shows-about-generative-ai-in-tutoring/

---

## 2. Checking Understanding: Formative Assessment Through Dialogue

The agent embeds comprehension checks throughout the conversation rather than relying solely on the end-of-module quiz. Techniques include:

- **Explain-back prompts** — asking the student to summarize a concept in their own words
- **Application questions** — asking the student to apply a concept to their own situation (e.g., "What transferable skills do you think you have from your training?")
- **Prediction prompts** — asking the student to predict an outcome before the agent reveals the answer
- **Retrieval practice** — periodically returning to earlier topics to reinforce retention

Each dialogue turn is treated as a formative assessment opportunity — the agent evaluates whether the student's responses indicate understanding before advancing.

### Supporting Evidence

- **Scarlatos, A., Baker, R.S., & Lan, A. (2024).** "Exploring Knowledge Tracing in Tutor-Student Dialogues." University of Massachusetts Amherst / University of Pennsylvania. Published at LAK '25. — Introduces a framework for estimating student knowledge from conversational turns. GPT-4o achieved 0.93/1.0 accuracy in evaluating student response correctness from dialogue. Demonstrates that every dialogue turn can serve as formative assessment.
  - Paper: https://arxiv.org/html/2409.16490v2

- **Bloom, B.S. (1984).** "The 2 Sigma Problem: The Search for Methods of Group Instruction as Effective as One-to-One Tutoring." *Educational Researcher*, 13(6), 4-16. University of Chicago. — The foundational study establishing that one-to-one tutoring with mastery learning produces a 2-standard-deviation improvement in student achievement. Key to the approach: students must demonstrate mastery (80-90% criterion) on formative assessments before proceeding.
  - Paper: https://journals.sagepub.com/doi/10.3102/0013189X013006004

- **Vanacore, K., Baker, R.S., Closser, A.H., & Roschelle, J. (2025).** "The Path to Conversational AI Tutors." Cornell University / University of Adelaide / University of Florida / Digital Promise. — Recommends conditioning LLM responses on knowledge tracing outputs and distinguishing between slips (student knows but erred — provide encouragement), non-mastery (use diagnostic questioning), and multiple misconceptions (provide worked examples).
  - Paper: https://arxiv.org/html/2602.19303v1

---

## 3. Quiz Readiness: Topic Coverage as Mastery Proxy

The quiz becomes available only after the agent determines that all lesson plan topics have been sufficiently covered.

### How It Works

Each module's markdown file contains clearly delineated topic sections. The agent uses these as a checklist:

1. The agent covers each topic through guided conversation
2. For each topic, the agent embeds comprehension checks (as described above)
3. Once all topics have been addressed and the student has responded satisfactorily, the agent transitions to quiz delivery

This is a simplified mastery model appropriate for the pilot phase. Full Bayesian Knowledge Tracing (as used in research-grade ITS) is out of scope but could be added in future iterations.

### Supporting Evidence

- **VanLehn, K. (2011).** "The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other Tutoring Systems." *Educational Psychologist*, 46(4), 197-221. Arizona State University. — Meta-analysis of ~50 studies. Step-based ITS that track mastery at the knowledge-component level produce effect sizes of d=0.76, nearly matching human tutoring (d=0.79). The system advances students to assessment when knowledge tracing indicates mastery across requisite knowledge components.
  - Paper: https://www.tandfonline.com/doi/abs/10.1080/00461520.2011.611369

---

## 4. Quiz Delivery: Conversational Format, Deterministic Evaluation

The quiz is delivered within the chat conversation (not as a separate UI component) to maintain engagement and continuity. However, questions are static (predefined per module) and evaluation is deterministic (handled by the service layer, not the LLM) to ensure reliability.

- 10 multiple-choice questions per module
- 70% pass threshold (placeholder — to be confirmed by TEVET)
- On pass: module marked completed, next module unlocked, module remains accessible in support mode
- On fail: module stays in instruction mode, student can retry

### Supporting Evidence

- **Ruan, S., Jiang, L., Xu, J., et al. (2019).** "QuizBot: A Dialogue-based Adaptive Learning System for Factual Knowledge." *Proceedings of CHI '19*, ACM. Stanford University. — Users of a conversational quiz format recalled **20% more correct answers** than flashcard users and spent **2.6x more time** learning. Students strongly preferred the conversational format for engagement.
  - Paper: https://dl.acm.org/doi/fullHtml/10.1145/3290605.3300587

---

## 5. Conversation Modes

### Instruction Mode (Default)

Active during the teaching phase. The agent:
- Follows the lesson plan structure
- Uses scaffolded Socratic techniques
- Tracks topic coverage
- Transitions to quiz when all topics are covered

### Support Mode (After Quiz Completion)

After a student passes the quiz, the module remains accessible. The agent:
- Answers follow-up questions about the module's topics
- References the module content as grounding
- Does not re-initiate the lesson plan or re-deliver the quiz

This design ensures students can revisit material for reinforcement, consistent with spaced retrieval practice principles.

---

## 6. TVET-Specific Context

The approach is informed by development-sector research on AI in technical and vocational education:

- **UNESCO-UNEVOC (2021).** "Understanding the Impact of Artificial Intelligence on Skills Development." — AI-powered tutoring can enhance TVET with individualized, on-demand support and real-time feedback. Notes that only 34% of TVET institutions globally have the bandwidth for advanced AI tools, and 78% of teachers lack confidence in using them.
  - Report: https://unevoc.unesco.org/pub/understanding_the_impact_of_ai_on_skills_development.pdf

- **World Bank (2024).** "Building Better Formal TVET Systems: Principles and Practice in Low- and Middle-Income Countries." Joint publication with ILO and UNESCO. — Addresses the need for TVET systems to adapt to technological progress, including AI integration for skills development.
  - Report: https://www.worldbank.org/en/topic/skillsdevelopment/publication/better-technical-vocational-education-training-TVET

- **World Bank (2024).** "AI Revolution in Education: What You Need to Know." Digital Innovations in Education Series (Latin America & Caribbean). — Documents AI-powered tutors as a key innovation for personalized learning in developing country education systems.
  - Report: https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099734306182493324

- **OECD (2025).** "How Can Innovative Technologies Transform Vocational Education and Training." — Documents how AI and adaptive learning platforms can engage VET learners with personalized support and align training outcomes with labor market needs.
  - Report: https://www.oecd.org/en/publications/2025/05/how-can-innovative-technologies-transform-vocational-education-and-training_5b10f8ac.html

- **UNESCO-UNEVOC (2025).** "European Insights: AI Integration in TVET — Policies, Practices and Pathways for Inclusive Innovation." — Documents AI integration practices across European TVET systems with policy pathways for inclusive innovation.
  - Report: https://atlas.unevoc.unesco.org/research-briefs/european-insights-ai-integration-in-tvet-policies-practices-and-pathways-for-inclusive-innovation

---

## Full References

| # | Authors | Year | Title | Institution | Link |
|---|---------|------|-------|-------------|------|
| 1 | Bastani, H. et al. | 2024 | Generative AI Can Harm Learning | Wharton / UPenn (PNAS) | [Link](https://www.pnas.org/doi/10.1073/pnas.2422633122) |
| 2 | Kestin, G. et al. | 2025 | AI Tutoring Outperforms Active Learning | Harvard (Nature Scientific Reports) | [Link](https://www.nature.com/articles/s41598-025-97652-6) |
| 3 | Blasco, A. & Charisi, V. | 2024 | AI Chatbots in K-12 Education: Socratic vs Non-Socratic | Harvard / EU JRC | [Link](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5040921) |
| 4 | Beale, R. | 2025 | Dialogic Pedagogy for LLMs | University of Birmingham | [Link](https://arxiv.org/html/2506.19484v1) |
| 5 | Burns, M. | 2026 | What the Research Shows About GenAI in Tutoring | Brookings Institution | [Link](https://www.brookings.edu/articles/what-the-research-shows-about-generative-ai-in-tutoring/) |
| 6 | Scarlatos, A. et al. | 2024 | Knowledge Tracing in Tutor-Student Dialogues | UMass / UPenn (LAK '25) | [Link](https://arxiv.org/html/2409.16490v2) |
| 7 | Bloom, B.S. | 1984 | The 2 Sigma Problem | University of Chicago | [Link](https://journals.sagepub.com/doi/10.3102/0013189X013006004) |
| 8 | VanLehn, K. | 2011 | Relative Effectiveness of ITS | Arizona State University | [Link](https://www.tandfonline.com/doi/abs/10.1080/00461520.2011.611369) |
| 9 | Vanacore, K. et al. | 2025 | The Path to Conversational AI Tutors | Cornell / U. Adelaide / Digital Promise | [Link](https://arxiv.org/html/2602.19303v1) |
| 10 | Ruan, S. et al. | 2019 | QuizBot: Dialogue-based Adaptive Learning | Stanford (CHI '19) | [Link](https://dl.acm.org/doi/fullHtml/10.1145/3290605.3300587) |
| 11 | UNESCO-UNEVOC | 2021 | Impact of AI on Skills Development | UNESCO | [Link](https://unevoc.unesco.org/pub/understanding_the_impact_of_ai_on_skills_development.pdf) |
| 12 | World Bank / ILO / UNESCO | 2024 | Building Better Formal TVET Systems | World Bank | [Link](https://www.worldbank.org/en/topic/skillsdevelopment/publication/better-technical-vocational-education-training-TVET) |
| 13 | World Bank | 2024 | AI Revolution in Education | World Bank | [Link](https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099734306182493324) |
| 14 | OECD | 2025 | Innovative Technologies in VET | OECD | [Link](https://www.oecd.org/en/publications/2025/05/how-can-innovative-technologies-transform-vocational-education-and-training_5b10f8ac.html) |
| 15 | UNESCO-UNEVOC | 2025 | AI Integration in TVET: European Insights | UNESCO | [Link](https://atlas.unevoc.unesco.org/research-briefs/european-insights-ai-integration-in-tvet-policies-practices-and-pathways-for-inclusive-innovation) |
