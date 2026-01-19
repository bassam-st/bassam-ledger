const list = document.getElementById('list');
let data = JSON.parse(localStorage.getItem('ledger')) || [];

function render() {
  list.innerHTML = '';
  data.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `${item.desc} - ${item.amount}`;
    list.appendChild(li);
  });
}

function addEntry() {
  const desc = document.getElementById('desc').value;
  const amount = document.getElementById('amount').value;

  if (!desc || !amount) return;

  data.push({ desc, amount });
  localStorage.setItem('ledger', JSON.stringify(data));
  render();

  document.getElementById('desc').value = '';
  document.getElementById('amount').value = '';
}

render();
