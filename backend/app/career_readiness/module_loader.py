"""
This module loads career readiness module definitions from markdown files with frontmatter.
"""
import logging
import re
from pathlib import Path

from pydantic import BaseModel, ConfigDict

logger = logging.getLogger(__name__)

_MODULES_DIR = Path(__file__).parent / "modules"


class QuizQuestion(BaseModel):
    """A single multiple-choice quiz question."""

    model_config = ConfigDict(extra="forbid")

    question: str
    """The question text"""

    options: list[str]
    """The answer options, e.g. ["A. Resume", "B. Letter", "C. Form", "D. Report"]"""

    correct_answer: str
    """The correct answer letter, e.g. "A" """


class QuizConfig(BaseModel):
    """Configuration for a module's quiz section."""

    model_config = ConfigDict(extra="forbid")

    pass_threshold: float = 0.7
    """Fraction of correct answers required to pass (0.0–1.0)"""

    questions: list[QuizQuestion]
    """The list of quiz questions"""


class ModuleConfig(BaseModel):
    """
    Represents a career readiness module definition loaded from a markdown file.
    """

    model_config = ConfigDict(extra="forbid")

    id: str
    """The unique identifier (slug) of the module"""

    title: str
    """The display title of the module"""

    description: str
    """A short description of what the module covers"""

    icon: str
    """Icon identifier for the module"""

    sort_order: int
    """Display order of the module in the list"""

    input_placeholder: str
    """Placeholder text shown in the chat input for this module"""

    content: str
    """The markdown body content used as grounding for the agent"""

    topics: list[str]
    """The list of topics the agent must cover before the quiz becomes available"""

    quiz: QuizConfig | None = None
    """The quiz configuration, parsed from the ## Quiz section. None if no quiz."""


def _parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    """
    Parse a markdown file with ---delimited frontmatter.
    Returns a tuple of (frontmatter dict, markdown body).
    """
    if not text.startswith("---"):
        raise ValueError("Markdown file must start with --- frontmatter delimiter")

    # Find the closing --- delimiter
    end_index = text.index("---", 3)
    frontmatter_text = text[3:end_index].strip()
    body = text[end_index + 3:].strip()

    # Parse key: value pairs
    metadata = {}
    for line in frontmatter_text.splitlines():
        line = line.strip()
        if not line:
            continue
        if ":" not in line:
            raise ValueError(f"Invalid frontmatter line (missing colon): {line}")
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip()

    return metadata, body


def _split_quiz_section(body: str) -> tuple[str, str | None]:
    """
    Split the markdown body on the '## Quiz' heading.
    Returns (content_before_quiz, quiz_section_text_or_none).
    """
    # Match ## Quiz at the start of a line (with optional trailing whitespace)
    pattern = r"(?m)^## Quiz\s*$"
    match = re.search(pattern, body)
    if match is None:
        return body, None

    content = body[:match.start()].rstrip()
    quiz_text = body[match.end():].strip()
    return content, quiz_text


def _parse_quiz_section(text: str) -> QuizConfig:
    """
    Parse a quiz section into a QuizConfig.

    Expected format:
        pass_threshold: 0.7       (optional, defaults to 0.7)

        1. Question text here?
        A. Option A text
        B. Option B text
        C. Option C text
        D. Option D text
        Answer: B

        2. Another question?
        ...
    """
    lines = text.strip().splitlines()

    # Parse optional pass_threshold from the first non-empty line
    pass_threshold = 0.7
    start_index = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("pass_threshold:"):
            try:
                pass_threshold = float(stripped.split(":", 1)[1].strip())
            except ValueError as e:
                raise ValueError(f"Invalid pass_threshold value: {stripped}") from e
            start_index = i + 1
            break
        # First non-empty line is not pass_threshold — start parsing questions from here
        start_index = i
        break

    # Parse questions
    questions: list[QuizQuestion] = []
    current_question: str | None = None
    current_options: list[str] = []
    current_answer: str | None = None

    question_pattern = re.compile(r"^\d+\.\s+(.+)")
    option_pattern = re.compile(r"^([A-D])\.\s+(.+)")
    answer_pattern = re.compile(r"^Answer:\s+([A-Da-d])")

    for line in lines[start_index:]:
        stripped = line.strip()
        if not stripped:
            continue

        question_match = question_pattern.match(stripped)
        option_match = option_pattern.match(stripped)
        answer_match = answer_pattern.match(stripped)

        if question_match:
            # Save previous question if exists
            if current_question is not None:
                if current_answer is None:
                    raise ValueError(f"Quiz question missing Answer: '{current_question}'")
                questions.append(QuizQuestion(
                    question=current_question,
                    options=current_options,
                    correct_answer=current_answer,
                ))
            current_question = question_match.group(1)
            current_options = []
            current_answer = None
        elif option_match:
            current_options.append(f"{option_match.group(1)}. {option_match.group(2)}")
        elif answer_match:
            current_answer = answer_match.group(1).upper()

    # Save the last question
    if current_question is not None:
        if current_answer is None:
            raise ValueError(f"Quiz question missing Answer: '{current_question}'")
        questions.append(QuizQuestion(
            question=current_question,
            options=current_options,
            correct_answer=current_answer,
        ))

    if not questions:
        raise ValueError("Quiz section contains no questions")

    return QuizConfig(pass_threshold=pass_threshold, questions=questions)


def _load_module_from_file(file_path: Path) -> ModuleConfig:
    """
    Load a single module configuration from a markdown file.
    """
    text = file_path.read_text(encoding="utf-8")
    metadata, body = _parse_frontmatter(text)

    # Parse topics from comma-separated frontmatter value
    topics_raw = metadata.get("topics", "")
    topics = [t.strip() for t in topics_raw.split(",") if t.strip()] if topics_raw else []

    # Split quiz section from content
    content, quiz_text = _split_quiz_section(body)

    # Parse quiz if present
    quiz = _parse_quiz_section(quiz_text) if quiz_text is not None else None

    return ModuleConfig(
        id=metadata["id"],
        title=metadata["title"],
        description=metadata["description"],
        icon=metadata["icon"],
        sort_order=int(metadata["sort_order"]),
        input_placeholder=metadata["input_placeholder"],
        content=content,
        topics=topics,
        quiz=quiz,
    )


class ModuleRegistry:
    """
    Registry of all available career readiness modules.
    Loads modules from markdown files in the modules directory.
    """

    def __init__(self, modules_dir: Path = _MODULES_DIR):
        self._modules: dict[str, ModuleConfig] = {}
        self._load_modules(modules_dir)

    def _load_modules(self, modules_dir: Path) -> None:
        """
        Load all markdown files from the modules directory.
        """
        if not modules_dir.exists():
            logger.warning("Modules directory does not exist: %s", modules_dir)
            return

        for file_path in sorted(modules_dir.glob("*.md")):
            if file_path.name.startswith("_") or file_path.name == "README.md":
                continue
            try:
                module = _load_module_from_file(file_path)
                self._modules[module.id] = module
                logger.info("Loaded career readiness module: %s", module.id)
            except Exception as e:
                logger.error("Failed to load module from %s: %s", file_path, e)
                raise

    def get_all_modules(self) -> list[ModuleConfig]:
        """
        Get all modules sorted by sort_order.
        """
        return sorted(self._modules.values(), key=lambda m: m.sort_order)

    def get_module(self, module_id: str) -> ModuleConfig | None:
        """
        Get a specific module by its ID. Returns None if not found.
        """
        return self._modules.get(module_id)


# Module-level singleton
_registry: ModuleRegistry | None = None


def get_module_registry() -> ModuleRegistry:
    """
    Get the singleton module registry instance.
    """
    global _registry
    if _registry is None:
        _registry = ModuleRegistry()
    return _registry
