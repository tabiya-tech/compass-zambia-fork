import type { Meta, StoryObj } from "@storybook/react";
import MarkdownReader from "./MarkdownReader";
import { Box } from "@mui/material";

const meta: Meta<typeof MarkdownReader> = {
  title: "KnowledgeHub/Components/MarkdownReader",
  component: MarkdownReader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Box
        sx={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: 3,
          backgroundColor: "background.paper",
          borderRadius: 2,
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof MarkdownReader>;

// Basic Examples
export const SimpleText: Story = {
  args: {
    content: "This is a simple paragraph of text.",
  },
};

export const Headings: Story = {
  args: {
    content: `# Heading 1
## Heading 2
### Heading 3

This is a paragraph under heading 3.`,
  },
};

export const Paragraphs: Story = {
  args: {
    content: `This is the first paragraph with some text content.

This is the second paragraph, separated by a blank line.

This is the third paragraph with more content to demonstrate spacing.`,
  },
};

// List Examples
export const UnorderedList: Story = {
  args: {
    content: `# Shopping List

- Milk
- Bread
- Eggs
- Butter
- Cheese`,
  },
};

export const OrderedList: Story = {
  args: {
    content: `# Steps to Success

1. Set clear goals
2. Create a plan
3. Take action
4. Monitor progress
5. Adjust as needed`,
  },
};

export const NestedLists: Story = {
  args: {
    content: `# Career Path

- Agriculture Sector
  - Farm Management
  - Agricultural Technology
  - Crop Science
- Mining Sector
  - Mining Engineering
  - Geology
  - Safety Management
- ICT Sector
  - Software Development
  - Network Administration
  - Database Management`,
  },
};

// Text Formatting
export const TextFormatting: Story = {
  args: {
    content: `# Text Formatting Examples

This is **bold text** and this is *italic text*.

You can also combine them: ***bold and italic***.

This is ~~strikethrough text~~.

This is regular text with a \`code snippet\` inline.`,
  },
};

export const Blockquote: Story = {
  args: {
    content: `# Important Quote

> This is a blockquote. It can be used to highlight important information or quotes from people. It stands out from regular paragraphs with special styling.

This is a regular paragraph after the blockquote.`,
  },
};

// Code Examples
export const InlineCode: Story = {
  args: {
    content: `# Code Examples

To use the \`console.log()\` function in JavaScript, simply write the code in your editor.

You can also use variables like \`userName\` or \`totalAmount\` in your code.`,
  },
};

export const CodeBlock: Story = {
  args: {
    content: `# Code Block Example

Here's a JavaScript function:

\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));
\`\`\`

And here's a Python example:

\`\`\`python
def calculate_sum(a, b):
    return a + b

result = calculate_sum(5, 3)
print(result)
\`\`\``,
  },
};

// Link Examples
export const Links: Story = {
  args: {
    content: `# Useful Links

Check out [Google](https://www.google.com) for searching.

Visit [GitHub](https://github.com) for code repositories.

Learn more about [Markdown](https://www.markdownguide.org) formatting.`,
  },
};

// Table Examples
export const SimpleTable: Story = {
  args: {
    content: `# Salary Information

| Job Role | Experience Level | Monthly Salary (ZMW) |
|----------|-----------------|---------------------|
| Software Developer | Entry | 5,000 - 8,000 |
| Software Developer | Mid-level | 8,000 - 15,000 |
| Software Developer | Senior | 15,000 - 25,000 |`,
  },
};

export const ComplexTable: Story = {
  args: {
    content: `# Mining Sector Opportunities

| Sector | Role | Qualifications | Average Salary | Growth Rate |
|--------|------|----------------|----------------|-------------|
| Mining | Mining Engineer | Bachelor's Degree | ZMW 18,000 | 15% |
| Mining | Geologist | Master's Degree | ZMW 22,000 | 12% |
| Mining | Safety Officer | Diploma + Cert | ZMW 12,000 | 10% |
| Agriculture | Farm Manager | Bachelor's Degree | ZMW 14,000 | 8% |
| ICT | Software Developer | Bachelor's Degree | ZMW 16,000 | 20% |`,
  },
};

// Horizontal Rule
export const HorizontalRule: Story = {
  args: {
    content: `# Section 1

This is content in section 1.

---

# Section 2

This is content in section 2, separated by a horizontal rule.

---

# Section 3

This is content in section 3.`,
  },
};

// Mixed Content Examples
export const ComprehensiveDocument: Story = {
  args: {
    content: `# Mining Sector Career Pathway

## Overview

The mining sector in Zambia is one of the country's priority sectors for TEVET graduates. This profile gives you an overview of what the industry looks like, what roles exist, and what you can expect to earn.

## Key Opportunities

### Entry-Level Positions

1. **Mining Technician**
   - Salary Range: ZMW 4,000 - 6,000
   - Requirements: TEVET Diploma
   - Growth Potential: High

2. **Safety Assistant**
   - Salary Range: ZMW 3,500 - 5,500
   - Requirements: Safety Certificate
   - Growth Potential: Medium

### Mid-Level Positions

- Mining Supervisor
- Quality Control Specialist
- Equipment Operator

> **Important Note**: All positions require valid safety certifications and regular training updates.

## Qualification Pathways

| Level | Qualification | Duration | Cost |
|-------|--------------|----------|------|
| Certificate | Mining Safety | 3 months | ZMW 1,500 |
| Diploma | Mining Technology | 2 years | ZMW 8,000 |
| Degree | Mining Engineering | 4 years | ZMW 25,000 |

## Skills Required

The most sought-after skills in the mining sector include:

- Technical knowledge of \`mining equipment\` and \`safety procedures\`
- **Problem-solving** abilities
- *Communication* skills for team coordination
- Physical fitness and stamina

---

## Next Steps

To explore opportunities in the mining sector:

1. Complete your TEVET qualification
2. Obtain necessary safety certifications
3. Gain practical experience through internships
4. Network with industry professionals

For more information, visit [Ministry of Mines](https://www.mines.gov.zm).`,
  },
};

// Edge Cases
export const EmptyContent: Story = {
  args: {
    content: "",
  },
};

export const OnlyWhitespace: Story = {
  args: {
    content: "   \n\n   \n   ",
  },
};

export const VeryLongParagraph: Story = {
  args: {
    content: `# Long Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`,
  },
};

export const VeryLongWord: Story = {
  args: {
    content: `# Long Word Test

This paragraph contains a very long word: supercalifragilisticexpialidociousthisisaverylongwordthatshouldbreakorwrapproperlysupercalifragilisticexpialidocious

The word above should wrap or break properly to fit the container.`,
  },
};

export const ManyHeadings: Story = {
  args: {
    content: `# Main Title
## Subtitle 1
### Sub-subtitle 1
## Subtitle 2
### Sub-subtitle 2
### Sub-subtitle 3
## Subtitle 3
# Another Main Title
## Another Subtitle`,
  },
};

export const SpecialCharacters: Story = {
  args: {
    content: `# Special Characters

This text contains special characters: & < > " ' / \\

Math symbols: + - × ÷ = ≠ ≈ ∞

Currency: $ £ € ¥ ₹ ZMW

Punctuation: ! @ # % ^ * ( ) _ - + = { } [ ] | : ; " ' < > , . ? /`,
  },
};

export const MixedLanguages: Story = {
  args: {
    content: `# Multi-Language Content

**English**: Welcome to the Knowledge Hub

**Chichewa**: Takulandirani ku Malo Ophunzirira

**Swahili**: Karibu kwenye Kituo cha Maarifa

**Español**: Bienvenido al Centro de conocimiento`,
  },
};

export const URLsAndEmails: Story = {
  args: {
    content: `# Contact Information

Website: https://www.example.com

Email: contact@example.com

Another URL: www.zambia-education.org

Plain email: info@tabiya.org`,
  },
};

export const DeepNesting: Story = {
  args: {
    content: `# Career Sectors

- Agriculture
  - Crop Production
    - Maize Farming
    - Wheat Farming
  - Livestock
    - Dairy Farming
    - Poultry
      - Broiler Production
      - Layer Production
- Mining
  - Copper Mining
  - Cobalt Mining
- ICT
  - Software Development
    - Frontend
    - Backend
    - Mobile`,
  },
};

export const MultipleCodeBlocks: Story = {
  args: {
    content: `# Programming Examples

## JavaScript

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

## Python

\`\`\`python
greeting = "Hello World"
print(greeting)
\`\`\`

## Java

\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
\`\`\``,
  },
};

export const MultipleBlockquotes: Story = {
  args: {
    content: `# Important Information

> First important note about career development.

Some regular text in between.

> Second important note about skill building.

More regular text.

> Third important note about networking.`,
  },
};

export const ComplexFormatting: Story = {
  args: {
    content: `# Complex Formatting

This paragraph has **bold text with *italic inside* and \`code\`** formatting.

This has *italic with **bold inside** and \`code\`* formatting.

This has \`code with **bold** and *italic*\` inside.

This has [a link with **bold** and *italic* text](https://example.com).`,
  },
};

export const LongTableWithManyColumns: Story = {
  args: {
    content: `# Detailed Comparison

| Sector | Role | Qual | Salary | Growth | Location | Duration | Benefits |
|--------|------|------|--------|--------|----------|----------|----------|
| Mining | Engineer | BSc | 18000 | High | Copperbelt | 2 years | Medical, Housing |
| Agriculture | Manager | Diploma | 12000 | Medium | Central | 1 year | Medical |
| ICT | Developer | BSc | 16000 | Very High | Lusaka | 3 years | Medical, Remote |
| Construction | Supervisor | Certificate | 10000 | Low | Nationwide | 6 months | Medical |`,
  },
};

export const RealWorldExample: Story = {
  args: {
    content: `# Agriculture Sector Career Pathway

This guide provides an overview of career opportunities in Zambia's agriculture sector for TEVET graduates.

## Introduction

Agriculture is one of Zambia's largest employers and a priority sector for economic development. The sector offers diverse opportunities ranging from crop production to agribusiness management.

## Key Career Paths

### Crop Production

**Opportunities:**
- Farm Manager
- Agricultural Technician
- Irrigation Specialist

**Salary Range:** ZMW 5,000 - 15,000 per month

**Required Skills:**
- Knowledge of \`modern farming techniques\`
- **Soil management** expertise
- *Pest control* understanding

### Livestock Management

> Livestock farming is experiencing significant growth in Zambia, with increasing demand for dairy and poultry products.

**Opportunities:**
1. Dairy Farm Manager
2. Poultry Production Specialist
3. Veterinary Assistant

### Agribusiness

Key roles in agribusiness include:

- Supply Chain Manager
- Agricultural Marketing Officer
- Farm Business Consultant

## Qualification Requirements

| Position | Minimum Qualification | Experience | Certifications |
|----------|---------------------|------------|----------------|
| Farm Manager | Diploma in Agriculture | 2+ years | Farm Management |
| Ag. Technician | Certificate | 1+ year | None |
| Veterinary Assistant | Diploma | 1+ year | Animal Health |

---

## Getting Started

To begin your career in agriculture:

1. Complete a relevant TEVET program
2. Gain practical experience through internships
3. Join agricultural associations
4. Stay updated with modern farming techniques

**Contact Information:**
- Ministry of Agriculture: info@agriculture.gov.zm
- TEVET Authority: www.tevet.gov.zm

For more resources, visit [Zambia Agriculture Portal](https://agriculture.gov.zm).`,
  },
};

// Stress Tests
export const VeryLongDocument: Story = {
  args: {
    content: `# Comprehensive Career Guide for Zambian TEVET Graduates

${Array(10)
  .fill(null)
  .map(
    (_, i) => `
## Section ${i + 1}

This is section ${i + 1} with detailed information about career pathways.

### Subsection ${i + 1}.1

- Point 1 in subsection ${i + 1}.1
- Point 2 in subsection ${i + 1}.1
- Point 3 in subsection ${i + 1}.1

### Subsection ${i + 1}.2

Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is detailed content for subsection ${i + 1}.2.

| Column A | Column B | Column C |
|----------|----------|----------|
| Data ${i + 1}.1 | Data ${i + 1}.2 | Data ${i + 1}.3 |

---
`
  )
  .join("\n")}`,
  },
};

export const ManyLists: Story = {
  args: {
    content: `# Many Lists Example

${Array(20)
  .fill(null)
  .map(
    (_, i) => `
### List ${i + 1}

- Item ${i + 1}.1
- Item ${i + 1}.2
- Item ${i + 1}.3
`
  )
  .join("\n")}`,
  },
};
