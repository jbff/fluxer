// Global variables
let words = [];
let nouns = [];
let verbs = [];
let adjectives = [];
let adverbs = [];
let currentResults = [];
let currentIndex = 0;
const RESULTS_PER_PAGE = 5;

// DOM elements
const prefixInput = document.getElementById('prefix');
const suffixInput = document.getElementById('suffix');
const lengthInput = document.getElementById('length');
const vowelsInput = document.getElementById('vowels');
const consonantsInput = document.getElementById('consonants');
const posSelect = document.getElementById('pos');
const doubleLettersCheckbox = document.getElementById('double-letters');
const noRepeatsCheckbox = document.getElementById('no-repeats');
const alternatingCheckbox = document.getElementById('alternating');
const alphabeticalCheckbox = document.getElementById('alphabetical');
const noPagingCheckbox = document.getElementById('no-paging');
const limitInput = document.getElementById('limit');
const searchBtn = document.getElementById('search-btn');
const resultsSection = document.getElementById('results-section');
const resultsContainer = document.getElementById('results-container');
const resultsCount = document.getElementById('results-count');
const loadingSection = document.getElementById('loading-section');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');

// Initialize the application
async function init() {
    await loadWords();
    setupEventListeners();
}

// Load words from popular.txt and POS-specific lists
async function loadWords() {
    try {
        // Load main word list
        const response = await fetch('popular.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        words = text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
        console.log(`Loaded ${words.length} words`);
        
        // Load POS-specific lists
        const [nounsResponse, verbsResponse, adjectivesResponse, adverbsResponse] = await Promise.all([
            fetch('nouns.txt'),
            fetch('verbs.txt'),
            fetch('adjectives.txt'),
            fetch('adverbs.txt')
        ]);
        
        if (nounsResponse.ok) {
            const nounsText = await nounsResponse.text();
            nouns = nounsText.split('\n').map(word => word.trim()).filter(word => word.length > 0);
            console.log(`Loaded ${nouns.length} nouns`);
        }
        
        if (verbsResponse.ok) {
            const verbsText = await verbsResponse.text();
            verbs = verbsText.split('\n').map(word => word.trim()).filter(word => word.length > 0);
            console.log(`Loaded ${verbs.length} verbs`);
        }
        
        if (adjectivesResponse.ok) {
            const adjectivesText = await adjectivesResponse.text();
            adjectives = adjectivesText.split('\n').map(word => word.trim()).filter(word => word.length > 0);
            console.log(`Loaded ${adjectives.length} adjectives`);
        }
        
        if (adverbsResponse.ok) {
            const adverbsText = await adverbsResponse.text();
            adverbs = adverbsText.split('\n').map(word => word.trim()).filter(word => word.length > 0);
            console.log(`Loaded ${adverbs.length} adverbs`);
        }
        
    } catch (error) {
        console.error('Error loading words:', error);
        alert('Error loading word lists. Please make sure all word list files are available.');
    }
}

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', performSearch);
    loadMoreBtn.addEventListener('click', loadMoreResults);
    
    // Allow Enter key to trigger search
    [prefixInput, suffixInput, lengthInput, vowelsInput, consonantsInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    });
    
    // Auto-convert to uppercase for word inputs
    prefixInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
    
    suffixInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
}

// Main search function
async function performSearch() {
    const prefix = prefixInput.value.trim().toLowerCase();
    const suffix = suffixInput.value.trim().toLowerCase();
    
    if (!prefix) {
        alert('Please enter a preceding word');
        return;
    }
    
    showLoading();
    
    // Simulate async processing for better UX
    setTimeout(() => {
        const matches = findMatches(prefix, suffix, getLengthFilter());
        const filtered = filterMatches(matches, prefix, suffix);
        const sorted = sortResults(filtered);
        
        currentResults = sorted;
        currentIndex = 0;
        
        hideLoading();
        displayResults();
    }, 100);
}

// Find matches based on prefix and suffix
function findMatches(prefix, suffix, length) {
    const results = new Set();
    const prefixSuffixes = [];
    
    // Generate all suffixes of prefix
    for (let i = 0; i <= prefix.length; i++) {
        prefixSuffixes.push(prefix.substring(i));
    }
    
    for (const word of words) {
        const wordLower = word.toLowerCase();
        
        // Check length filter
        if (length !== null && wordLower.length !== length) {
            continue;
        }
        
        // Check all suffixes of prefix
        for (const pre of prefixSuffixes) {
            if (wordLower.startsWith(pre)) {
                if (suffix) {
                    // Check all prefixes of suffix
                    for (let i = 1; i <= suffix.length; i++) {
                        if (wordLower.endsWith(suffix.substring(0, i))) {
                            results.add(word);
                            break;
                        }
                    }
                    break; // Only need the longest prefix match
                } else {
                    results.add(word);
                    break;
                }
            }
        }
    }
    
    return Array.from(results);
}

// Filter matches by additional criteria
function filterMatches(matches, prefix, suffix) {
    const filtered = [];
    
    for (const word of matches) {
        const wordLower = word.toLowerCase();
        
        // Vowel count filter
        const vowels = getVowelsFilter();
        if (vowels !== null && countVowels(wordLower) !== vowels) {
            continue;
        }
        
        // Consonant count filter
        const consonants = getConsonantsFilter();
        if (consonants !== null && countConsonants(wordLower) !== consonants) {
            continue;
        }
        
        // Part of speech filter
        const pos = getPosFilter();
        if (pos && !isWordInPosCategory(wordLower, pos)) {
            continue;
        }
        
        // Double letters filter
        if (doubleLettersCheckbox.checked && !hasDoubleLetters(wordLower)) {
            continue;
        }
        
        // No repeats filter
        if (noRepeatsCheckbox.checked && hasRepeatedLetters(wordLower)) {
            continue;
        }
        
        // Alternating pattern filter
        if (alternatingCheckbox.checked && !isAlternatingPattern(wordLower)) {
            continue;
        }
        
        // Alphabetical order filter
        if (alphabeticalCheckbox.checked && !isAlphabeticalOrder(wordLower)) {
            continue;
        }
        
        // Calculate overlap
        let overlap = prefixOverlap(wordLower, prefix);
        if (suffix) {
            overlap += suffixOverlap(wordLower, suffix);
        }
        
        // Only include words with actual overlap
        if (overlap > 0) {
            filtered.push({ word, overlap });
        }
    }
    
    return filtered;
}

// Sort results by overlap, length, and alphabetically
function sortResults(results) {
    return results.sort((a, b) => {
        // Sort by overlap (descending)
        if (b.overlap !== a.overlap) {
            return b.overlap - a.overlap;
        }
        // Sort by length (descending)
        if (b.word.length !== a.word.length) {
            return b.word.length - a.word.length;
        }
        // Sort alphabetically
        return a.word.localeCompare(b.word);
    });
}

// Display results
function displayResults() {
    if (currentResults.length === 0) {
        resultsSection.style.display = 'none';
        alert('No matches found with the given criteria.');
        return;
    }
    
    const limit = getLimitFilter();
    const noPaging = noPagingCheckbox.checked;
    
    resultsSection.style.display = 'block';
    resultsCount.textContent = `${currentResults.length} matches found`;
    
    if (noPaging) {
        // Show all results
        displayAllResults(limit);
    } else {
        // Show paginated results
        displayPaginatedResults();
    }
}

// Display all results
function displayAllResults(limit) {
    const resultsToShow = limit ? currentResults.slice(0, limit) : currentResults;
    
    resultsContainer.innerHTML = resultsToShow.map(result => `
        <div class="result-item">
            <span class="result-word">${result.word.toUpperCase()}</span>
            <span class="result-overlap">overlap: ${result.overlap}</span>
        </div>
    `).join('');
    
    loadMoreContainer.style.display = 'none';
}

// Display paginated results
function displayPaginatedResults() {
    const endIndex = Math.min(currentIndex + RESULTS_PER_PAGE, currentResults.length);
    const resultsToShow = currentResults.slice(currentIndex, endIndex);
    
    if (currentIndex === 0) {
        resultsContainer.innerHTML = '';
    }
    
    resultsContainer.innerHTML += resultsToShow.map(result => `
        <div class="result-item">
            <span class="result-word">${result.word.toUpperCase()}</span>
            <span class="result-overlap">overlap: ${result.overlap}</span>
        </div>
    `).join('');
    
    // Show/hide load more button
    if (endIndex < currentResults.length) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

// Load more results
function loadMoreResults() {
    currentIndex += RESULTS_PER_PAGE;
    displayPaginatedResults();
}

// Show loading state
function showLoading() {
    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingSection.style.display = 'none';
}

// Get filter values
function getLengthFilter() {
    const value = lengthInput.value.trim();
    return value ? parseInt(value) : null;
}

function getVowelsFilter() {
    const value = vowelsInput.value.trim();
    return value ? parseInt(value) : null;
}

function getConsonantsFilter() {
    const value = consonantsInput.value.trim();
    return value ? parseInt(value) : null;
}

function getPosFilter() {
    return posSelect.value || null;
}

function getLimitFilter() {
    const value = limitInput.value.trim();
    return value ? parseInt(value) : null;
}

// Utility functions (ported from fluxer.py)

function countVowels(word) {
    return (word.match(/[aeiou]/g) || []).length;
}

function countConsonants(word) {
    return (word.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
}

function hasDoubleLetters(word) {
    for (let i = 0; i < word.length - 1; i++) {
        if (word[i] === word[i + 1]) {
            return true;
        }
    }
    return false;
}

function hasRepeatedLetters(word) {
    const seen = new Set();
    for (const letter of word) {
        if (seen.has(letter)) {
            return true;
        }
        seen.add(letter);
    }
    return false;
}

function isAlternatingPattern(word) {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    
    if (word.length <= 1) {
        return true;
    }
    
    const isVowelStart = vowels.includes(word[0]);
    
    for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i]);
        const isConsonant = consonants.includes(word[i]);
        
        if (!isVowel && !isConsonant) {
            continue;
        }
        
        const shouldBeVowel = isVowelStart ? (i % 2 === 0) : (i % 2 === 1);
        
        if (shouldBeVowel && !isVowel) {
            return false;
        }
        if (!shouldBeVowel && !isConsonant) {
            return false;
        }
    }
    
    return true;
}

function isAlphabeticalOrder(word) {
    return word === word.split('').sort().join('');
}

function prefixOverlap(word, prefix) {
    let maxOverlap = 0;
    for (let i = 0; i < prefix.length; i++) {
        if (word.startsWith(prefix.substring(i))) {
            const overlap = prefix.length - i;
            if (overlap > maxOverlap) {
                maxOverlap = overlap;
            }
        }
    }
    return maxOverlap;
}

function suffixOverlap(word, suffix) {
    let maxOverlap = 0;
    for (let i = 1; i <= suffix.length; i++) {
        if (word.endsWith(suffix.substring(0, i))) {
            if (i > maxOverlap) {
                maxOverlap = i;
            }
        }
    }
    return maxOverlap;
}

// Check if a word is in a specific POS category using pre-tagged lists
function isWordInPosCategory(word, pos) {
    const wordLower = word.toLowerCase();
    
    switch (pos) {
        case 'noun':
            return nouns.includes(wordLower);
        case 'verb':
            return verbs.includes(wordLower);
        case 'adjective':
            return adjectives.includes(wordLower);
        case 'adverb':
            return adverbs.includes(wordLower);
        default:
            return false;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init); 