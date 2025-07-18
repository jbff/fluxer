#!/usr/bin/env python3

import nltk
import sys
from collections import defaultdict

def ensure_nltk_data():
    """Ensure NLTK data is available"""
    try:
        nltk.data.find('taggers/averaged_perceptron_tagger')
    except LookupError:
        print("Downloading NLTK data...")
        nltk.download('averaged_perceptron_tagger')
        nltk.download('punkt')

def get_pos_tags(word):
    """Get all possible POS tags for a word"""
    # NLTK's tagger works best with sentences, so we create a simple context
    # We'll try the word in different contexts to get all possible tags
    
    contexts = [
        f"I {word}.",           # Verb context
        f"The {word}.",         # Noun context  
        f"It is {word}.",       # Adjective context
        f"He walks {word}.",    # Adverb context
        f"{word} book.",        # Adjective context
        f"I see the {word}.",   # Noun context
        f"I {word} it.",        # Verb context
    ]
    
    all_tags = set()
    
    for context in contexts:
        try:
            tokens = nltk.word_tokenize(context)
            tagged = nltk.pos_tag(tokens)
            
            # Find our word in the tagged tokens
            for token, tag in tagged:
                if token.lower() == word.lower():
                    all_tags.add(tag)
        except Exception as e:
            # Skip contexts that don't work well
            continue
    
    # Also try the word by itself
    try:
        tagged = nltk.pos_tag([word])
        if tagged:
            all_tags.add(tagged[0][1])
    except:
        pass
    
    return all_tags

def map_penn_to_simple(tag):
    """Map Penn Treebank tags to simple POS categories"""
    if tag.startswith('NN'):  # Nouns
        return 'noun'
    elif tag.startswith('VB'):  # Verbs
        return 'verb'
    elif tag.startswith('JJ'):  # Adjectives
        return 'adjective'
    elif tag.startswith('RB'):  # Adverbs
        return 'adverb'
    else:
        return 'other'

def process_word_list(filename):
    """Process the word list and create POS-specific files"""
    print(f"Processing {filename}...")
    
    # Read words
    try:
        with open(filename, 'r') as f:
            words = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"Error: {filename} not found.")
        return
    
    print(f"Found {len(words)} words to process.")
    
    # Initialize POS dictionaries
    pos_words = defaultdict(set)
    
    # Process each word
    for i, word in enumerate(words):
        if i % 1000 == 0:
            print(f"Processing word {i+1}/{len(words)}: {word}")
        
        # Get all possible POS tags for this word
        penn_tags = get_pos_tags(word)
        
        # Map to simple categories and add to appropriate sets
        for penn_tag in penn_tags:
            simple_pos = map_penn_to_simple(penn_tag)
            if simple_pos != 'other':
                pos_words[simple_pos].add(word)
    
    # Write separate files for each POS
    for pos, word_set in pos_words.items():
        filename = f"{pos}s.txt"
        sorted_words = sorted(word_set)
        
        with open(filename, 'w') as f:
            for word in sorted_words:
                f.write(f"{word}\n")
        
        print(f"Created {filename} with {len(sorted_words)} words")
    
    # Create a summary file
    with open('pos_summary.txt', 'w') as f:
        f.write("Part of Speech Summary\n")
        f.write("=====================\n\n")
        
        for pos, word_set in pos_words.items():
            f.write(f"{pos.capitalize()}s: {len(word_set)} words\n")
        
        f.write(f"\nTotal unique words processed: {len(set().union(*pos_words.values()))}\n")
    
    print(f"\nSummary written to pos_summary.txt")
    
    # Print some examples of multi-POS words
    print("\nExamples of words with multiple parts of speech:")
    word_pos_count = defaultdict(int)
    for pos, word_set in pos_words.items():
        for word in word_set:
            word_pos_count[word] += 1
    
    multi_pos_words = {word: count for word, count in word_pos_count.items() if count > 1}
    
    if multi_pos_words:
        print("Words appearing in multiple categories:")
        for word, count in sorted(multi_pos_words.items())[:10]:  # Show first 10
            categories = []
            for pos, word_set in pos_words.items():
                if word in word_set:
                    categories.append(pos)
            print(f"  {word}: {', '.join(categories)}")
    else:
        print("No multi-POS words found.")

def main():
    print("Fluxer Part-of-Speech Tagging Tool")
    print("==================================")
    
    # Ensure NLTK data is available
    ensure_nltk_data()
    
    # Process the word list
    process_word_list('popular.txt')
    
    print("\nDone! POS-specific word lists have been created.")

if __name__ == "__main__":
    main() 