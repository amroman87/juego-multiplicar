const TOTAL_QUESTIONS = 10;
const TABLES = Array.from({ length: 12 }, (_, index) => index + 1);

const state = {
  selectedTables: new Set(),
  questions: [],
  currentIndex: 0,
  aciertos: 0,
  errores: 0,
  answers: [],
};

const elements = {
  setupScreen: document.getElementById('setup-screen'),
  gameScreen: document.getElementById('game-screen'),
  resultsScreen: document.getElementById('results-screen'),
  tableGrid: document.getElementById('table-grid'),
  startGameBtn: document.getElementById('start-game-btn'),
  selectAllBtn: document.getElementById('select-all-btn'),
  clearBtn: document.getElementById('clear-btn'),
  questionCounter: document.getElementById('question-counter'),
  scoreLabel: document.getElementById('score-label'),
  mistakesLabel: document.getElementById('mistakes-label'),
  progressFill: document.getElementById('progress-fill'),
  questionText: document.getElementById('question-text'),
  answerForm: document.getElementById('answer-form'),
  answerInput: document.getElementById('answer-input'),
  checkBtn: document.getElementById('check-btn'),
  nextBtn: document.getElementById('next-btn'),
  feedback: document.getElementById('feedback'),
  resultTitle: document.getElementById('results-title'),
  resultCorrect: document.getElementById('result-correct'),
  resultErrors: document.getElementById('result-errors'),
  resultPercent: document.getElementById('result-percent'),
  summaryBody: document.getElementById('summary-body'),
  restartBtn: document.getElementById('restart-btn'),
};

function initializeApp() {
  renderTableButtons();
  bindEvents();
  updateStartButtonState();
  showScreen('setup');
}

function bindEvents() {
  elements.selectAllBtn.addEventListener('click', selectAllTables);
  elements.clearBtn.addEventListener('click', clearSelection);
  elements.startGameBtn.addEventListener('click', startGame);
  elements.answerForm.addEventListener('submit', handleAnswerSubmit);
  elements.nextBtn.addEventListener('click', goToNextQuestion);
  elements.restartBtn.addEventListener('click', restartGame);
}

function renderTableButtons() {
  elements.tableGrid.innerHTML = '';

  TABLES.forEach((tableNumber) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'table-btn';
    button.textContent = `Tabla del ${tableNumber}`;
    button.setAttribute('aria-pressed', String(state.selectedTables.has(tableNumber)));

    if (state.selectedTables.has(tableNumber)) {
      button.classList.add('selected');
    }

    button.addEventListener('click', () => {
      toggleTableSelection(tableNumber);
    });

    elements.tableGrid.appendChild(button);
  });
}

function toggleTableSelection(tableNumber) {
  if (state.selectedTables.has(tableNumber)) {
    state.selectedTables.delete(tableNumber);
  } else {
    state.selectedTables.add(tableNumber);
  }

  renderTableButtons();
  updateStartButtonState();
}

function selectAllTables() {
  state.selectedTables = new Set(TABLES);
  renderTableButtons();
  updateStartButtonState();
}

function clearSelection() {
  state.selectedTables.clear();
  renderTableButtons();
  updateStartButtonState();
}

function updateStartButtonState() {
  const hasSelection = state.selectedTables.size > 0;
  elements.startGameBtn.disabled = !hasSelection;
}

function showScreen(screenName) {
  const screens = {
    setup: elements.setupScreen,
    game: elements.gameScreen,
    results: elements.resultsScreen,
  };

  Object.entries(screens).forEach(([name, element]) => {
    element.classList.toggle('active', name === screenName);
  });
}

function startGame() {
  if (state.selectedTables.size === 0) {
    return;
  }

  state.questions = generateQuestions(state.selectedTables, TOTAL_QUESTIONS);
  state.currentIndex = 0;
  state.aciertos = 0;
  state.errores = 0;
  state.answers = [];

  showScreen('game');
  renderGameQuestion();
}

function generateQuestions(selectedTables, totalQuestions) {
  const questions = [];
  const usedMultiplications = new Set();

  while (questions.length < totalQuestions) {
    const firstFactor = getRandomItemFromSet(selectedTables);
    const secondFactor = randomNumber(1, 10);
    const multiplicationKey = `${firstFactor}x${secondFactor}`;

    if (!usedMultiplications.has(multiplicationKey)) {
      usedMultiplications.add(multiplicationKey);
      questions.push({
        firstFactor,
        secondFactor,
        answer: firstFactor * secondFactor,
      });
    }
  }

  return questions;
}

function getRandomItemFromSet(set) {
  const values = Array.from(set);
  return values[randomNumber(0, values.length - 1)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderGameQuestion() {
  const currentQuestion = state.questions[state.currentIndex];
  const questionNumber = state.currentIndex + 1;

  elements.questionCounter.textContent = `Pregunta ${questionNumber} de ${TOTAL_QUESTIONS}`;
  elements.questionText.textContent = `${currentQuestion.firstFactor} × ${currentQuestion.secondFactor} = ?`;
  elements.scoreLabel.textContent = `Aciertos: ${state.aciertos}`;
  elements.mistakesLabel.textContent = `Errores: ${state.errores}`;
  elements.progressFill.style.width = `${(questionNumber / TOTAL_QUESTIONS) * 100}%`;

  elements.feedback.textContent = '';
  elements.feedback.className = 'feedback';
  elements.feedback.setAttribute('aria-live', 'polite');

  elements.answerInput.value = '';
  elements.answerInput.disabled = false;
  elements.checkBtn.disabled = false;
  elements.nextBtn.hidden = true;

  elements.answerInput.focus();
}

function handleAnswerSubmit(event) {
  event.preventDefault();

  const rawValue = elements.answerInput.value.trim();
  if (rawValue === '') {
    showFeedback('Escribe una respuesta antes de continuar.', 'error');
    elements.answerInput.focus();
    return;
  }

  const userAnswer = Number(rawValue);
  const currentQuestion = state.questions[state.currentIndex];
  const isCorrect = userAnswer === currentQuestion.answer;

  elements.answerInput.disabled = true;
  elements.checkBtn.disabled = true;

  if (isCorrect) {
    state.aciertos += 1;
    showFeedback('¡Correcto! 🎉', 'correct');
  } else {
    state.errores += 1;
    showFeedback(`Incorrecto. La respuesta correcta era ${currentQuestion.answer}.`, 'error');
  }

  state.answers[state.currentIndex] = {
    question: `${currentQuestion.firstFactor} × ${currentQuestion.secondFactor}`,
    userAnswer,
    correctAnswer: currentQuestion.answer,
    isCorrect,
  };

  elements.scoreLabel.textContent = `Aciertos: ${state.aciertos}`;
  elements.mistakesLabel.textContent = `Errores: ${state.errores}`;
  elements.nextBtn.hidden = false;
}

function showFeedback(message, type) {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback visible ${type}`;
}

function goToNextQuestion() {
  if (state.currentIndex < TOTAL_QUESTIONS - 1) {
    state.currentIndex += 1;
    renderGameQuestion();
    return;
  }

  showResults();
}

function showResults() {
  const totalAnswers = state.answers.length;
  const percentage = totalAnswers > 0 ? Math.round((state.aciertos / totalAnswers) * 100) : 0;

  elements.resultCorrect.textContent = String(state.aciertos);
  elements.resultErrors.textContent = String(state.errores);
  elements.resultPercent.textContent = `${percentage}%`;

  const resultMessage = getResultMessage(percentage);
  elements.resultTitle.textContent = resultMessage;

  renderSummaryTable();
  showScreen('results');
}

function getResultMessage(percentage) {
  if (percentage >= 80) {
    return '¡Muy bien! 🎉';
  }

  if (percentage >= 50) {
    return '¡Buen trabajo! 👍';
  }

  return '¡Sigue practicando! 💪';
}

function renderSummaryTable() {
  elements.summaryBody.innerHTML = '';

  state.questions.forEach((question, index) => {
    const answerRecord = state.answers[index] || {
      userAnswer: '—',
      correctAnswer: question.answer,
      isCorrect: false,
    };

    const row = document.createElement('tr');
    const resultText = answerRecord.isCorrect ? 'Correcto' : 'Incorrecto';
    const resultClass = answerRecord.isCorrect ? 'result-good' : 'result-bad';

    row.innerHTML = `
      <td>${index + 1}. ${question.firstFactor} × ${question.secondFactor}</td>
      <td>${answerRecord.userAnswer}</td>
      <td>${answerRecord.correctAnswer}</td>
      <td class="${resultClass}">${resultText}</td>
    `;

    elements.summaryBody.appendChild(row);
  });
}

function restartGame() {
  state.currentIndex = 0;
  state.aciertos = 0;
  state.errores = 0;
  state.answers = [];
  state.questions = [];

  elements.answerInput.value = '';
  elements.feedback.textContent = '';
  elements.feedback.className = 'feedback';
  elements.nextBtn.hidden = true;

  renderTableButtons();
  updateStartButtonState();
  showScreen('setup');
}

initializeApp();
