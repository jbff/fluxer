#!/usr/bin/env python

import nltk
from nltk.corpus import words
import argparse
import sys
import time

def find_matches(prefix, suffix=None, length=None):
    prefix = prefix.lower()
    if suffix is not None:
        suffix = suffix.lower()
    word_set = set(w.lower() for w in words.words())
    results = set()
    prefix_suffixes = [prefix[i:] for i in range(len(prefix))]  # all suffixes of prefix except empty
    prefix_suffixes.append(prefix)  # include full prefix
    for w in word_set:
        if length is not None and len(w) != length:
            continue
        # Check all suffixes of prefix (from full prefix down to last letter)
        for pre in prefix_suffixes:
            if w.startswith(pre):
                if suffix:
                    # Check all prefixes of suffix (from first letter up to full suffix)
                    for i in range(1, len(suffix) + 1):
                        if w.endswith(suffix[:i]):
                            results.add(w)
                            break
                    break  # Only need the longest prefix match
                else:
                    results.add(w)
                    break
    return sorted(results)

def ensure_words_corpus():
    import nltk
    try:
        nltk.data.find('corpora/words')
    except LookupError:
        nltk.download('words')
    try:
        nltk.data.find('taggers/averaged_perceptron_tagger_eng')
    except LookupError:
        nltk.download('averaged_perceptron_tagger_eng')

def supports_color():
    return sys.stdout.isatty()

# ANSI color codes
RESET = '\033[0m'
BOLD = '\033[1m'
CYAN = '\033[36m'
YELLOW = '\033[33m'
MAGENTA = '\033[35m'

def print_transient(msg):
    color = MAGENTA if supports_color() else ''
    reset = RESET if supports_color() else ''
    sys.stdout.write(f"\r{color}{msg.ljust(60)}{reset}")
    sys.stdout.flush()

def clear_transient():
    sys.stdout.write("\r" + " " * 60 + "\r")
    sys.stdout.flush()

def main():
    parser = argparse.ArgumentParser(description="Find words with overlapping prefix and optional suffix.")
    parser.add_argument("prefix", type=str, help="Prefix string (e.g., ST)")
    parser.add_argument("suffix", type=str, nargs="?", default=None, help="Suffix string (e.g., PLAY). Optional.")
    parser.add_argument("--length", "-l", type=int, default=None, help="Optional word length")
    parser.add_argument("--vowels", "-v", type=int, default=None, help="Exact number of vowels required")
    parser.add_argument("--consonants", "-c", type=int, default=None, help="Exact number of consonants required")
    parser.add_argument("--pos", "-p", type=str, default=None, help="Part of speech: noun, verb, adjective, adverb")
    parser.add_argument("--double-letters", "-d", action="store_true", help="Require double letters in the word")
    args = parser.parse_args()
    ensure_words_corpus()

    print_transient("Finding matches...")
    matches = find_matches(args.prefix, args.suffix, args.length)
    clear_transient()

    print_transient("Filtering matches by criteria...")
    filtered = []
    for w in matches:
        if args.vowels is not None and count_vowels(w) != args.vowels:
            continue
        if args.consonants is not None and count_consonants(w) != args.consonants:
            continue
        if args.pos is not None and get_part_of_speech(w) != args.pos.lower():
            continue
        if args.double_letters and not has_double_letters(w):
            continue
        # Calculate and store total overlap
        if args.suffix:
            overlap = prefix_overlap(w, args.prefix) + suffix_overlap(w, args.suffix)
        else:
            overlap = prefix_overlap(w, args.prefix)
        filtered.append((w, overlap))
    clear_transient()

    print_transient("Sorting responses by overlap...")
    filtered.sort(key=lambda x: (-x[1], x[0]))
    clear_transient()

    # Colorful header
    color = CYAN if supports_color() else ''
    bold = BOLD if supports_color() else ''
    yellow = YELLOW if supports_color() else ''
    reset = RESET if supports_color() else ''
    magenta = MAGENTA if supports_color() else ''
    print(f"{magenta}{bold}Found {len(filtered)} matches:{reset}")
    # Output 5 at a time, prompt for more
    i = 0
    while i < len(filtered):
        for j in range(i, min(i+5, len(filtered))):
            w, overlap = filtered[j]
            print(f"{bold}{color}{w.upper()}{reset} {yellow}(overlap: {overlap}){reset}")
        i += 5
        if i < len(filtered):
            user_input = input("Press Enter for more, or 'q' to quit: ")
            if user_input.strip().lower() == 'q':
                break

# Utility: Check if a word contains double letters

def has_double_letters(word):
    word = word.lower()
    for i in range(len(word) - 1):
        if word[i] == word[i + 1]:
            return True
    return False

# Utility: Get part of speech (POS) using nltk

def get_part_of_speech(word):
    # Returns the most probable POS tag for the word (noun, verb, adj, etc.)
    from nltk import pos_tag
    tagged = pos_tag([word])
    tag = tagged[0][1]
    # Map Penn Treebank tags to simple POS
    if tag.startswith('N'):
        return 'noun'
    elif tag.startswith('V'):
        return 'verb'
    elif tag.startswith('J'):
        return 'adjective'
    elif tag.startswith('R'):
        return 'adverb'
    else:
        return 'other'

# Utility: Count vowels in a word

def count_vowels(word):
    return sum(1 for c in word.lower() if c in 'aeiou')

# Utility: Count consonants in a word

def count_consonants(word):
    return sum(1 for c in word.lower() if c.isalpha() and c not in 'aeiou')

# Helper: Calculate prefix overlap (longest suffix of prefix matching start of word)
def prefix_overlap(word, prefix):
    prefix = prefix.lower()
    word = word.lower()
    max_overlap = 0
    for i in range(len(prefix)):
        if word.startswith(prefix[i:]):
            overlap = len(prefix) - i
            if overlap > max_overlap:
                max_overlap = overlap
    return max_overlap

# Helper: Calculate suffix overlap (longest prefix of suffix matching end of word)
def suffix_overlap(word, suffix):
    suffix = suffix.lower()
    word = word.lower()
    max_overlap = 0
    for i in range(1, len(suffix) + 1):
        if word.endswith(suffix[:i]):
            if i > max_overlap:
                max_overlap = i
    return max_overlap

if __name__ == "__main__":
    main()
