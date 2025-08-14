// ==== DOM Elements ====
const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

// ==== Firebase Auth State ====
let currentUser = null;
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadTransactions();
  } else {
    window.location.href = "login.html"; // redirect if not logged in
  }
});

// ==== Transactions Array ====
let transactions = [];

// ==== Add Transaction ====
function addTransaction(e) {
  e.preventDefault();
  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add text and amount');
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value
    };

    transactions.push(transaction);
    addTransactionDOM(transaction);
    updateValues();
    saveTransactions();

    text.value = '';
    amount.value = '';
  }
}

// ==== Generate Random ID ====
function generateID() {
  return Math.floor(Math.random() * 1000000000);
}

// ==== Add Transaction to DOM ====
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

// ==== Update Balance, Income, Expense ====
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);
  const total = amounts.reduce((acc, item) => acc += item, 0).toFixed(2);
  const income = amounts.filter(item => item > 0)
    .reduce((acc, item) => acc += item, 0).toFixed(2);
  const expense = (amounts.filter(item => item < 0)
    .reduce((acc, item) => acc += item, 0) * -1).toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `₹${income}`;
  money_minus.innerText = `₹${expense}`;
}

// ==== Remove Transaction ====
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  saveTransactions();
  Init();
}

// ==== Save to Firebase ====
function saveTransactions() {
  if (currentUser) {
    firebase.database().ref('users/' + currentUser.uid + '/transactions')
      .set(transactions);
  }
}

// ==== Load from Firebase ====
function loadTransactions() {
  if (currentUser) {
    firebase.database().ref('users/' + currentUser.uid + '/transactions')
      .once('value')
      .then(snapshot => {
        transactions = snapshot.val() || [];
        Init();
      });
  }
}

// ==== Init App ====
function Init() {
  list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

// ==== Event Listeners ====
form.addEventListener('submit', addTransaction);

