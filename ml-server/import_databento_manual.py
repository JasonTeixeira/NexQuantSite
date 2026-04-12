"""
NEXURAL TRADING - MANUAL DATABENTO IMPORT
Specify exact file paths for your MBP-10 data
"""

import logging
import sys
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def import_databento_files():
    """Manually specify and import Databento files"""

    print("=" * 70)
    print("📂 DATABENTO MBP-10 DATA IMPORT")
    print("=" * 70)
    print("\nPlease provide the exact location of your Databento files.")
    print("\nExample paths:")
    print("  C:\\Users\\Jason\\Desktop\\ES_mbp10_data.csv")
    print("  D:\\TradingData\\NQ_2022_2024.parquet")
    print("  C:\\databento\\YM_orderbook.csv")
    print()

    files_to_import = {}

    # Ask for each symbol
    symbols = ["ES", "NQ", "YM", "RTY"]

    for symbol in symbols:
        print(f"\n📊 {symbol} Data:")
        print(f"Enter full path to {symbol} MBP-10 file (or press Enter to skip):")

        file_path = input("> ").strip()

        if file_path:
            # Remove quotes if present
            file_path = file_path.strip('"').strip("'")

            path = Path(file_path)
            if path.exists():
                size_mb = path.stat().st_size / (1024**2)
                print(f"✅ Found: {path.name} ({size_mb:.1f} MB)")
                files_to_import[symbol] = path
            else:
                print(f"❌ File not found: {file_path}")

    if not files_to_import:
        print("\n❌ No files specified!")

        # Alternative: batch import
        print("\n" + "=" * 70)
        print("📁 ALTERNATIVE: Batch Import")
        print("=" * 70)
        print("\nIf all files are in one folder, enter the folder path:")
        print("Example: C:\\Users\\Jason\\Desktop\\DatabentData")

        folder_path = input("> ").strip()

        if folder_path:
            folder_path = folder_path.strip('"').strip("'")
            folder = Path(folder_path)

            if folder.exists() and folder.is_dir():
                print(f"\n📂 Searching in: {folder}")

                # Find all data files
                for ext in ["*.csv", "*.parquet", "*.tsv", "*.json"]:
                    files = list(folder.glob(ext))

                    for file in files:
                        # Try to identify symbol
                        for symbol in symbols:
                            if symbol in file.name.upper():
                                if symbol not in files_to_import:
                                    size_mb = file.stat().st_size / (1024**2)
                                    print(f"   ✅ Found {symbol}: {file.name} ({size_mb:.1f} MB)")
                                    files_to_import[symbol] = file
                                break
            else:
                print(f"❌ Folder not found: {folder_path}")

    # Process found files
    if files_to_import:
        print("\n" + "=" * 70)
        print("🔧 PROCESSING FILES")
        print("=" * 70)

        processed_data = []

        for symbol, file_path in files_to_import.items():
            print(f"\n📊 Processing {symbol}: {file_path.name}")

            try:
                # Load data
                if file_path.suffix == ".parquet":
                    df = pd.read_parquet(file_path)
                elif file_path.suffix in [".csv", ".tsv"]:
                    # Try different separators
                    try:
                        df = pd.read_csv(file_path)
                    except Exception:
                        df = pd.read_csv(file_path, sep="\t")
                else:
                    print(f"   ⚠️  Unsupported format: {file_path.suffix}")
                    continue

                print(f"   Loaded {len(df):,} rows")

                # Add symbol
                df["symbol"] = symbol

                # Process timestamp
                ts_cols = ["ts_event", "timestamp", "time", "datetime"]
                for col in ts_cols:
                    if col in df.columns:
                        if df[col].dtype == "int64":
                            df["timestamp"] = pd.to_datetime(df[col], unit="ns")
                        else:
                            df["timestamp"] = pd.to_datetime(df[col])
                        break

                # Save processed file
                output_dir = Path("data/databento/processed")
                output_dir.mkdir(parents=True, exist_ok=True)

                output_file = output_dir / f"{symbol}_processed.parquet"
                df.to_parquet(output_file, index=False)

                print(f"   ✅ Saved to: {output_file}")

                processed_data.append({"symbol": symbol, "rows": len(df), "file": output_file})

            except Exception as e:
                print(f"   ❌ Error: {e}")

        # Summary
        if processed_data:
            print("\n" + "=" * 70)
            print("✅ IMPORT COMPLETE!")
            print("=" * 70)

            print("\n📊 Summary:")
            total_rows = 0
            for item in processed_data:
                print(f"   {item['symbol']}: {item['rows']:,} rows")
                total_rows += item["rows"]

            print(f"\n   Total: {total_rows:,} rows")
            print("   Saved to: data/databento/processed/")

            print("\n🎯 Next steps:")
            print("1. Run feature engineering:")
            print("   python ml-platform/create_databento_features.py")
            print("2. Train ML models:")
            print("   python ml-platform/train_databento_models.py")

            return True

    return False


def create_sample_paths_file():
    """Create a sample file with paths for easy editing"""

    sample_content = """# DATABENTO FILE PATHS
# Edit this file with your actual file paths
# Remove the # at the beginning of the line and update the path

# ES Data (E-mini S&P 500)
# ES=C:\\Users\\Jason\\Desktop\\ES_mbp10_2022_2024.csv

# NQ Data (E-mini Nasdaq)
# NQ=C:\\Users\\Jason\\Desktop\\NQ_mbp10_2022_2024.csv

# YM Data (E-mini Dow)
# YM=C:\\Users\\Jason\\Desktop\\YM_mbp10_2022_2024.csv

# RTY Data (E-mini Russell)
# RTY=C:\\Users\\Jason\\Desktop\\RTY_mbp10_2022_2024.csv

# Or specify a folder containing all files:
# FOLDER=C:\\Users\\Jason\\Desktop\\DatabentData
"""

    with open("databento_paths.txt", "w") as f:
        f.write(sample_content)

    print("\n📝 Created databento_paths.txt")
    print("Edit this file with your actual file paths, then run:")
    print("   python ml-platform/import_from_paths_file.py")


if __name__ == "__main__":
    success = import_databento_files()

    if not success:
        print("\n" + "=" * 70)
        print("📝 ALTERNATIVE OPTION")
        print("=" * 70)
        create_sample_paths_file()

        print("\nOr tell me:")
        print("1. The exact folder where your files are stored")
        print("2. Example of one filename")
        print("3. The file format (.csv, .parquet, etc.)")
        print("\nI'll create a custom import script for your setup!")

    sys.exit(0 if success else 1)
