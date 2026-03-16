// Custom Jest transformer for raw-loader imports
// This handles imports like: import content from "!!raw-loader!./file.md"
const fs = require("fs");
const path = require("path");

module.exports = {
  process(sourceText, sourcePath, options) {
    // Extract the actual file path from the import
    // The sourcePath will be something like: /path/to/project/src/knowledgeHub/documents/mining.md

    // Read the file content
    const content = fs.readFileSync(sourcePath, "utf8");

    // Return as a module that exports the content as default
    return {
      code: `module.exports = ${JSON.stringify(content)};`,
    };
  },
};
