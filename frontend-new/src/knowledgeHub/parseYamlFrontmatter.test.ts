import { parseYamlFrontmatter } from "src/knowledgeHub/parseYamlFrontmatter";

describe("parseYamlFrontmatter", () => {
  describe("when content has valid frontmatter", () => {
    test("should parse title and description correctly", () => {
      // GIVEN markdown content with valid frontmatter
      const content = `---
title: Test Title
description: Test Description
---

# Markdown Content

Some body text here.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect the frontmatter to be parsed correctly
      expect(result.data.title).toBe("Test Title");
      expect(result.data.description).toBe("Test Description");
      expect(result.content).toBe("# Markdown Content\n\nSome body text here.");
    });

    test("should parse sector field correctly", () => {
      // GIVEN markdown content with sector in frontmatter
      const content = `---
title: Mining Career Pathway
description: Guide to mining careers
sector: mining
---

# Mining Sector`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect the sector to be parsed correctly
      expect(result.data.title).toBe("Mining Career Pathway");
      expect(result.data.description).toBe("Guide to mining careers");
      expect(result.data.sector).toBe("mining");
    });

    test("should handle double-quoted values", () => {
      // GIVEN markdown content with double-quoted values
      const content = `---
title: "Title with: colon"
description: "Description with special chars"
---

Content here.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect quotes to be stripped from values
      expect(result.data.title).toBe("Title with: colon");
      expect(result.data.description).toBe("Description with special chars");
    });

    test("should handle single-quoted values", () => {
      // GIVEN markdown content with single-quoted values
      const content = `---
title: 'Single Quoted Title'
description: 'Single Quoted Description'
---

Content here.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect quotes to be stripped from values
      expect(result.data.title).toBe("Single Quoted Title");
      expect(result.data.description).toBe("Single Quoted Description");
    });

    test("should handle values with colons in the content", () => {
      // GIVEN markdown content where values contain colons
      const content = `---
title: Career Guide: Mining Edition
description: A comprehensive guide to careers
---

Body content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect the full value including colon to be captured
      expect(result.data.title).toBe("Career Guide: Mining Edition");
    });

    test("should handle empty description", () => {
      // GIVEN markdown content with empty description
      const content = `---
title: Title Only
description:
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect empty string for description
      expect(result.data.title).toBe("Title Only");
      expect(result.data.description).toBe("");
    });

    test("should handle whitespace around values", () => {
      // GIVEN markdown content with extra whitespace
      const content = `---
title:    Spaced Title    
description:   Spaced Description   
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect whitespace to be trimmed
      expect(result.data.title).toBe("Spaced Title");
      expect(result.data.description).toBe("Spaced Description");
    });

    test("should handle multiline markdown content", () => {
      // GIVEN markdown content with multiple lines after frontmatter
      const content = `---
title: Test
description: Test desc
---

# Heading 1

Paragraph 1.

## Heading 2

Paragraph 2.

- List item 1
- List item 2`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect all markdown content to be preserved
      expect(result.content).toContain("# Heading 1");
      expect(result.content).toContain("## Heading 2");
      expect(result.content).toContain("- List item 1");
      expect(result.content).toContain("- List item 2");
    });

    test("should handle frontmatter with extra fields", () => {
      // GIVEN markdown content with additional custom fields
      const content = `---
title: Test Title
description: Test Description
sector: agriculture
author: John Doe
date: 2025-01-01
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect known fields to be parsed, unknown fields ignored
      expect(result.data.title).toBe("Test Title");
      expect(result.data.description).toBe("Test Description");
      expect(result.data.sector).toBe("agriculture");
    });
  });

  describe("when content has no frontmatter", () => {
    test("should return default values and original content", () => {
      // GIVEN markdown content without frontmatter
      const content = `# Just a Heading

Some content without frontmatter.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect default values
      expect(result.data.title).toBe("Untitled");
      expect(result.data.description).toBe("");
      expect(result.content).toBe(content);
    });

    test("should handle empty content", () => {
      // GIVEN empty content
      const content = "";

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect default values
      expect(result.data.title).toBe("Untitled");
      expect(result.data.description).toBe("");
      expect(result.content).toBe("");
    });

    test("should handle content with only dashes but not valid frontmatter", () => {
      // GIVEN content with dashes but not valid frontmatter format
      const content = `---
This is not valid frontmatter
Because there's no closing ---

Regular content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect default values and original content
      expect(result.data.title).toBe("Untitled");
      expect(result.data.description).toBe("");
      expect(result.content).toBe(content);
    });

    test("should handle content where frontmatter is not at the start", () => {
      // GIVEN content where frontmatter appears in the middle
      const content = `Some intro text

---
title: This should not be parsed
description: Because it's not at the start
---

More content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect default values since frontmatter must be at start
      expect(result.data.title).toBe("Untitled");
      expect(result.data.description).toBe("");
      expect(result.content).toBe(content);
    });
  });

  describe("when frontmatter has missing required fields", () => {
    test("should use default title when title is missing", () => {
      // GIVEN frontmatter without title
      const content = `---
description: Only description provided
sector: ict
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect default title
      expect(result.data.title).toBe("Untitled");
      expect(result.data.description).toBe("Only description provided");
      expect(result.data.sector).toBe("ict");
    });

    test("should use empty string when description is missing", () => {
      // GIVEN frontmatter without description
      const content = `---
title: Title Only Document
sector: construction
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect empty description
      expect(result.data.title).toBe("Title Only Document");
      expect(result.data.description).toBe("");
      expect(result.data.sector).toBe("construction");
    });

    test("should handle completely empty frontmatter", () => {
      // GIVEN empty frontmatter block
      const content = `---
---

Content after empty frontmatter.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect default values
      expect(result.data.title).toBe("Untitled");
      expect(result.data.description).toBe("");
      expect(result.data.sector).toBeUndefined();
    });
  });

  describe("when parsing actual pathway document format", () => {
    test("should correctly parse mining pathway frontmatter format", () => {
      // GIVEN content matching the actual mining-pathway.md format
      const content = `---
title: Mining Sector Career Pathway
description: Complete guide to TVET qualifications, career progression, and opportunities in Zambia's mining industry
sector: mining
---

# Mining Sector Career Pathway

Zambia's mining sector is the backbone of the national economy...`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect correct parsing
      expect(result.data.title).toBe("Mining Sector Career Pathway");
      expect(result.data.description).toBe(
        "Complete guide to TVET qualifications, career progression, and opportunities in Zambia's mining industry"
      );
      expect(result.data.sector).toBe("mining");
      expect(result.content).toContain("# Mining Sector Career Pathway");
    });

    test("should correctly parse hospitality pathway frontmatter format", () => {
      // GIVEN content matching the actual hospitality-pathway.md format
      const content = `---
title: Hospitality & Tourism Sector Career Pathway
description: Complete guide to TVET qualifications, career progression, and opportunities in Zambia's hospitality and tourism industry
sector: hospitality
---

# Hospitality & Tourism Sector Career Pathway`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect correct parsing including ampersand in title
      expect(result.data.title).toBe("Hospitality & Tourism Sector Career Pathway");
      expect(result.data.sector).toBe("hospitality");
    });
  });

  describe("edge cases", () => {
    test("should handle frontmatter with blank lines", () => {
      // GIVEN frontmatter with blank lines between fields
      const content = `---
title: Test Title

description: Test Description

sector: mining
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect fields to be parsed correctly (blank lines ignored)
      expect(result.data.title).toBe("Test Title");
      expect(result.data.description).toBe("Test Description");
      expect(result.data.sector).toBe("mining");
    });

    test("should handle content with code blocks containing dashes", () => {
      // GIVEN content with code blocks that have dashes
      const content = `---
title: Code Example
description: Shows code
---

# Example

\`\`\`
---
this: is not frontmatter
---
\`\`\``;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect only the actual frontmatter to be parsed
      expect(result.data.title).toBe("Code Example");
      expect(result.content).toContain("this: is not frontmatter");
    });

    test("should handle frontmatter with tabs instead of spaces", () => {
      // GIVEN frontmatter with tabs
      const content = `---
title:	Tab Title
description:	Tab Description
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect values to be trimmed correctly
      expect(result.data.title).toBe("Tab Title");
      expect(result.data.description).toBe("Tab Description");
    });

    test("should handle very long description values", () => {
      // GIVEN frontmatter with a very long description
      const longDescription =
        "This is a very long description that goes on and on with lots of details about the content of this document including TVET qualifications and career pathways.";
      const content = `---
title: Long Description Test
description: ${longDescription}
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect the full description to be captured
      expect(result.data.description).toBe(longDescription);
    });

    test("should handle sector field being undefined when not provided", () => {
      // GIVEN frontmatter without sector field
      const content = `---
title: No Sector Document
description: This document has no sector
---

Content.`;

      // WHEN parseYamlFrontmatter is called
      const result = parseYamlFrontmatter(content);

      // THEN expect sector to be undefined
      expect(result.data.title).toBe("No Sector Document");
      expect(result.data.description).toBe("This document has no sector");
      expect(result.data.sector).toBeUndefined();
    });
  });
});
