# fluxer

A Python script that assists with playing **Fluxis**, a word puzzle game from [The Atlantic Games](https://www.theatlantic.com/games/). The word list used was obtained from [dolph/dictionary](https://raw.githubusercontent.com/dolph/dictionary/refs/heads/master/popular.txt).

This repository includes two tools:
- **`fluxer.py`**: The main script for finding individual word matches with various filters
- **`fluxer_solver.py`**: An automated solver that finds complete 3-word solution paths for Fluxis puzzles

The solver script uses `fluxer.py` internally and can automatically find multiple solutions when given a starting word and three rules. Solutions are ranked by total overlap strength (highest to lowest). You can also use `fluxer.py` separately to manually work through puzzles step by step.

**Example solver usage:**
```bash
python fluxer_solver.py PERHAPS --rules noun,6-letters,double-letters
```

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

## How It Works

The script uses NLTK's words corpus to find matches based on overlapping patterns. For example, with prefix "PLAY" and suffix "TIME", it finds words like "PLAYTIME", "PLAYCRAFT", or even "YACHTIST", where:
- the beginning overlaps with the end (or all) of PLAY
- the ending overlaps with the start (or all) of TIME

The overlap strength calculation works as follows:
- **Prefix overlap**: Finds the longest suffix of the prefix that matches the start of the word
- **Suffix overlap**: Finds the longest prefix of the suffix that matches the end of the word

Results are ranked by total overlap strength and displayed with color coding for easy reading.

Please note that the NLTK corpus used contains words that the Fluxis game does not consider valid, so the matches output by this script are not guaranteed to be accepted by Fluxis.

## Requirements

- Python 3.x
- NLTK library (`pip install nltk`)

The script will automatically download required NLTK data (words corpus and POS tagger) on first run.

## Usage

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

### Examples

**1. Only prefix (find words starting with "play"):**
```bash
python fluxer.py "play" --limit 5 --no-paging
```
```
Found 770 matches, displaying 5:
PLAY (overlap: 4)
PLAYA (overlap: 4)
PLAYABILITY (overlap: 4)
PLAYABLE (overlap: 4)
PLAYBACK (overlap: 4)
```

**2. Prefix and suffix (find words with "play" prefix and "time" suffix):**
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

**3. Length option (6-letter words starting with "work"):**
```bash
python fluxer.py "work" --length 6 --limit 5 --no-paging
```
```
Found 364 matches, displaying 5:
WORKED (overlap: 4)
WORKER (overlap: 4)
ORKHON (overlap: 3)
KABAKA (overlap: 1)
KABARD (overlap: 1)
```

**4. Vowels option (words with exactly 3 vowels starting with "book"):**
```bash
python fluxer.py "book" --vowels 3 --limit 5 --no-paging
```
```
Found 678 matches, displaying 5:
BOOKCRAFT (overlap: 4)
BOOKDOM (overlap: 4)
BOOKED (overlap: 4)
BOOKER (overlap: 4)
BOOKERY (overlap: 4)
```

**5. Consonants option (words with exactly 4 consonants starting with "star"):**
```bash
python fluxer.py "star" --consonants 4 --limit 5 --no-paging
```
```
Found 2212 matches, displaying 5:
STARER (overlap: 4)
STARK (overlap: 4)
STARN (overlap: 4)
STARNIE (overlap: 4)
START (overlap: 4)
```

**6. POS option (nouns only starting with "home"):**
```bash
python fluxer.py "home" --pos noun --limit 5 --no-paging
```
```
Found 8778 matches, displaying 5:
HOME (overlap: 4)
HOMEBODY (overlap: 4)
HOMEBORN (overlap: 4)
HOMEBOUND (overlap: 4)
HOMECOMER (overlap: 4)
```

**7. Double letters option (words with double letters starting with "ball"):**
```bash
python fluxer.py "ball" --double-letters --limit 5 --no-paging
```
```
Found 1503 matches, displaying 5:
BALL (overlap: 4)
BALLAD (overlap: 4)
BALLADE (overlap: 4)
BALLADEER (overlap: 4)
BALLADER (overlap: 4)
```

**8. Multiple options (7-letter nouns with 2 vowels starting with "house"):**
```bash
python fluxer.py "house" --length 7 --vowels 2 --pos noun --limit 5 --no-paging
```
```
Found 128 matches, displaying 5:
SEBUNDY (overlap: 2)
SECANCY (overlap: 2)
SECRECY (overlap: 2)
SECTISM (overlap: 2)
SECTIST (overlap: 2)
```

**9. Alternating pattern option (words with alternating vowel-consonant pattern starting with "st"):**
```bash
python fluxer.py "st" --alternating --limit 5 --no-paging
```
```
Found 858 matches, displaying 5:
TITANOSILICATE (overlap: 1)
TUBULORACEMOSE (overlap: 1)
TALONAVICULAR (overlap: 1)
TELEBAROMETER (overlap: 1)
TELEMANOMETER (overlap: 1)
```

**10. Many results (common prefix "the" showing total match count):**
```bash
python fluxer.py "the" --limit 10 --no-paging
```
```
Found 12078 matches, displaying 10:
THE (overlap: 3)
THEA (overlap: 3)
THEACEAE (overlap: 3)
THEACEOUS (overlap: 3)
THEAH (overlap: 3)
THEANDRIC (overlap: 3)
THEANTHROPIC (overlap: 3)
THEANTHROPICAL (overlap: 3)
THEANTHROPISM (overlap: 3)
THEANTHROPIST (overlap: 3)
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
