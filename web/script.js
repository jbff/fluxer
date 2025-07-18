// Global variables
let words = [];
let nouns = [];
let verbs = [];
let adjectives = [];
let adverbs = [];

// DOM elements
const prefixInput = document.getElementById('prefix');
const suffixInput = document.getElementById('suffix');
const lengthCheckbox = document.getElementById('length-checkbox');
const lengthInput = document.getElementById('length');
const vowelsCheckbox = document.getElementById('vowels-checkbox');
const vowelsInput = document.getElementById('vowels');
const consonantsCheckbox = document.getElementById('consonants-checkbox');
const consonantsInput = document.getElementById('consonants');
const posCheckbox = document.getElementById('pos-checkbox');
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
    
    // Handle "Show All Results" checkbox
    noPagingCheckbox.addEventListener('change', (e) => {
        limitInput.disabled = e.target.checked;
        if (e.target.checked) {
            limitInput.classList.add('disabled');
        } else {
            limitInput.classList.remove('disabled');
        }
    });
    
    // Handle filter checkboxes (mutually exclusive)
    [lengthCheckbox, vowelsCheckbox, consonantsCheckbox, posCheckbox, doubleLettersCheckbox, noRepeatsCheckbox, alternatingCheckbox, alphabeticalCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterCheckboxChange);
    });
    
    // Initialize the disabled state based on the checkbox's initial state
    limitInput.disabled = noPagingCheckbox.checked;
    if (noPagingCheckbox.checked) {
        limitInput.classList.add('disabled');
    }
    
    // Initialize filter checkbox label states
    initializeFilterCheckboxStates();
    
    // Initialize Part of Speech dropdown state
    if (!posCheckbox.checked) {
        addAnyOption(posSelect);
    }
}

// Handle filter checkbox changes (mutually exclusive)
function handleFilterCheckboxChange(e) {
    const checkedCheckbox = e.target;
    const allCheckboxes = [lengthCheckbox, vowelsCheckbox, consonantsCheckbox, posCheckbox, doubleLettersCheckbox, noRepeatsCheckbox, alternatingCheckbox, alphabeticalCheckbox];
    
    // Get all checkbox labels
    const allLabels = [
        lengthCheckbox.parentElement,
        vowelsCheckbox.parentElement,
        consonantsCheckbox.parentElement,
        posCheckbox.parentElement,
        doubleLettersCheckbox.parentElement,
        noRepeatsCheckbox.parentElement,
        alternatingCheckbox.parentElement,
        alphabeticalCheckbox.parentElement
    ];
    
    if (checkedCheckbox.checked) {
        // Uncheck all other checkboxes and reset their labels
        allCheckboxes.forEach((checkbox, index) => {
            if (checkbox !== checkedCheckbox) {
                checkbox.checked = false;
                allLabels[index].classList.remove('checked');
                allLabels[index].classList.add('disabled');
            }
        });
        
        // Reset inputs to defaults when switching between rule types
        if (checkedCheckbox === lengthCheckbox) {
            lengthInput.value = '';
            lengthInput.disabled = false;
            lengthInput.classList.remove('disabled');
        } else if (checkedCheckbox === vowelsCheckbox) {
            vowelsInput.value = '';
            vowelsInput.disabled = false;
            vowelsInput.classList.remove('disabled');
        } else if (checkedCheckbox === consonantsCheckbox) {
            consonantsInput.value = '';
            consonantsInput.disabled = false;
            consonantsInput.classList.remove('disabled');
        } else if (checkedCheckbox === posCheckbox) {
            removeAnyOption(posSelect);
            posSelect.value = 'noun'; // Default to first real option
            posSelect.disabled = false;
            posSelect.classList.remove('disabled');
        }
        
        // Disable and reset all input fields for unchecked checkboxes
        if (checkedCheckbox !== lengthCheckbox) {
            lengthInput.disabled = true;
            lengthInput.classList.add('disabled');
            lengthInput.value = '';
        }
        if (checkedCheckbox !== vowelsCheckbox) {
            vowelsInput.disabled = true;
            vowelsInput.classList.add('disabled');
            vowelsInput.value = '';
        }
        if (checkedCheckbox !== consonantsCheckbox) {
            consonantsInput.disabled = true;
            consonantsInput.classList.add('disabled');
            consonantsInput.value = '';
        }
        if (checkedCheckbox !== posCheckbox) {
            posSelect.disabled = true;
            posSelect.classList.add('disabled');
            posSelect.value = '';
            addAnyOption(posSelect);
        }
        
        // Update label styling
        checkedCheckbox.parentElement.classList.remove('disabled');
        checkedCheckbox.parentElement.classList.add('checked');
        
    } else {
        // If unchecking, disable the corresponding input field, reset its value, and update label
        if (checkedCheckbox === lengthCheckbox) {
            lengthInput.disabled = true;
            lengthInput.classList.add('disabled');
            lengthInput.value = '';
        } else if (checkedCheckbox === vowelsCheckbox) {
            vowelsInput.disabled = true;
            vowelsInput.classList.add('disabled');
            vowelsInput.value = '';
        } else if (checkedCheckbox === consonantsCheckbox) {
            consonantsInput.disabled = true;
            consonantsInput.classList.add('disabled');
            consonantsInput.value = '';
        } else if (checkedCheckbox === posCheckbox) {
            posSelect.disabled = true;
            posSelect.classList.add('disabled');
            posSelect.value = '';
            addAnyOption(posSelect);
        }
        
        // Update label styling
        checkedCheckbox.parentElement.classList.remove('checked');
        checkedCheckbox.parentElement.classList.add('disabled');
    }
}

// Helper functions for managing Part of Speech dropdown
function addAnyOption(selectElement) {
    // Check if "Any" option already exists
    if (!selectElement.querySelector('option[value=""]')) {
        const anyOption = document.createElement('option');
        anyOption.value = '';
        anyOption.textContent = 'Any';
        selectElement.insertBefore(anyOption, selectElement.firstChild);
    }
}

function removeAnyOption(selectElement) {
    // Remove "Any" option if it exists
    const anyOption = selectElement.querySelector('option[value=""]');
    if (anyOption) {
        anyOption.remove();
    }
}

// Initialize filter checkbox label states
function initializeFilterCheckboxStates() {
    const allCheckboxes = [lengthCheckbox, vowelsCheckbox, consonantsCheckbox, posCheckbox, doubleLettersCheckbox, noRepeatsCheckbox, alternatingCheckbox, alphabeticalCheckbox];
    const allLabels = [
        lengthCheckbox.parentElement,
        vowelsCheckbox.parentElement,
        consonantsCheckbox.parentElement,
        posCheckbox.parentElement,
        doubleLettersCheckbox.parentElement,
        noRepeatsCheckbox.parentElement,
        alternatingCheckbox.parentElement,
        alphabeticalCheckbox.parentElement
    ];
    
    allCheckboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            allLabels[index].classList.add('checked');
            allLabels[index].classList.remove('disabled');
        } else {
            allLabels[index].classList.remove('checked');
            allLabels[index].classList.add('disabled');
        }
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
        
        hideLoading();
        displayResults(sorted);
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
function displayResults(results) {
    if (results.length === 0) {
        resultsSection.style.display = 'none';
        alert('No matches found with the given criteria.');
        return;
    }
    
    const limit = getLimitFilter();
    const noPaging = noPagingCheckbox.checked;
    
    resultsSection.style.display = 'block';
    resultsCount.textContent = `${results.length} matches found`;
    
    // Show all results or limit based on checkbox
    const resultsToShow = noPaging ? results : (limit ? results.slice(0, limit) : results);
    
    resultsContainer.innerHTML = resultsToShow.map(result => `
        <div class="result-item">
            <span class="result-word">${result.word.toUpperCase()}</span>
            <span class="result-overlap">overlap: ${result.overlap}</span>
        </div>
    `).join('');
    
    // Show message if results were limited
    if (!noPaging && limit && results.length > limit) {
        resultsContainer.innerHTML += `
            <div style="text-align: center; color: #6b7280; font-style: italic; margin-top: 20px;">
                Showing ${limit} of ${results.length} results. Check "Show All Results" to see all matches.
            </div>
        `;
    }
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
    if (!lengthCheckbox.checked) return null;
    const value = lengthInput.value.trim();
    return value ? parseInt(value) : null;
}

function getVowelsFilter() {
    if (!vowelsCheckbox.checked) return null;
    const value = vowelsInput.value.trim();
    return value ? parseInt(value) : null;
}

function getConsonantsFilter() {
    if (!consonantsCheckbox.checked) return null;
    const value = consonantsInput.value.trim();
    return value ? parseInt(value) : null;
}

function getPosFilter() {
    if (!posCheckbox.checked) return null;
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