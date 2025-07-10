#!/usr/bin/env python3

import argparse
import sys
from typing import List, Tuple, Optional, Dict, Any
import importlib.util

# Import functions from fluxer.py
def import_fluxer_functions():
    """Import necessary functions from fluxer.py"""
    spec = importlib.util.spec_from_file_location("fluxer", "fluxer.py")
    fluxer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fluxer)
    return fluxer

# Rule definitions
RULE_DEFINITIONS = {
    'noun': {'pos': 'noun'},
    'verb': {'pos': 'verb'},
    'adjective': {'pos': 'adjective'},
    'adj': {'pos': 'adjective'},
    'adverb': {'pos': 'adverb'},
    'adv': {'pos': 'adverb'},
    'double-letters': {'double_letters': True},
    'double': {'double_letters': True},
    'no-repeats': {'no_repeats': True},
    'no-repeated': {'no_repeats': True},
    'alternating': {'alternating': True},
    'alt': {'alternating': True},
    'alphabetical': {'alphabetical': True},
    'alpha': {'alphabetical': True},
}

def parse_length_rule(rule: str) -> Dict[str, Any]:
    """Parse length rules like '6-letters', '5-letters', etc."""
    if rule.endswith('-letters') or rule.endswith('-letter'):
        try:
            length = int(rule.split('-')[0])
            return {'length': length}
        except (ValueError, IndexError):
            pass
    return {}

def parse_vowel_consonant_rule(rule: str) -> Dict[str, Any]:
    """Parse vowel/consonant rules like '3-vowels', '4-consonants', etc."""
    parts = rule.split('-')
    if len(parts) == 2:
        try:
            count = int(parts[0])
            if parts[1] in ['vowel', 'vowels']:
                return {'vowels': count}
            elif parts[1] in ['consonant', 'consonants']:
                return {'consonants': count}
        except ValueError:
            pass
    return {}

def parse_rule(rule: str) -> Dict[str, Any]:
    """Parse a single rule string into a dictionary of filter parameters"""
    rule = rule.lower().strip()
    
    # Check predefined rules
    if rule in RULE_DEFINITIONS:
        return RULE_DEFINITIONS[rule].copy()
    
    # Check length rules
    length_rule = parse_length_rule(rule)
    if length_rule:
        return length_rule
    
    # Check vowel/consonant rules
    vc_rule = parse_vowel_consonant_rule(rule)
    if vc_rule:
        return vc_rule
    
    # If no match, return empty dict
    return {}

def apply_filters(word: str, filters: Dict[str, Any], fluxer) -> bool:
    """Apply all filters to a word and return True if it passes all filters"""
    word = word.lower()
    
    # Length filter
    if 'length' in filters and len(word) != filters['length']:
        return False
    
    # Vowel count filter
    if 'vowels' in filters and fluxer.count_vowels(word) != filters['vowels']:
        return False
    
    # Consonant count filter
    if 'consonants' in filters and fluxer.count_consonants(word) != filters['consonants']:
        return False
    
    # Part of speech filter
    if 'pos' in filters and fluxer.get_part_of_speech(word) != filters['pos']:
        return False
    
    # Double letters filter
    if filters.get('double_letters', False) and not fluxer.has_double_letters(word):
        return False
    
    # No repeats filter
    if filters.get('no_repeats', False) and fluxer.has_repeated_letters(word):
        return False
    
    # Alternating pattern filter
    if filters.get('alternating', False) and not fluxer.is_alternating_pattern(word):
        return False
    
    # Alphabetical order filter
    if filters.get('alphabetical', False) and not fluxer.is_alphabetical_order(word):
        return False
    
    return True

def find_solution_path(starting_word: str, rules: List[str], fluxer, max_attempts: int = 1000) -> Optional[List[str]]:
    """Find a complete 3-word solution path"""
    # Parse all rules
    rule_filters = [parse_rule(rule) for rule in rules]
    
    if len(rule_filters) != 3:
        print(f"Error: Expected 3 rules, got {len(rules)}")
        return None
    
    # Ensure words are loaded
    fluxer.ensure_words_corpus()
    
    print(f"Starting word: {starting_word.upper()}")
    print(f"Rules: {', '.join(rules)}")
    print("Searching for solution...")
    
    # Step 1: Find words that match the first rule and overlap with starting word
    print(f"\nStep 1: Finding words matching rule '{rules[0]}'...")
    step1_matches = []
    for word in fluxer.words:
        if apply_filters(word, rule_filters[0], fluxer):
            overlap = fluxer.prefix_overlap(word, starting_word)
            if overlap > 0:
                step1_matches.append((word, overlap))
    
    step1_matches.sort(key=lambda x: (-x[1], -len(x[0]), x[0]))
    step1_matches = step1_matches[:10]  # Limit to top 10 for performance
    
    if not step1_matches:
        print(f"No words found matching rule '{rules[0]}' with overlap to '{starting_word}'")
        return None
    
    print(f"Found {len(step1_matches)} candidates for step 1")
    
    # Step 2: For each step 1 word, find step 2 words
    for step1_word, step1_overlap in step1_matches:
        print(f"\nTrying step 1 word: {step1_word.upper()} (overlap: {step1_overlap})")
        
        step2_matches = []
        for word in fluxer.words:
            if apply_filters(word, rule_filters[1], fluxer):
                overlap = fluxer.prefix_overlap(word, step1_word)
                if overlap > 0:
                    step2_matches.append((word, overlap))
        
        step2_matches.sort(key=lambda x: (-x[1], -len(x[0]), x[0]))
        step2_matches = step2_matches[:5]  # Limit to top 5 for performance
        
        if not step2_matches:
            continue
        
        print(f"  Found {len(step2_matches)} candidates for step 2")
        
        # Step 3: For each step 2 word, find step 3 words that connect back to starting word
        for step2_word, step2_overlap in step2_matches:
            print(f"  Trying step 2 word: {step2_word.upper()} (overlap: {step2_overlap})")
            
            step3_matches = []
            for word in fluxer.words:
                if apply_filters(word, rule_filters[2], fluxer):
                    # Check overlap with step 2 word
                    overlap2 = fluxer.prefix_overlap(word, step2_word)
                    # Check overlap with starting word (for the cycle)
                    overlap_start = fluxer.suffix_overlap(word, starting_word)
                    if overlap2 > 0 and overlap_start > 0:
                        total_overlap = overlap2 + overlap_start
                        step3_matches.append((word, total_overlap))
            
            step3_matches.sort(key=lambda x: (-x[1], -len(x[0]), x[0]))
            
            if step3_matches:
                # Found a complete solution!
                step3_word, step3_overlap = step3_matches[0]
                solution = [starting_word, step1_word, step2_word, step3_word]
                return solution
    
    print("\nNo complete solution found!")
    return None

def print_solution(solution: List[str], rules: List[str]):
    """Print the solution in a nice format"""
    print("\n" + "="*60)
    print("SOLUTION FOUND!")
    print("="*60)
    
    for i, (word, rule) in enumerate(zip(solution[1:], rules), 1):
        print(f"Step {i}: {word.upper()} (rule: {rule})")
    
    print(f"\nComplete cycle:")
    print(f"{solution[0].upper()} → {solution[1].upper()} → {solution[2].upper()} → {solution[3].upper()}")

def main():
    parser = argparse.ArgumentParser(
        description="Solve fluxer puzzles by finding 3-word solution paths",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python fluxer_solver.py PERHAPS --rules noun,6-letters,double-letters
  python fluxer_solver.py START --rules verb,5-letters,no-repeats
  python fluxer_solver.py HELLO --rules adjective,alternating,alphabetical

Available rules:
  - noun, verb, adjective/adj, adverb/adv
  - double-letters/double, no-repeats/no-repeated
  - alternating/alt, alphabetical/alpha
  - N-letters (e.g., 6-letters, 5-letters)
  - N-vowels, N-consonants (e.g., 3-vowels, 4-consonants)
        """
    )
    
    parser.add_argument("starting_word", type=str, help="Starting word for the puzzle")
    parser.add_argument("--rules", "-r", type=str, required=True, 
                       help="Comma-separated list of 3 rules (e.g., 'noun,6-letters,double-letters')")
    parser.add_argument("--max-attempts", "-m", type=int, default=1000,
                       help="Maximum attempts to find solution (default: 1000)")
    
    args = parser.parse_args()
    
    # Parse rules
    rule_list = [rule.strip() for rule in args.rules.split(',')]
    
    if len(rule_list) != 3:
        print(f"Error: Expected exactly 3 rules, got {len(rule_list)}")
        print("Rules should be comma-separated, e.g.: noun,6-letters,double-letters")
        sys.exit(1)
    
    # Import fluxer functions
    try:
        fluxer = import_fluxer_functions()
    except Exception as e:
        print(f"Error importing fluxer.py: {e}")
        print("Make sure fluxer.py is in the same directory as this script")
        sys.exit(1)
    
    # Find solution
    solution = find_solution_path(args.starting_word, rule_list, fluxer, args.max_attempts)
    
    if solution:
        print_solution(solution, rule_list)
    else:
        print("\nNo solution found. Try different rules or starting word.")
        sys.exit(1)

if __name__ == "__main__":
    main() 