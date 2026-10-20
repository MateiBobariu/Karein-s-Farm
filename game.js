const cases = [
  {
    setting: 'Something’s fishy at the henhouse',
    clue: 'Fresh eggs are missing! The thief left tiny pawprints with a very bushy tail mark at the end.',
    suspects: [
      { name: 'Chicken', image: 'assets/chicken.jpg', role: 'FARM FRIEND', note: 'Three little toe marks and a feather. This bird lays eggs — and is very offended by the accusation.' },
      { name: 'Fox', image: 'assets/fox.jpg', role: 'WILD ONE', note: 'Four pawprints, a sweep of orange fur, and one very bushy tail. This trail leads straight to the egg basket!' },
      { name: 'Cow', image: 'assets/cow.jpg', role: 'FARM FRIEND', note: 'Two wide hoofprints beside a daisy. This suspect was happily grazing in the meadow.' }
    ], answer: 'Fox', success: 'Aha! That bushy-tail clue gave the fox away.'
  },
  {
    setting: 'A woolly disguise in the orchard',
    clue: 'Someone snuck through the orchard at midnight. There’s grey fur tucked inside a bit of sheep’s wool.',
    suspects: [
      { name: 'Cow', image: 'assets/cow.jpg', role: 'FARM FRIEND', note: 'A broad hoofprint and a mouthful of clover. This suspect was nowhere near the orchard.' },
      { name: 'Wolf', image: 'assets/wolf.jpg', role: 'WILD ONE', note: 'Big pawprints, grey fur, and a sheep costume caught on a branch. Nice try, wolf!' },
      { name: 'Chicken', image: 'assets/chicken.jpg', role: 'FARM FRIEND', note: 'Tiny tracks lead back to the warm henhouse. This suspect was tucked in for the night.' }
    ], answer: 'Wolf', success: 'Case cracked! That woolly disguise belongs to the wolf.'
  },
  {
    setting: 'The midnight hayloft shuffle',
    clue: 'Something climbed into the hayloft and left orange hairs on the ladder. The culprit has paws and a very bushy tail.',
    suspects: [
      { name: 'Fox', image: 'assets/fox.jpg', role: 'WILD ONE', note: 'Orange hairs on the ladder and light pawprints. This fox was sneaking around the loft.' },
      { name: 'Chicken', image: 'assets/chicken.jpg', role: 'FARM FRIEND', note: 'A feather on the hay and little bird tracks. This suspect can’t climb like a cat burglar.' },
      { name: 'Cow', image: 'assets/cow.jpg', role: 'FARM FRIEND', note: 'A hoofprint in the straw and a sleepy snore from the meadow. Not our howler.' }
    ], answer: 'Fox', success: 'Well spotted! The fox was making a very convincing howl.'
  }
];

let round = 0;
let score = 0;
let chosen = null;
let resolved = false;
const inspected = new Set();
const grid = document.getElementById('suspect-grid');
const clue = document.getElementById('case-clue');
const message = document.getElementById('case-message');
const accuse = document.getElementById('accuse-button');

function renderCase() {
  const current = cases[round];
  chosen = null;
  resolved = false;
  inspected.clear();
  document.getElementById('case-number').textContent = String(round + 1).padStart(2, '0');
  document.getElementById('score').textContent = score;
  document.getElementById('case-setting').textContent = current.setting;
  clue.textContent = current.clue;
  message.textContent = 'Inspect the dossiers, detective.';
  message.className = '';
  accuse.disabled = true;
  accuse.textContent = 'Make your accusation →';
  document.getElementById('inspect-count').textContent = '0 / 3 inspected';
  document.querySelectorAll('#case-progress i').forEach((pin, index) => {
    pin.classList.toggle('active', index <= round);
    pin.classList.remove('done');
    if (index < round) pin.classList.add('done');
  });
  grid.innerHTML = '';
  current.suspects.forEach((suspect, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'suspect-card';
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `<span class="suspect-role">${suspect.role}</span><img src="${suspect.image}" alt=""><span class="suspect-name">${suspect.name}<small>Tap to inspect ↘</small></span><span class="field-note" hidden></span>`;
    card.addEventListener('click', () => {
      if (grid.classList.contains('locked')) return;
      if (card.classList.contains('inspected')) {
        grid.querySelectorAll('.suspect-card').forEach(item => {
          item.classList.remove('selected'); item.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        chosen = suspect.name;
        accuse.disabled = false;
        message.textContent = `${suspect.name} is your pick. Ready to accuse?`;
        return;
      }
      card.classList.add('inspected');
      card.querySelector('.field-note').hidden = false;
      card.querySelector('.field-note').textContent = suspect.note;
      card.querySelector('.suspect-name small').textContent = 'Field notes checked ✓';
      inspected.add(index);
      document.getElementById('inspect-count').textContent = `${inspected.size} / 3 inspected`;
      message.textContent = `Field notes added. ${3 - inspected.size ? `${3 - inspected.size} more dossier${inspected.size === 2 ? '' : 's'} to check.` : 'Now choose the suspect who fits the clue.'}`;
    });
    grid.appendChild(card);
  });
}

accuse.addEventListener('click', () => {
  if (resolved) {
    if (round < cases.length - 1) { round++; renderCase(); }
    else renderResult();
    return;
  }
  if (!chosen) return;
  resolved = true;
  const current = cases[round];
  const correct = chosen === current.answer;
  if (correct) score++;
  document.getElementById('score').textContent = score;
  grid.classList.add('locked');
  grid.querySelectorAll('.suspect-card').forEach(card => {
    if (card.querySelector('.suspect-name').firstChild.textContent.trim() === current.answer) card.classList.add('revealed-impostor');
    card.disabled = true;
  });
  message.textContent = correct ? current.success : `Not quite — ${current.answer} was the wild one. ${current.success}`;
  message.className = correct ? 'message-good' : 'message-oops';
  accuse.innerHTML = round < cases.length - 1 ? 'Next case <span>→</span>' : 'See your detective grade <span>→</span>';
  accuse.disabled = false;
});

function renderResult() {
  const board = document.querySelector('.case-board');
  const grade = score === 3 ? 'Golden Haybale Detective!' : score === 2 ? 'Top-notch Barn Sleuth!' : score === 1 ? 'Junior Clue Sniffer!' : 'The impostors got away!';
  const cheer = score === 3 ? 'Every wild one unmasked. The farm is safe because of you!' : 'The barnyard is full of clever disguises. Fancy another go?';
  board.innerHTML = `<div class="result-card"><div class="result-medal">${score === 3 ? '✷' : '✳'}</div><div class="eyebrow"><span class="pill-dot"></span> Investigation complete</div><h2>${grade}</h2><p>${cheer}</p><div class="result-score"><b>${score}</b><span>out of 3<br>good guesses</span></div><button class="button button-ink" id="play-again">Play again <span>↻</span></button><a class="result-link" href="shop.html">Meet the full game deck →</a></div>`;
  document.getElementById('play-again').addEventListener('click', () => window.location.reload());
}

renderCase();
