/**
 * Club Enrollment Quiz
 * Vanilla JS Implementation
 */

// Questions Data Model
const questions = [
    {
        id: 1,
        topic: 'HTML',
        question: 'Which HTML5 element is semantically correct for the main content of a document?',
        options: [
            'section',
            'main',
            'content',
            'article'
        ],
        correct: 1 // <main>
    },
    {
        id: 2,
        topic: 'CSS',
        question: 'What property is used to change the stacking order of positioned elements?',
        options: [
            'z-index',
            'order',
            'stack-level',
            'position-index'
        ],
        correct: 0 // z-index
    },
    {
        id: 3,
        topic: 'JavaScript',
        question: 'Which method creates a new array by calling a function on every element in the calling array?',
        options: [
            'filter()',
            'forEach()',
            'map()',
            'reduce()'
        ],
        correct: 2 // map()
    },
    {
        id: 4,
        topic: 'CSS',
        question: 'In Flexbox, which property aligns items along the cross axis?',
        options: [
            'justify-content',
            'align-items',
            'flex-direction',
            'align-content'
        ],
        correct: 1 // align-items
    },
    {
        id: 5,
        topic: 'HTML',
        question: 'What is the correct purpose of the <alt> attribute on an <img> tag?',
        options: [
            'Tooltip text on hover',
            'Styling the image border',
            'Alternative text for screen readers',
            'Caption below the image'
        ],
        correct: 2 // Alternative text
    },
    {
        id: 6,
        topic: 'JavaScript',
        question: 'What is the result of typeof null in JavaScript?',
        options: [
            '"null"',
            '"undefined"',
            '"object"',
            '"number"'
        ],
        correct: 2 // "object" (infamous bug)
    },
    {
        id: 7,
        topic: 'CSS',
        question: 'Which unit is relative to the font-size of the root element (html)?',
        options: [
            'em',
            'rem',
            'vh',
            'px'
        ],
        correct: 1 // rem
    },
    {
        id: 8,
        topic: 'JavaScript',
        question: 'How do you check if a property typically exists in an object?',
        options: [
            'obj.has(prop)',
            '"prop" in obj',
            'obj.contains(prop)',
            'obj.exists(prop)'
        ],
        correct: 1 // "prop" in obj
    },
    {
        id: 9,
        topic: 'HTML',
        question: 'Which input type is best for a slider control?',
        options: [
            'type="range"',
            'type="slider"',
            'type="number"',
            'type="controls"'
        ],
        correct: 0 // type="range"
    },
    {
        id: 10,
        topic: 'CSS',
        question: 'What is the default value of the position property?',
        options: [
            'relative',
            'fixed',
            'absolute',
            'static'
        ],
        correct: 3 // static
    }
];

// State
const state = {
    answers: {}, // { questionId: optionIndex }
    isSubmitted: false
};

// DOM Elements
const quizList = document.getElementById('quiz-list');
const submitBtn = document.getElementById('submit-btn');
const progressCount = document.getElementById('progress-count');
const progressFill = document.getElementById('progress-fill');
const bestScoreEl = document.getElementById('header-best-score');
const resultModal = document.getElementById('result-modal');
const retryBtn = document.getElementById('retry-btn');

// Modal Elements
const modalTotalScore = document.getElementById('modal-total-score');
const scoreHtml = document.getElementById('score-html');
const scoreCss = document.getElementById('score-css');
const scoreJs = document.getElementById('score-js');

// Lifecycle
function init() {
    loadPersistedData();
    renderQuiz();
    updateProgress();
}

// Logic: Persistence
function loadPersistedData() {
    const bestScore = localStorage.getItem('quiz_best_score');
    if (bestScore) {
        bestScoreEl.textContent = `${bestScore} / 10`;
    } else {
        bestScoreEl.textContent = '-- / 10';
    }
}

function saveBestScore(score) {
    const currentBest = parseInt(localStorage.getItem('quiz_best_score') || '0');
    if (score > currentBest) {
        localStorage.setItem('quiz_best_score', score);
        bestScoreEl.textContent = `${score} / 10`;
    }
}

// Logic: Rendering
function renderQuiz() {
    quizList.innerHTML = ''; // Clear

    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.id = `q-card-${q.id}`;

        // Topic Badge Color logic
        const topicClass = `topic-${q.topic.toLowerCase()}`;

        card.innerHTML = `
            <div class="card-header">
                <span class="topic-badge ${topicClass}">${q.topic}</span>
            </div>
            <h3 class="question-text">${index + 1}. ${q.question}</h3>
            <div class="options-list">
                ${q.options.map((opt, optIndex) => `
                    <label class="option-label" data-qid="${q.id}" data-idx="${optIndex}">
                        <input type="radio" 
                               name="q-${q.id}" 
                               class="option-input" 
                               value="${optIndex}"
                               ${state.answers[q.id] === optIndex ? 'checked' : ''}
                        >
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>
        `;

        quizList.appendChild(card);
    });

    attachOptionListeners();
}

function attachOptionListeners() {
    const labels = document.querySelectorAll('.option-label');
    labels.forEach(label => {
        label.addEventListener('click', (e) => {
            if (state.isSubmitted) return; // Lock after submit

            // Radio input handles the checked state VISUALLY via CSS mostly,
            // but we need to update state and styling classes
            const input = label.querySelector('input');
            const qId = parseInt(label.dataset.qid);
            const optIdx = parseInt(label.dataset.idx);

            // Update State
            state.answers[qId] = optIdx;

            // Update UI (Visual Selection)
            // Clear selected class from siblings
            const allOptionsInCard = label.parentElement.querySelectorAll('.option-label');
            allOptionsInCard.forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');

            // Checking the radio manually if click didn't hit input directly
            input.checked = true;

            updateProgress();
        });
    });
}

// Logic: Progress & Validation
function updateProgress() {
    const answeredCount = Object.keys(state.answers).length;
    const total = questions.length;

    progressCount.textContent = answeredCount;
    progressFill.style.width = `${(answeredCount / total) * 100}%`;

    // Enable submit if all answered? No, spec says "User CANNOT submit unless all questions are answered", 
    // but on invalid submit we show warning. So button should likely be enabled but validate on click.
    // Or we keep it always enabled and validate. The spec says "On invalid submit... show warning".
    submitBtn.disabled = false;

    // BUT we could hint it. I'll stick to validating on click.
}

function validateAndSubmit() {
    // Check for missing answers
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (state.answers[q.id] === undefined) {
            // Found unanswered
            const card = document.getElementById(`q-card-${q.id}`);

            // Shake animation
            card.classList.remove('error-shake');
            void card.offsetWidth; // Trigger reflow
            card.classList.add('error-shake');

            // Scroll to it
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; // Stop here
        }
    }

    // All good -> Grade it
    gradeQuiz();
}

// Logic: Grading
function gradeQuiz() {
    state.isSubmitted = true;
    let totalScore = 0;
    const topicScores = { HTML: { correct: 0, total: 0 }, CSS: { correct: 0, total: 0 }, JavaScript: { correct: 0, total: 0 } };

    questions.forEach(q => {
        const userAns = state.answers[q.id];
        const isCorrect = userAns === q.correct;
        const topic = q.topic;

        // Stats
        topicScores[topic].total++;
        if (isCorrect) {
            totalScore++;
            topicScores[topic].correct++;
        }

        // VISUAL FEEDBACK
        const card = document.getElementById(`q-card-${q.id}`);
        card.classList.add('graded');

        const options = card.querySelectorAll('.option-label');

        // Highlight correct
        const correctOption = options[q.correct];
        correctOption.classList.add('correct');

        // Highlight wrong if selected
        if (!isCorrect) {
            const wrongOption = options[userAns];
            wrongOption.classList.add('wrong');
        }
    });

    // Save Score
    saveBestScore(totalScore);

    // Show Modal
    showResultModal(totalScore, topicScores);

    // Disable Submit Button
    submitBtn.textContent = 'Assessment Submitted';
    submitBtn.disabled = true;
}

function showResultModal(score, topicStats) {
    modalTotalScore.textContent = score;

    scoreHtml.textContent = `${topicStats.HTML.correct} / ${topicStats.HTML.total}`;
    scoreCss.textContent = `${topicStats.CSS.correct} / ${topicStats.CSS.total}`;
    scoreJs.textContent = `${topicStats.JavaScript.correct} / ${topicStats.JavaScript.total}`;

    resultModal.classList.remove('hidden');
}

function retryQuiz() {
    state.answers = {};
    state.isSubmitted = false;

    // Close Modal
    resultModal.classList.add('hidden');

    // Reset Button
    submitBtn.textContent = 'Submit Assessment';
    submitBtn.disabled = false;

    // Re-render
    renderQuiz();
    updateProgress();

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Event Listeners
submitBtn.addEventListener('click', validateAndSubmit);
retryBtn.addEventListener('click', retryQuiz);

// Initialize
init();
