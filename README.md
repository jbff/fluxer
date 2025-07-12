# fluxer

A Python script that assists with playing **Fluxis**, a word puzzle game from [The Atlantic Games](https://www.theatlantic.com/games/). The word list used was obtained from [dolph/dictionary](https://raw.githubusercontent.com/dolph/dictionary/refs/heads/master/popular.txt).

This repository includes two tools:
- **`fluxer.py`**: The main script for finding individual word matches with various filters
- **`fluxer_solver.py`**: An automated solver that finds complete 3-word solution paths for Fluxis puzzles

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
- NLTK library (`pip install nltk`; for part of speech tagging)

Required NLTK data will be downloaded on first run.

## Individual Word Search (fluxer.py)

fluxer.py uses a word list to find matches based on overlapping patterns. For example, with prefix "PLAY" and suffix "TIME", it finds words like "PLAYTIME", "PLAYCRAFT", or even "YACHTIST", where:
- the beginning overlaps with the end (or all) of PLAY
- the ending overlaps with the start (or all) of TIME

Results are ranked by total overlap strength and displayed with color coding for easy reading.

Please note that the word list used probably contains words that the Fluxis game does not consider valid, so the matches output by this script are not guaranteed to be accepted by Fluxis.

In addition, the NLTK POS-tagger may not be perfect because it is tagging without sentence context. Words (e.g. "plant") that depending on usage may be a verb or a noun will only be tagged with a single part of speech, which may prevent some possible solutions from being found.

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
