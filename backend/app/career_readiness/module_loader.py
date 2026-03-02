"""
This module loads career readiness module definitions from markdown files with frontmatter.
"""
import logging
from pathlib import Path

from pydantic import BaseModel

logger = logging.getLogger(__name__)

_MODULES_DIR = Path(__file__).parent / "modules"


class ModuleConfig(BaseModel):
    """
    Represents a career readiness module definition loaded from a markdown file.
    """

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

    class Config:
        extra = "forbid"


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


def _load_module_from_file(file_path: Path) -> ModuleConfig:
    """
    Load a single module configuration from a markdown file.
    """
    text = file_path.read_text(encoding="utf-8")
    metadata, body = _parse_frontmatter(text)

    return ModuleConfig(
        id=metadata["id"],
        title=metadata["title"],
        description=metadata["description"],
        icon=metadata["icon"],
        sort_order=int(metadata["sort_order"]),
        input_placeholder=metadata["input_placeholder"],
        content=body,
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
