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

def find_solutions(starting_word: str, rules: List[str], fluxer, max_solutions: Optional[int] = 5) -> List[Tuple[List[str], int]]:
    """Find multiple complete 3-word solution paths with total overlap calculation"""
    # Parse all rules
    rule_filters = [parse_rule(rule) for rule in rules]
    
    if len(rule_filters) != 3:
        print(f"Error: Expected 3 rules, got {len(rules)}")
        return []
    
    # Ensure words are loaded
    fluxer.ensure_words_corpus()
    
    print(f"Starting word: {starting_word.upper()}")
    print(f"Rules: {', '.join(rules)}")
    if max_solutions is None:
        print("Searching for ALL solutions...")
    else:
        print(f"Searching for up to {max_solutions} solutions...")
    
    solutions = []
    
    # Step 1: Find words that match the first rule and overlap with starting word
    step1_matches = []
    for word in fluxer.words:
        if apply_filters(word, rule_filters[0], fluxer):
            overlap = fluxer.prefix_overlap(word, starting_word)
            if overlap > 0:
                step1_matches.append((word, overlap))
    
    step1_matches.sort(key=lambda x: (-x[1], -len(x[0]), x[0]))
    
    if not step1_matches:
        print(f"No words found matching rule '{rules[0]}' with overlap to '{starting_word}'")
        return []
    
    # Step 2: For each step 1 word, find step 2 words
    for step1_word, step1_overlap in step1_matches:
        step2_matches = []
        for word in fluxer.words:
            if apply_filters(word, rule_filters[1], fluxer):
                overlap = fluxer.prefix_overlap(word, step1_word)
                if overlap > 0:
                    step2_matches.append((word, overlap))
        
        step2_matches.sort(key=lambda x: (-x[1], -len(x[0]), x[0]))
        
        if not step2_matches:
            continue
        
        # Step 3: For each step 2 word, find step 3 words that connect back to starting word
        for step2_word, step2_overlap in step2_matches:
            step3_matches = []
            for word in fluxer.words:
                if apply_filters(word, rule_filters[2], fluxer):
                    # Check overlap with step 2 word
                    overlap2 = fluxer.prefix_overlap(word, step2_word)
                    # Check overlap with starting word (for the cycle)
                    overlap_start = fluxer.suffix_overlap(word, starting_word)
                    if overlap2 > 0 and overlap_start > 0:
                        # Calculate total overlap for the complete cycle
                        total_overlap = step1_overlap + step2_overlap + overlap2 + overlap_start
                        step3_matches.append((word, total_overlap))
            
            step3_matches.sort(key=lambda x: (-x[1], -len(x[0]), x[0]))
            
            # Add all valid solutions from this path
            for step3_word, total_overlap in step3_matches:
                solution = [starting_word, step1_word, step2_word, step3_word]
                solutions.append((solution, total_overlap))
                print(f"\r{len(solutions)} solutions found                 ", end="", flush=True)

                # Check if we've reached the limit
                if max_solutions is not None and len(solutions) >= max_solutions:
                    print(f"\nReached limit of {max_solutions} solutions!")
                    return solutions
    
    print(f"\nSearch complete! Found {len(solutions)} solutions.")
    return solutions

def print_solutions(solutions: List[Tuple[List[str], int]], rules: List[str], max_print: Optional[int] = None):
    """Print multiple solutions in a compact format, sorted by overlap"""
    if not solutions:
        print("\nNo solutions found!")
        return
    
    print("\n" + "="*60)
    if len(solutions) == 1:
        print("SOLUTION FOUND!")
    else:
        print(f"FOUND {len(solutions)} SOLUTIONS!")
    if max_print is not None and len(solutions) > max_print:
        print(f"Showing top {max_print} solutions by overlap:")
    print("="*60)
    
    # Sort solutions by total overlap (highest first)
    solutions.sort(key=lambda x: x[1], reverse=True)
    
    # Limit the number of solutions to print
    solutions_to_print = solutions[:max_print] if max_print is not None else solutions
    
    for i, (solution, total_overlap) in enumerate(solutions_to_print, 1):
        print(f"{i:2d}. {solution[0].upper()} → {solution[1].upper()} → {solution[2].upper()} → {solution[3].upper()} (overlap: {total_overlap})")
    
    if max_print is not None and len(solutions) > max_print:
        print(f"\n... and {len(solutions) - max_print} more solutions")

def main():
    parser = argparse.ArgumentParser(
        description="Solve fluxer puzzles by finding 3-word solution paths",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python fluxer_solver.py PERHAPS --rules noun,6-letters,double-letters
  python fluxer_solver.py START --rules verb,5-letters,no-repeats --solutions 3
  python fluxer_solver.py HELLO --rules adjective,alternating,alphabetical --all
  python fluxer_solver.py WORD --rules noun,verb,adjective --solutions 100 --print 5
  python fluxer_solver.py TEST --rules 6-letters,double-letters,no-repeats --all --print 10

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
    parser.add_argument("--solutions", "-s", type=int, default=5,
                       help="Maximum number of solutions to find (default: 5, use --all for all solutions)")
    parser.add_argument("--all", "-a", action="store_true",
                       help="Find all possible solutions (overrides --solutions)")
    parser.add_argument("--print", "-p", type=int,
                       help="Maximum number of solutions to print (default: print all found solutions)")
    
    args = parser.parse_args()
    
    # Parse rules
    rule_list = [rule.strip() for rule in args.rules.split(',')]
    
    if len(rule_list) != 3:
        print(f"Error: Expected exactly 3 rules, got {len(rule_list)}")
        print("Rules should be comma-separated, e.g.: noun,6-letters,double-letters")
        sys.exit(1)
    
    # Determine max solutions
    if args.all:
        max_solutions = None
    else:
        max_solutions = args.solutions
    
    # Determine max solutions to print
    if args.print is not None:
        max_print = args.print
    else:
        max_print = None  # Default: print all found solutions
    
    # Import fluxer functions
    try:
        fluxer = import_fluxer_functions()
    except Exception as e:
        print(f"Error importing fluxer.py: {e}")
        print("Make sure fluxer.py is in the same directory as this script")
        sys.exit(1)
    
    # Find solutions
    solutions = find_solutions(args.starting_word, rule_list, fluxer, max_solutions)
    
    if solutions:
        print_solutions(solutions, rule_list, max_print)
    else:
        print("\nNo solutions found. Try different rules or starting word.")
        sys.exit(1)

if __name__ == "__main__":
    main() 