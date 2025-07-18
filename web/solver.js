// Global variables
let words = [];
let nouns = [];
let verbs = [];
let adjectives = [];
let adverbs = [];

// DOM elements
const startingWordInput = document.getElementById('starting-word');
const maxSolutionsInput = document.getElementById('max-solutions');
const maxPrintInput = document.getElementById('max-print');
const findAllCheckbox = document.getElementById('find-all');
const solveBtn = document.getElementById('solve-btn');
const resultsSection = document.getElementById('results-section');
const solutionsContainer = document.getElementById('solutions-container');
const resultsCount = document.getElementById('results-count');
const loadingSection = document.getElementById('loading-section');
const progressInfo = document.getElementById('progress-info');



// Initialize the application
async function init() {
    await loadWords();
    setupEventListeners();
}

// Load words from files
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
    solveBtn.addEventListener('click', performSolve);
    
    // Allow Enter key to trigger solve on starting word input
    startingWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSolve();
        }
    });
    
    // Auto-convert to uppercase for word input
    startingWordInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
    
    // Handle "Find All Solutions" checkbox
    findAllCheckbox.addEventListener('change', (e) => {
        maxSolutionsInput.disabled = e.target.checked;
        if (e.target.checked) {
            maxSolutionsInput.classList.add('disabled');
        } else {
            maxSolutionsInput.classList.remove('disabled');
        }
    });
}

// Main solve function
async function performSolve() {
    const startingWord = startingWordInput.value.trim().toLowerCase();
    
    if (!startingWord) {
        alert('Please enter a starting word');
        return;
    }
    
    // Collect rules from form fields
    const rules = [
        collectRuleFromForm(1),
        collectRuleFromForm(2),
        collectRuleFromForm(3)
    ];
    
    // Check if at least one rule has some criteria
    const hasRules = rules.some(rule => Object.keys(rule).length > 0);
    if (!hasRules) {
        alert('Please specify at least one rule criteria');
        return;
    }
    
    const maxSolutions = findAllCheckbox.checked ? null : parseInt(maxSolutionsInput.value);
    const maxPrint = parseInt(maxPrintInput.value);
    
    showLoading();
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
        const solutions = findSolutions(startingWord, rules, maxSolutions);
        hideLoading();
        displaySolutions(solutions, rules, maxPrint);
    }, 100);
}

// Collect rule criteria from form fields for a specific rule number
function collectRuleFromForm(ruleNumber) {
    const rule = {};
    
    // Length
    const length = document.getElementById(`length${ruleNumber}`).value;
    if (length) {
        rule.length = parseInt(length);
    }
    
    // Vowels
    const vowels = document.getElementById(`vowels${ruleNumber}`).value;
    if (vowels) {
        rule.vowels = parseInt(vowels);
    }
    
    // Consonants
    const consonants = document.getElementById(`consonants${ruleNumber}`).value;
    if (consonants) {
        rule.consonants = parseInt(consonants);
    }
    
    // Part of Speech
    const pos = document.getElementById(`pos${ruleNumber}`).value;
    if (pos) {
        rule.pos = pos;
    }
    
    // Checkboxes
    if (document.getElementById(`double-letters${ruleNumber}`).checked) {
        rule.double_letters = true;
    }
    
    if (document.getElementById(`no-repeats${ruleNumber}`).checked) {
        rule.no_repeats = true;
    }
    
    if (document.getElementById(`alternating${ruleNumber}`).checked) {
        rule.alternating = true;
    }
    
    if (document.getElementById(`alphabetical${ruleNumber}`).checked) {
        rule.alphabetical = true;
    }
    
    return rule;
}

// Convert rule object to display string for results
function ruleToString(rule) {
    const parts = [];
    
    if (rule.length) parts.push(`${rule.length}-letters`);
    if (rule.vowels) parts.push(`${rule.vowels}-vowels`);
    if (rule.consonants) parts.push(`${rule.consonants}-consonants`);
    if (rule.pos) parts.push(rule.pos);
    if (rule.double_letters) parts.push('double-letters');
    if (rule.no_repeats) parts.push('no-repeats');
    if (rule.alternating) parts.push('alternating');
    if (rule.alphabetical) parts.push('alphabetical');
    
    return parts.length > 0 ? parts.join(', ') : 'any';
}

// Apply all filters to a word and return True if it passes all filters
function applyFilters(word, filters) {
    const wordLower = word.toLowerCase();
    
    // Length filter
    if (filters.length !== undefined && wordLower.length !== filters.length) {
        return false;
    }
    
    // Vowel count filter
    if (filters.vowels !== undefined && countVowels(wordLower) !== filters.vowels) {
        return false;
    }
    
    // Consonant count filter
    if (filters.consonants !== undefined && countConsonants(wordLower) !== filters.consonants) {
        return false;
    }
    
    // Part of speech filter
    if (filters.pos && !isWordInPosCategory(wordLower, filters.pos)) {
        return false;
    }
    
    // Double letters filter
    if (filters.double_letters && !hasDoubleLetters(wordLower)) {
        return false;
    }
    
    // No repeats filter
    if (filters.no_repeats && hasRepeatedLetters(wordLower)) {
        return false;
    }
    
    // Alternating pattern filter
    if (filters.alternating && !isAlternatingPattern(wordLower)) {
        return false;
    }
    
    // Alphabetical order filter
    if (filters.alphabetical && !isAlphabeticalOrder(wordLower)) {
        return false;
    }
    
    return true;
}

// Find solutions
function findSolutions(startingWord, rules, maxSolutions) {
    if (rules.length !== 3) {
        alert(`Error: Expected 3 rules, got ${rules.length}`);
        return [];
    }
    
    console.log(`Starting word: ${startingWord.toUpperCase()}`);
    console.log(`Rules: ${rules.map(rule => ruleToString(rule)).join(', ')}`);
    
    // Pre-filter words for each rule
    console.log('Pre-filtering words for each rule...');
    const wordsRule1 = words.filter(word => applyFilters(word, rules[0]));
    const wordsRule2 = words.filter(word => applyFilters(word, rules[1]));
    const wordsRule3 = words.filter(word => applyFilters(word, rules[2]));
    
    console.log(`Rule 1 (${ruleToString(rules[0])}): ${wordsRule1.length} words`);
    console.log(`Rule 2 (${ruleToString(rules[1])}): ${wordsRule2.length} words`);
    console.log(`Rule 3 (${ruleToString(rules[2])}): ${wordsRule3.length} words`);
    
    const solutions = [];
    let maxOverlap = 0;
    
    // Step 1: Find words that match the first rule and overlap with starting word
    const step1Matches = [];
    for (const word of wordsRule1) {
        const overlap = prefixOverlap(word, startingWord);
        if (overlap > 0) {
            step1Matches.push({word, overlap});
        }
    }
    
    step1Matches.sort((a, b) => (-b.overlap + a.overlap) || (-b.word.length + a.word.length) || a.word.localeCompare(b.word));
    
    if (step1Matches.length === 0) {
        alert(`No words found matching rule '${ruleToString(rules[0])}' with overlap to '${startingWord.toUpperCase()}'`);
        return [];
    }
    
    // Step 2: For each step 1 word, find step 2 words
    for (const step1Match of step1Matches) {
        const step2Matches = [];
        for (const word of wordsRule2) {
            const overlap = prefixOverlap(word, step1Match.word);
            if (overlap > 0) {
                step2Matches.push({word, overlap});
            }
        }
        
        step2Matches.sort((a, b) => (-b.overlap + a.overlap) || (-b.word.length + a.word.length) || a.word.localeCompare(b.word));
        
        if (step2Matches.length === 0) {
            continue;
        }
        
        // Step 3: For each step 2 word, find step 3 words that connect back to starting word
        for (const step2Match of step2Matches) {
            const step3Matches = [];
            for (const word of wordsRule3) {
                // Check overlap with step 2 word
                const overlap2 = prefixOverlap(word, step2Match.word);
                // Check overlap with starting word (for the cycle)
                const overlapStart = suffixOverlap(word, startingWord);
                if (overlap2 > 0 && overlapStart > 0) {
                    // Calculate total overlap for the complete cycle
                    const totalOverlap = step1Match.overlap + step2Match.overlap + overlap2 + overlapStart;
                    step3Matches.push({word, totalOverlap});
                }
            }
            
            step3Matches.sort((a, b) => (-b.totalOverlap + a.totalOverlap) || (-b.word.length + a.word.length) || a.word.localeCompare(b.word));
            
            // Add all valid solutions from this path
            for (const step3Match of step3Matches) {
                const solution = [startingWord, step1Match.word, step2Match.word, step3Match.word];
                solutions.push({solution, totalOverlap: step3Match.totalOverlap});
                
                // Update max overlap if this solution has a higher overlap
                if (step3Match.totalOverlap > maxOverlap) {
                    maxOverlap = step3Match.totalOverlap;
                    // Update progress info
                    updateProgress(solutions.length, maxOverlap);
                }
                
                // Check if we've reached the limit
                if (maxSolutions !== null && solutions.length >= maxSolutions) {
                    console.log(`Reached limit of ${maxSolutions} solutions!`);
                    return solutions;
                }
            }
        }
    }
    
    console.log(`Search complete! Found ${solutions.length} solutions.`);
    return solutions;
}

// Display solutions
function displaySolutions(solutions, rules, maxPrint) {
    if (solutions.length === 0) {
        resultsSection.style.display = 'none';
        alert('No solutions found. Try different rules or starting word.');
        return;
    }
    
    resultsSection.style.display = 'block';
    resultsCount.textContent = `${solutions.length} solutions found`;
    
    // Sort solutions by total overlap (highest first)
    solutions.sort((a, b) => b.totalOverlap - a.totalOverlap);
    
    // Limit the number of solutions to print
    const solutionsToPrint = solutions.slice(0, maxPrint);
    
    solutionsContainer.innerHTML = solutionsToPrint.map((solutionData, index) => {
        const {solution, totalOverlap} = solutionData;
        
        // Use different colors for different ranks
        let rankColor = '#10b981'; // green
        let medal = '🥇';
        if (index === 1) {
            rankColor = '#f59e0b'; // yellow
            medal = '🥈';
        } else if (index === 2) {
            rankColor = '#ef4444'; // red
            medal = '🥉';
        } else if (index > 2) {
            rankColor = '#06b6d4'; // cyan
            medal = '  ';
        }
        
        return `
            <div class="solution-item">
                <div class="solution-path" style="color: ${rankColor}">
                    ${medal} ${index + 1}. ${solution[0].toUpperCase()} → ${solution[1].toUpperCase()} → ${solution[2].toUpperCase()} → ${solution[3].toUpperCase()}
                </div>
                <div style="text-align: center;">
                    <span class="solution-overlap">Total Overlap: ${totalOverlap}</span>
                </div>
            </div>
        `;
    }).join('');
    
    if (maxPrint < solutions.length) {
        solutionsContainer.innerHTML += `
            <div style="text-align: center; color: #6b7280; font-style: italic; margin-top: 20px;">
                ... and ${solutions.length - maxPrint} more solutions
            </div>
        `;
    }
}

// Update progress information
function updateProgress(solutionCount, maxOverlap) {
    progressInfo.textContent = `${solutionCount} solutions found (max overlap: ${maxOverlap})`;
}

// Show loading state
function showLoading() {
    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    progressInfo.textContent = 'Starting search...';
}

// Hide loading state
function hideLoading() {
    loadingSection.style.display = 'none';
}

// Utility functions (same as script.js)

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