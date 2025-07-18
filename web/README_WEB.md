# Fluxer Web Application

A modern web interface for the Fluxer word-finding and puzzle-solving tools. This web application provides the same functionality as the Python scripts (`fluxer.py` and `fluxer_solver.py`) but with beautiful, responsive user interfaces.

## Pages

### 1. Single Word Finder (`index.html`)
- Find individual words with overlapping prefixes and suffixes
- Advanced filtering options
- Real-time results with sorting by overlap

### 2. Puzzle Solver (`solver.html`)
- Find complete 3-word solution paths for Fluxis puzzles
- Multiple solution ranking by overlap strength
- Progress tracking during search

## Features

- **Preceding/Following Word Search**: Find words that overlap with given preceding and following words
- **Advanced Filtering**: Filter by word length, vowel/consonant count, part of speech, and more
- **Real-time Results**: Instant search results with sorting by overlap
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## How to Use

### Single Word Finder
1. Navigate to the Single Word Finder page
2. Enter a **preceding word** (required) - e.g., "START"
3. Optionally enter a **following word** - e.g., "PLAY"
4. Apply filters as needed
5. Click "Find Words" to search

### Puzzle Solver
1. Navigate to the Puzzle Solver page
2. Enter a **starting word** - e.g., "START"
3. Enter **3 rules** for the solution path - e.g., "noun", "6-letters", "double-letters"
4. Set maximum solutions and display limits
5. Click "Find Solutions" to search

### Advanced Filters
- **Word Length**: Specify exact word length (e.g., 6 letters)
- **Vowels/Consonants**: Filter by exact count of vowels or consonants
- **Part of Speech**: Filter by noun, verb, adjective, or adverb
- **Pattern Filters**:
  - **Double Letters**: Words containing repeated letters (e.g., "book")
  - **No Repeated Letters**: Words with unique letters only
  - **Alternating Pattern**: Vowel-consonant alternating words
  - **Alphabetical Order**: Words with letters in alphabetical order

### Display Options
- **Show All Results**: Display all matches at once
- **Limit Results**: Set maximum number of results to show
- **Pagination**: View results in pages of 5 (when "Show All Results" is unchecked)

## Examples

### Example 1: Basic Preceding Word Search
- Preceding Word: "START"
- Results: Words like "STARTLE", "STARTING", "STARTED", etc.

### Example 2: Preceding + Following Word Search
- Preceding Word: "START"
- Following Word: "PLAY"
- Results: Words that start with "START" and end with "PLAY" (or parts of "PLAY")

### Example 3: Filtered Search
- Preceding Word: "START"
- Length: 8
- Double Letters: ✓
- Results: 8-letter words starting with "START" that contain double letters

## File Structure

```
fluxer/
├── web/                # Web application directory
│   ├── index.html      # Single word finder page
│   ├── solver.html     # Puzzle solver page
│   ├── styles.css      # Shared CSS styles
│   ├── script.js       # Single word finder JavaScript
│   ├── solver.js       # Puzzle solver JavaScript
│   ├── popular.txt     # Word list (required)
│   ├── nouns.txt       # Pre-tagged nouns
│   ├── verbs.txt       # Pre-tagged verbs
│   ├── adjectives.txt  # Pre-tagged adjectives
│   ├── adverbs.txt     # Pre-tagged adverbs
│   └── README_WEB.md   # This file
├── fluxer.py           # Original Python script
├── fluxer_solver.py    # Original Python solver
└── README.md           # Main documentation
```

## Setup

1. Make sure all files are in the `web/` directory
2. Ensure `popular.txt` and the POS files are present
3. Start a local web server: `python3 -m http.server 8000`
4. Open your browser to `http://localhost:8000`
5. The application will automatically load all word lists

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Technical Notes

- The application loads the word list from `popular.txt` on startup
- All processing is done client-side using JavaScript
- No server required - works as a static web application
- Part of speech detection is simplified; for more accuracy, consider integrating a proper NLP library

## Differences from Python Version

- **Part of Speech**: Uses a simplified dictionary-based approach instead of NLTK
- **Performance**: Optimized for web browsers with efficient JavaScript algorithms
- **UI**: Modern web interface instead of command-line output
- **Pagination**: Built-in pagination for better user experience

## Troubleshooting

- **"Error loading word list"**: Make sure `popular.txt` and POS files are in the `web/` directory
- **No results**: Try adjusting your search criteria or filters
- **Slow performance**: The word list is large (~25k words), so complex searches may take a moment
- **POS filtering not working**: Make sure the POS files (`nouns.txt`, `verbs.txt`, etc.) are present in the `web/` directory

## Future Enhancements

- Integration with proper NLP libraries for better part-of-speech detection
- Export results to CSV/JSON
- Save favorite searches
- Dark mode theme
- Advanced pattern matching 