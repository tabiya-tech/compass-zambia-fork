"""
Tests for the career readiness module loader.
"""
from pathlib import Path

import pytest

from app.career_readiness.module_loader import (
    ModuleConfig,
    ModuleRegistry,
    _parse_frontmatter,
    _load_module_from_file,
)


class TestParseFrontmatter:
    """Tests for the frontmatter parser."""

    def test_parses_valid_frontmatter_and_body(self):
        # GIVEN a markdown string with valid frontmatter
        given_text = "---\nid: test-module\ntitle: Test Module\n---\n\n# Body Content\n\nSome text."

        # WHEN the frontmatter is parsed
        actual_metadata, actual_body = _parse_frontmatter(given_text)

        # THEN the metadata contains the parsed key-value pairs
        assert actual_metadata["id"] == "test-module"
        assert actual_metadata["title"] == "Test Module"
        # AND the body contains the markdown content
        assert "# Body Content" in actual_body
        assert "Some text." in actual_body

    def test_raises_when_missing_opening_delimiter(self):
        # GIVEN a markdown string without the opening --- delimiter
        given_text = "id: test-module\n---\n\nBody."

        # WHEN the frontmatter is parsed
        # THEN a ValueError is raised
        with pytest.raises(ValueError, match="must start with ---"):
            _parse_frontmatter(given_text)

    def test_raises_when_line_has_no_colon(self):
        # GIVEN a markdown string with an invalid frontmatter line (no colon)
        given_text = "---\nid: test-module\ninvalid line\n---\n\nBody."

        # WHEN the frontmatter is parsed
        # THEN a ValueError is raised
        with pytest.raises(ValueError, match="missing colon"):
            _parse_frontmatter(given_text)

    def test_handles_colons_in_values(self):
        # GIVEN a frontmatter value that contains a colon
        given_text = "---\ndescription: Learn to write: a guide\n---\n\nBody."

        # WHEN the frontmatter is parsed
        actual_metadata, _ = _parse_frontmatter(given_text)

        # THEN the value includes everything after the first colon
        assert actual_metadata["description"] == "Learn to write: a guide"


class TestLoadModuleFromFile:
    """Tests for loading a single module from a file."""

    def test_loads_valid_module_file(self, tmp_path):
        # GIVEN a valid module markdown file
        given_file = tmp_path / "test.md"
        given_file.write_text(
            "---\n"
            "id: test-module\n"
            "title: Test Module\n"
            "description: A test module.\n"
            "icon: test\n"
            "sort_order: 1\n"
            "input_placeholder: Ask something...\n"
            "---\n\n"
            "# Test Content\n\nBody text.",
            encoding="utf-8",
        )

        # WHEN the module is loaded
        actual_module = _load_module_from_file(given_file)

        # THEN the module has the correct metadata
        assert actual_module.id == "test-module"
        assert actual_module.title == "Test Module"
        assert actual_module.description == "A test module."
        assert actual_module.icon == "test"
        assert actual_module.sort_order == 1
        assert actual_module.input_placeholder == "Ask something..."
        # AND the content contains the markdown body
        assert "# Test Content" in actual_module.content
        assert "Body text." in actual_module.content

    def test_raises_when_required_field_missing(self, tmp_path):
        # GIVEN a module file missing the 'title' field
        given_file = tmp_path / "bad.md"
        given_file.write_text(
            "---\n"
            "id: bad-module\n"
            "description: Missing title.\n"
            "icon: test\n"
            "sort_order: 1\n"
            "input_placeholder: Ask...\n"
            "---\n\nBody.",
            encoding="utf-8",
        )

        # WHEN the module is loaded
        # THEN a KeyError is raised for the missing field
        with pytest.raises(KeyError):
            _load_module_from_file(given_file)


class TestModuleRegistry:
    """Tests for the module registry."""

    def test_loads_all_real_modules(self):
        # GIVEN the real modules directory
        # WHEN a registry is created with the default path
        actual_registry = ModuleRegistry()

        # THEN all 5 modules are loaded
        actual_modules = actual_registry.get_all_modules()
        assert len(actual_modules) == 5

    def test_modules_sorted_by_sort_order(self):
        # GIVEN the real modules directory
        actual_registry = ModuleRegistry()

        # WHEN all modules are retrieved
        actual_modules = actual_registry.get_all_modules()

        # THEN they are sorted by sort_order
        actual_orders = [m.sort_order for m in actual_modules]
        assert actual_orders == sorted(actual_orders)

    def test_get_module_returns_correct_module(self):
        # GIVEN the real modules directory
        actual_registry = ModuleRegistry()

        # WHEN a specific module is requested
        actual_module = actual_registry.get_module("cv-development")

        # THEN the correct module is returned
        assert actual_module is not None
        assert actual_module.id == "cv-development"
        assert actual_module.title == "CV Development"

    def test_get_module_returns_none_for_nonexistent(self):
        # GIVEN the real modules directory
        actual_registry = ModuleRegistry()

        # WHEN a nonexistent module is requested
        actual_module = actual_registry.get_module("nonexistent-module")

        # THEN None is returned
        assert actual_module is None

    def test_loads_from_custom_directory(self, tmp_path):
        # GIVEN a custom directory with two module files
        given_module_dir = tmp_path / "modules"
        given_module_dir.mkdir()

        for i, name in enumerate(["alpha", "beta"], start=1):
            (given_module_dir / f"{name}.md").write_text(
                f"---\n"
                f"id: {name}\n"
                f"title: Module {name.title()}\n"
                f"description: Description for {name}.\n"
                f"icon: {name}\n"
                f"sort_order: {i}\n"
                f"input_placeholder: Ask about {name}...\n"
                f"---\n\n"
                f"# {name.title()} Content",
                encoding="utf-8",
            )

        # WHEN a registry is created with the custom directory
        actual_registry = ModuleRegistry(modules_dir=given_module_dir)

        # THEN both modules are loaded
        assert len(actual_registry.get_all_modules()) == 2
        assert actual_registry.get_module("alpha") is not None
        assert actual_registry.get_module("beta") is not None

    def test_empty_directory_loads_no_modules(self, tmp_path):
        # GIVEN an empty directory
        given_empty_dir = tmp_path / "empty"
        given_empty_dir.mkdir()

        # WHEN a registry is created with the empty directory
        actual_registry = ModuleRegistry(modules_dir=given_empty_dir)

        # THEN no modules are loaded
        assert len(actual_registry.get_all_modules()) == 0

    def test_each_module_has_nonempty_content(self):
        # GIVEN the real modules directory
        actual_registry = ModuleRegistry()

        # WHEN all modules are retrieved
        actual_modules = actual_registry.get_all_modules()

        # THEN each module has non-empty content
        for module in actual_modules:
            assert len(module.content) > 0, f"Module {module.id} has empty content"

    def test_all_module_ids_are_unique(self):
        # GIVEN the real modules directory
        actual_registry = ModuleRegistry()

        # WHEN all modules are retrieved
        actual_modules = actual_registry.get_all_modules()

        # THEN all IDs are unique
        actual_ids = [m.id for m in actual_modules]
        assert len(actual_ids) == len(set(actual_ids))
