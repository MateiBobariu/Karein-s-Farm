(() => {
  'use strict';

  const cases = [
    {
      setting: 'Something’s fishy at the henhouse',
      clue: 'Fresh eggs are missing! The thief left tiny pawprints with a very bushy tail mark at the end.',
      suspects: [
        { name: 'Chicken', image: 'assets/chicken.jpg', role: 'FARM FRIEND', note: 'Three little toe marks and a feather. This bird lays eggs — and is very offended by the accusation.' },
        { name: 'Fox', image: 'assets/fox.jpg', role: 'WILD ONE', note: 'Four pawprints, a sweep of orange fur, and one very bushy tail. This trail leads straight to the egg basket.' },
        { name: 'Cow', image: 'assets/cow.jpg', role: 'FARM FRIEND', note: 'Two wide hoofprints beside a daisy. This suspect was happily grazing in the meadow.' }
      ],
      answer: 'Fox',
      success: 'Aha! That bushy-tail clue gave the fox away.'
    },
    {
      setting: 'A woolly disguise in the orchard',
      clue: 'Someone snuck through the orchard at midnight. There’s grey fur tucked inside a bit of sheep’s wool.',
      suspects: [
        { name: 'Cow', image: 'assets/cow.jpg', role: 'FARM FRIEND', note: 'A broad hoofprint and a mouthful of clover. This suspect was nowhere near the orchard.' },
        { name: 'Wolf', image: 'assets/wolf.jpg', role: 'WILD ONE', note: 'Big pawprints, grey fur, and a sheep costume caught on a branch. Nice try, wolf.' },
        { name: 'Chicken', image: 'assets/chicken.jpg', role: 'FARM FRIEND', note: 'Tiny tracks lead back to the warm henhouse. This suspect was tucked in for the night.' }
      ],
      answer: 'Wolf',
      success: 'Case cracked! That woolly disguise belongs to the wolf.'
    },
    {
      setting: 'The midnight hayloft shuffle',
      clue: 'Something climbed into the hayloft and left orange hairs on the ladder. The culprit has paws and a very bushy tail.',
      suspects: [
        { name: 'Fox', image: 'assets/fox.jpg', role: 'WILD ONE', note: 'Orange hairs on the ladder and light pawprints. This fox was sneaking around the loft.' },
        { name: 'Chicken', image: 'assets/chicken.jpg', role: 'FARM FRIEND', note: 'A feather on the hay and little bird tracks. This suspect can’t climb like a cat burglar.' },
        { name: 'Cow', image: 'assets/cow.jpg', role: 'FARM FRIEND', note: 'A hoofprint in the straw and a sleepy snore from the meadow. Not our howler.' }
      ],
      answer: 'Fox',
      success: 'Well spotted! The fox was making a very convincing howl.'
    }
  ];

  const rewardKey = 'karinsFarmDetectiveDiscount';
  const rewardCode = 'HAYBALE10';
  const grid = document.getElementById('suspect-grid');
  const accuse = document.getElementById('accuse-button');
  const message = document.getElementById('case-message');
  if (!grid || !accuse || !message) return;

  let stage = 0;
  let selectedName = '';
  let completed = 0;
  const inspected = new Set();

  function updateProgress() {
    document.getElementById('case-number').textContent = String(stage + 1).padStart(2, '0');
    document.getElementById('score').textContent = completed;
    document.getElementById('case-setting').textContent = cases[stage].setting;
    document.getElementById('case-clue').textContent = cases[stage].clue;
    document.getElementById('inspect-count').textContent = inspected.size + ' / 3 inspected';
    document.querySelectorAll('#case-progress i').forEach((pin, index) => {
      pin.classList.toggle('active', index === stage);
      pin.classList.toggle('done', index < stage);
    });
  }

  function renderStage() {
    const current = cases[stage];
    selectedName = '';
    inspected.clear();
    grid.classList.remove('locked');
    grid.replaceChildren();
    message.className = '';
    message.textContent = 'Inspect all three dossiers, then choose the wild impostor.';
    accuse.disabled = true;
    accuse.textContent = 'Make your accusation →';
    updateProgress();

    current.suspects.forEach((suspect) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'suspect-card';
      card.setAttribute('aria-pressed', 'false');

      const role = document.createElement('span');
      role.className = 'suspect-role';
      role.textContent = suspect.role;
      const image = document.createElement('img');
      image.src = suspect.image;
      image.alt = suspect.name + ' character illustration';
      const name = document.createElement('span');
      name.className = 'suspect-name';
      name.append(document.createTextNode(suspect.name));
      const prompt = document.createElement('small');
      prompt.textContent = 'Tap to inspect ↘';
      name.append(prompt);
      const note = document.createElement('span');
      note.className = 'field-note';
      note.hidden = true;

      card.append(role, image, name, note);
      card.addEventListener('click', () => {
        if (grid.classList.contains('locked')) return;
        if (!inspected.has(suspect.name)) {
          inspected.add(suspect.name);
          note.hidden = false;
          note.textContent = suspect.note;
          prompt.textContent = 'Field notes checked ✓';
          updateProgress();
        }
        grid.querySelectorAll('.suspect-card').forEach((item) => {
          item.classList.remove('selected');
          item.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        selectedName = suspect.name;
        accuse.disabled = inspected.size !== current.suspects.length;
        message.textContent = inspected.size === current.suspects.length
          ? suspect.name + ' is your pick. Ready to accuse?'
          : 'Keep checking the other dossiers before you accuse.';
      });
      grid.append(card);
    });
  }

  function showReward() {
    try {
      localStorage.setItem(rewardKey, rewardCode);
    } catch (error) {
      // The code remains visible if browser storage is unavailable.
    }

    const board = document.querySelector('.case-board');
    board.innerHTML = '';
    const result = document.createElement('div');
    result.className = 'result-card';
    result.innerHTML = '<div class="result-medal">✷</div><div class="eyebrow"><span class="pill-dot"></span> All three cases solved</div><h2>Golden Haybale Detective!</h2><p>Every wild one unmasked. The farm is safe because of you!</p><div class="result-score"><b>3</b><span>out of 3<br>cases solved</span></div><div class="discount-reward"><span>YOUR FARMYARD REWARD</span><strong>10% OFF</strong><p>Save this code and use it when Karin’s Farm ordering opens.</p><code></code><button class="button button-ink copy-reward" type="button">Copy discount code</button><span class="copy-status" role="status"></span></div><a class="result-link" href="shop.html">Visit the farm shop →</a><button class="button button-cream play-again" type="button">Play again ↻</button>';
    result.querySelector('code').textContent = rewardCode;
    board.append(result);

    const copyButton = result.querySelector('.copy-reward');
    copyButton.addEventListener('click', async () => {
      const status = result.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText(rewardCode);
        status.textContent = 'Copied! Keep it safe for ordering day.';
      } catch (error) {
        status.textContent = 'Your code is ' + rewardCode + ' — write it down for ordering day.';
      }
    });
    result.querySelector('.play-again').addEventListener('click', () => window.location.reload());
  }

  accuse.addEventListener('click', () => {
    if (accuse.disabled || !selectedName) return;
    const current = cases[stage];
    if (selectedName !== current.answer) {
      message.className = 'message-oops';
      message.textContent = 'Not quite — ' + current.answer + ' was the wild one. Check the notes and try another suspect.';
      grid.querySelectorAll('.suspect-card').forEach((card) => {
        if (card.querySelector('.suspect-name').firstChild.textContent.trim() === current.answer) {
          card.classList.add('revealed-impostor');
        }
      });
      return;
    }

    completed += 1;
    grid.classList.add('locked');
    grid.querySelectorAll('.suspect-card').forEach((card) => {
      card.disabled = true;
      if (card.querySelector('.suspect-name').firstChild.textContent.trim() === current.answer) {
        card.classList.add('revealed-impostor');
      }
    });
    message.className = 'message-good';
    message.textContent = current.success;
    document.getElementById('score').textContent = completed;

    if (stage === cases.length - 1) {
      window.setTimeout(showReward, 650);
      return;
    }
    accuse.disabled = false;
    accuse.innerHTML = 'Next case <span>→</span>';
    accuse.onclick = () => {
      stage += 1;
      renderStage();
    };
  });

  renderStage();
})();
