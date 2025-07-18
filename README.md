# fluxer

A Python script that assists with playing **Fluxis**, a word puzzle game from [The Atlantic Games](https://www.theatlantic.com/games/). The word list used was obtained from [dolph/dictionary](https://raw.githubusercontent.com/dolph/dictionary/refs/heads/master/popular.txt).

This repository includes several tools:
- **`fluxer.py`**: The main script for finding individual word matches with various filters
- **`fluxer_solver.py`**: An automated solver that finds complete 3-word solution paths for Fluxis puzzles
- **`create_pos_lists.py`**: Script to create pre-tagged part-of-speech word lists (requires NLTK)
- **`web/`**: Web application with the same functionality as the Python scripts
- **Pre-tagged word lists**: `nouns.txt`, `verbs.txt`, `adjectives.txt`, `adverbs.txt` (created by `create_pos_lists.py`)

The solver script uses `fluxer.py` internally and can automatically find multiple solutions when given a starting word and three rules. Solutions are ranked by total overlap strength (highest to lowest). You can also use `fluxer.py` separately to manually work through puzzles step by step.

## About Fluxis

Fluxis is a word puzzle game where players must find words that share overlapping letters with given prefix and suffix patterns. This tool helps by finding all possible words that match the specified criteria.

## Features

### fluxer.py Features
- Find words with overlapping prefix patterns
- Optionally find words with overlapping suffix patterns
- Filter results by:
  - Word length
  - Number of vowels
  - Number of consonants
  - Part of speech (noun, verb, adjective, adverb)
  - Presence of double letters
  - No repeated letters
  - Alternating vowel-consonant patterns
  - Letters in alphabetical order
- Results sorted by overlap strength
- Colorful terminal output with pagination

### fluxer_solver.py Features
- Find multiple complete 3-word solution paths for Fluxis puzzles
- Solutions ranked by total overlap strength (highest to lowest)
- Control how many solutions to find and display
- Support for all the same filters as fluxer.py
- Automatic cycle completion (last word connects back to starting word)

### Requirements

- Python 3.x
- NLTK library (`pip install nltk`) - **only needed to run `create_pos_lists.py` to regenerate the pre-tagged word lists**

**Note**: The main scripts (`fluxer.py` and `fluxer_solver.py`) do not require NLTK. They use pre-tagged word lists for part-of-speech filtering, which provides faster performance and more accurate results.

**Note**: The part of speech tagging is imperfect since it is tagging words with no semantic context. So words that can act as more than one part of speech are only getting categorized into one part of speech list.

## Pre-tagged Word Lists

The scripts use pre-tagged word lists for part-of-speech filtering:
- `nouns.txt` - Words that can function as nouns
- `verbs.txt` - Words that can function as verbs  
- `adjectives.txt` - Words that can function as adjectives
- `adverbs.txt` - Words that can function as adverbs

These files are created by running `create_pos_lists.py`, which uses NLTK to analyze each word in multiple contexts to capture words that can function as multiple parts of speech (e.g., "plant" as both noun and verb).

To regenerate these files (e.g., if you update `popular.txt`):
```bash
python create_pos_lists.py
```

**Note**: After regenerating the POS lists, you'll need to copy them to the `web/` directory for the web application to use them:
```bash
cp nouns.txt verbs.txt adjectives.txt adverbs.txt web/
```

## Individual Word Search (fluxer.py)

fluxer.py uses a word list to find matches based on overlapping patterns. For example, with prefix "PLAY" and suffix "TIME", it finds words like "PLAYTIME", "PLAYCRAFT", or even "YACHTIST", where:
- the beginning overlaps with the end (or all) of PLAY
- the ending overlaps with the start (or all) of TIME

Results are ranked by total overlap strength and displayed with color coding for easy reading.

Please note that the word list used probably contains words that the Fluxis game does not consider valid, so the matches output by this script are not guaranteed to be accepted by Fluxis.

The part-of-speech tagging uses pre-tagged word lists that were created using NLTK with multiple contexts to capture words that can function as multiple parts of speech (e.g., "plant" as both noun and verb). This provides more accurate and comprehensive part-of-speech filtering than single-context tagging.

### Usage

```bash
python fluxer.py PREFIX [SUFFIX] [OPTIONS]
```

### Options

- `--length, -l`: Specify exact word length
- `--vowels, -v`: Exact number of vowels required
- `--consonants, -c`: Exact number of consonants required
- `--pos, -p`: Part of speech (noun, verb, adjective, adverb)
- `--double-letters, -d`: Require double letters in the word
- `--no-repeats, -r`: Require no repeated letters in the word
- `--alternating, -a`: Require alternating vowel-consonant pattern
- `--alphabetical, -o`: Require letters to be in alphabetical order
- `--no-paging, -n`: Disable paged output (show all results at once)
- `--limit, -m`: Limit number of matches to display

### Example

**Find words starting with "play" and ending with "time":**
```bash
python fluxer.py "play" "time" --limit 5 --no-paging
```
```
Found 48 matches, displaying 5:
PLAYTIME (overlap: 8)
PLAYCRAFT (overlap: 5)
PLAYLET (overlap: 5)
PLAYSCRIPT (overlap: 5)
PLAYWRIGHT (overlap: 5)
```

## Solver Usage (fluxer_solver.py)

The solver automatically finds complete 3-word solution paths for Fluxis puzzles. It finds multiple solutions and ranks them by total overlap strength.

```bash
python fluxer_solver.py STARTING_WORD --rules RULE1,RULE2,RULE3 [OPTIONS]
```

### Solver Options

- `--rules, -r`: Comma-separated list of 3 rules (required)
- `--solutions, -s`: Maximum number of solutions to find (default: 5, use --all for all solutions)
- `--all, -a`: Find all possible solutions (overrides --solutions)
- `--print, -p`: Maximum number of solutions to print (default: print all found solutions)

### Available Rules

The solver supports all the same filters as fluxer.py:
- **Part of speech**: `noun`, `verb`, `adjective`/`adj`, `adverb`/`adv`
- **Length**: `N-letters` (e.g., `6-letters`, `5-letters`)
- **Vowels/Consonants**: `N-vowels`, `N-consonants` (e.g., `3-vowels`, `4-consonants`)
- **Patterns**: `double-letters`/`double`, `no-repeats`/`no-repeated`, `alternating`/`alt`, `alphabetical`/`alpha`

### Solver Examples

**1. Basic solver usage:**
```bash
python fluxer_solver.py PERHAPS --rules noun,6-letters,double-letters
```

**2. Find more solutions:**
```bash
python fluxer_solver.py START --rules verb,5-letters,no-repeats --solutions 10
```

**3. Find all solutions but only print top 5:**
```bash
python fluxer_solver.py WORD --rules noun,verb,adjective --all --print 5
```

**4. Complex rules:**
```bash
python fluxer_solver.py HELLO --rules adjective,alternating,alphabetical
```

**5. Length and pattern rules:**
```bash
python fluxer_solver.py TEST --rules 6-letters,double-letters,no-repeats
```

### Solver Output

The solver shows solutions in this format (example run requested 100 solutions, printing only top 5):
```
============================================================
FOUND 100 SOLUTIONS!
Showing top 5 solutions by overlap:
============================================================
 1. PERHAPS → HAPS → PSYCHO → CHOPPER (overlap: 12)
 2. PERHAPS → HAPS → PSYCHO → HOUSEKEEPER (overlap: 11)
 3. PERHAPS → HAPS → PSYCHO → HOPPER (overlap: 11)
 4. PERHAPS → HAPS → PSYCHE → CHEEP (overlap: 10)
 5. PERHAPS → HAPS → SADIST → STRIPPER (overlap: 10)

... and 95 more solutions
```

Solutions are ranked by total overlap strength, with the highest overlap solutions shown first.

## Web Application

A modern web interface is available in the `web/` directory that provides the same functionality as the Python scripts but with a beautiful, responsive user interface.

### Features
- **Preceding/Following Word Search**: Find words that overlap with given preceding and following words
- **Advanced Filtering**: All the same filters as the Python scripts
- **Real-time Results**: Instant search results with sorting by overlap
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Two Pages**: Single Word Finder and Puzzle Solver with form-based rule configuration

### Usage
1. Navigate to the `web/` directory
2. Start a local web server: `python3 -m http.server 8000`
3. Open your browser to `http://localhost:8000`
4. Use the navigation to switch between Single Word Finder and Puzzle Solver pages

For detailed web application documentation, see `web/README_WEB.md`.

## Complete File Structure

```
fluxer/
├── fluxer.py              # Main Python script (no NLTK needed)
├── fluxer_solver.py       # Solver script (no NLTK needed)
├── create_pos_lists.py    # POS tagging script (requires NLTK)
├── popular.txt            # Main word list
├── nouns.txt              # Pre-tagged nouns
├── verbs.txt              # Pre-tagged verbs
├── adjectives.txt         # Pre-tagged adjectives
├── adverbs.txt            # Pre-tagged adverbs
├── README.md              # Main documentation
├── .gitignore             # Git ignore file
└── web/                   # Web application
    ├── index.html         # Main HTML file
    ├── styles.css         # CSS styles
    ├── script.js          # JavaScript functionality
    ├── popular.txt        # Word list (copy)
    ├── nouns.txt          # Pre-tagged nouns (copy)
    ├── verbs.txt          # Pre-tagged verbs (copy)
    ├── adjectives.txt     # Pre-tagged adjectives (copy)
    ├── adverbs.txt        # Pre-tagged adverbs (copy)
    └── README_WEB.md      # Web app documentation
```
