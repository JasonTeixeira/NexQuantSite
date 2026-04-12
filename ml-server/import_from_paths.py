"""
Import Databento files from DATABENTO_FILE_PATHS.txt
"""

import logging
import sys
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def import_from_paths_file():
    """Import files specified in DATABENTO_FILE_PATHS.txt"""

    print("=" * 70)
    print("📂 IMPORTING DATABENTO FILES")
    print("=" * 70)

    paths_file = Path("DATABENTO_FILE_PATHS.txt")

    if not paths_file.exists():
        print("❌ DATABENTO_FILE_PATHS.txt not found!")
        return False

    # Parse the file
    files_to_import = {}
    folder_path = None

    with open(paths_file) as f:
        for line in f:
            line = line.strip()

            # Skip comments and empty lines
            if not line or line.startswith("#"):
                continue

            # Parse key=value
            if "=" in line:
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip()

                if key == "FOLDER":
                    folder_path = Path(value)
                elif key in ["ES", "NQ", "YM", "RTY"]:
                    path = Path(value)
                    if path.exists():
                        files_to_import[key] = path
                        print(f"✅ Found {key}: {path.name}")
                    else:
                        print(f"⚠️  {key} file not found: {value}")

    # Check folder if specified
    if folder_path and folder_path.exists():
        print(f"\n📂 Checking folder: {folder_path}")

        for ext in ["*.csv", "*.parquet", "*.tsv"]:
            for file in folder_path.glob(ext):
                for symbol in ["ES", "NQ", "YM", "RTY"]:
                    if symbol in file.name.upper() and symbol not in files_to_import:
                        files_to_import[symbol] = file
                        print(f"✅ Found {symbol}: {file.name}")

    if not files_to_import:
        print("\n❌ No valid files found!")
        print("Please edit DATABENTO_FILE_PATHS.txt with your file paths")
        return False

    # Process files
    print(f"\n🔧 Processing {len(files_to_import)} files...")

    output_dir = Path("data/databento/imported")
    output_dir.mkdir(parents=True, exist_ok=True)

    all_data = []

    for symbol, file_path in files_to_import.items():
        print(f"\n📊 {symbol}: {file_path.name}")

        try:
            # Load file
            if file_path.suffix == ".parquet":
                df = pd.read_parquet(file_path)
            else:
                df = pd.read_csv(file_path)

            print(f"   Loaded {len(df):,} rows")

            # Add symbol
            df["symbol"] = symbol

            # Save
            output_file = output_dir / f"{symbol}_imported.parquet"
            df.to_parquet(output_file, index=False)

            print(f"   ✅ Saved to: {output_file}")

            all_data.append(df)

        except Exception as e:
            print(f"   ❌ Error: {e}")

    if all_data:
        # Combine all
        combined = pd.concat(all_data, ignore_index=True)
        master_file = output_dir / "all_symbols_combined.parquet"
        combined.to_parquet(master_file, index=False)

        print("\n" + "=" * 70)
        print("✅ IMPORT COMPLETE!")
        print("=" * 70)
        print(f"Total rows: {len(combined):,}")
        print(f"Symbols: {list(files_to_import.keys())}")
        print(f"Saved to: {output_dir}")

        print("\n🎯 Next: Run ML training:")
        print("   python ml-platform/train_final_models.py")

        return True

    return False


if __name__ == "__main__":
    success = import_from_paths_file()
    sys.exit(0 if success else 1)
