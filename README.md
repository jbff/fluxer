# fluxer

A Python script that assists with playing **Fluxis**, a word puzzle game from [The Atlantic Games](https://www.theatlantic.com/games/).

## About Fluxis

Fluxis is a word puzzle game where players must find words that share overlapping letters with given prefix and suffix patterns. This tool helps by finding all possible words that match the specified criteria.

## Features

- Find words with overlapping prefix patterns
- Optional suffix matching with overlap calculation
- Filter results by:
  - Word length
  - Number of vowels
  - Number of consonants
  - Part of speech (noun, verb, adjective, adverb)
  - Presence of double letters
- Results sorted by overlap strength
- Colorful terminal output with pagination

## Usage

```bash
python fluxer.py PREFIX [SUFFIX] [OPTIONS]
```

### Examples

```bash
# Find words starting with overlapping "ST" pattern
python fluxer.py ST

# Find words with "ST" prefix and "PLAY" suffix overlap
python fluxer.py ST PLAY

# Find 7-letter words with "ST" prefix
python fluxer.py ST --length 7

# Find nouns with "ST" prefix and exactly 3 vowels
python fluxer.py ST --pos noun --vowels 3

# Find words with double letters
python fluxer.py ST --double-letters
```

### Options

- `--length, -l`: Specify exact word length
- `--vowels, -v`: Exact number of vowels required
- `--consonants, -c`: Exact number of consonants required
- `--pos, -p`: Part of speech (noun, verb, adjective, adverb)
- `--double-letters, -d`: Require double letters in the word

## Requirements

- Python 3.x
- NLTK library (`pip install nltk`)

The script will automatically download required NLTK data (words corpus and POS tagger) on first run.

## How It Works

The script uses NLTK's words corpus to find matches based on overlapping patterns. For example, with prefix "ST" and suffix "PLAY", it finds words like "STEEPLY" where:
- "ST" overlaps with the beginning ("**ST**EEPLY")
- "PLAY" overlaps with the end ("STEEP**LY**")

Results are ranked by total overlap strength and displayed with color coding for easy reading.
