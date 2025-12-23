"""CLI wrapper for importing YAML albums with confirmation prompt."""

import argparse
import logging
import subprocess
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
logger = logging.getLogger(__name__)


def show_confirmation_prompt(album_path: str) -> bool:
    """Show confirmation prompt reminding user to run agent review.

    Args:
        album_path: Path to album being imported

    Returns:
        bool: True if user confirms, False otherwise
    """
    print("\n" + "=" * 70)
    print("CEFR REVIEW REMINDER")
    print("=" * 70)
    print(f"\nYou're about to import: {album_path}")
    print("\nHave you reviewed this content with the CEFR agents?")
    print("\nRecommended review workflow:")
    print("  In GitHub Copilot Chat:")
    print(f"     @project-manager Review data/{album_path} for CEFR integrity.")
    print("\n  Or coordinate agents individually:")
    print(f"     @cefr-specialist Review data/{album_path} for level appropriateness.")
    print(f"     @german-teacher Check grammar accuracy in data/{album_path}.")
    print(f"     @native-speaker Assess naturalness in data/{album_path}.")
    print("\nFor detailed guidance, see: docs/CEFR-Review.md")
    print("\n" + "=" * 70)

    response = input("\nProceed with import? (y/n): ").strip().lower()
    return response in ("y", "yes")


def main():
    """Main entry point for import wrapper."""
    parser = argparse.ArgumentParser(
        description="Import YAML albums into Django database with CEFR review reminder",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_import.py --yaml b1/grammar/core
  python run_import.py --yaml b1/grammar/core --no-reminder
  python run_import.py --level B1
  python run_import.py --all

For more information, see: specs/001-enforce-cefr-qa/quickstart.md
        """,
    )

    parser.add_argument("--yaml", type=str, metavar="ALBUM_PATH", help='Album path to import (e.g., "b1/grammar/core")')
    parser.add_argument(
        "--level", type=str, metavar="LEVEL", help='Import all albums at specific CEFR level (e.g., "B1")'
    )
    parser.add_argument("--all", action="store_true", help="Import all albums found in data directory")
    parser.add_argument("--update", action="store_true", help="Update existing albums instead of skipping")
    parser.add_argument("--no-reminder", action="store_true", help="Skip confirmation prompt (for automated workflows)")

    args = parser.parse_args()

    # Build command for Django management command
    cmd = [sys.executable, "manage.py", "import_albums"]

    if args.yaml:
        cmd.append(args.yaml)
    elif args.level:
        cmd.extend(["--level", args.level])
    elif args.all:
        cmd.append("--all")
    else:
        parser.print_help()
        print("\nError: Must specify --yaml, --level, or --all")
        return 1

    if args.update:
        cmd.append("--update")
        logger.info("Update mode enabled (will overwrite existing albums)")

    # Show confirmation prompt (unless --no-reminder)
    if not args.no_reminder:
        album_desc = args.yaml or args.level or "all albums"
        logger.info(f"Preparing to import: {album_desc}")
        if not show_confirmation_prompt(album_desc):
            logger.info("Import cancelled by user")
            print("\nImport cancelled.")
            return 0

    # Run the import command
    logger.info(f"Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)

    if result.returncode == 0:
        logger.info("Import completed successfully")
    else:
        logger.error(f"Import failed with exit code {result.returncode}")

    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
