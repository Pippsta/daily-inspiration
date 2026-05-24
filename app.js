// =============================================================
//  app.js — the BEHAVIOR of the app.
//  This is where things happen: picking the quote, reacting to
//  clicks, and remembering your favorites.
// =============================================================

// --- Grab the parts of the page we need to talk to ----------
// (These come from the id="..." attributes in index.html.)
const dateEl        = document.getElementById("date");
const quoteTextEl   = document.getElementById("quote-text");
const quoteSourceEl = document.getElementById("quote-source");
const favoriteIcon  = document.getElementById("favorite-icon");

const anotherBtn      = document.getElementById("another-btn");
const favoriteBtn     = document.getElementById("favorite-btn");
const backBtn         = document.getElementById("back-btn");
const showFavoritesBtn= document.getElementById("show-favorites-btn");
const showQuoteBtn    = document.getElementById("show-quote-btn");

const quoteView    = document.getElementById("quote-view");
const favoritesView= document.getElementById("favorites-view");
const favoritesList= document.getElementById("favorites-list");
const favoritesEmpty=document.getElementById("favorites-empty");
const cardEl       = document.getElementById("card");

// Which quote is on screen right now (an index into QUOTES).
let currentIndex = 0;

// =============================================================
//  PICKING THE DAILY QUOTE
//  We want the SAME quote all day, then a new one tomorrow.
//  Trick: turn today's date into a number (days since 1970),
//  then use the remainder (%) to land on a spot in the list.
// =============================================================
function getDailyIndex() {
  const now = new Date();
  // Count whole days since Jan 1 1970. (86,400,000 ms in a day.)
  const dayNumber = Math.floor(now.getTime() / 86400000);
  // "% QUOTES.length" wraps the number back into the list range,
  // so we always get a valid position (0 to length-1).
  return dayNumber % QUOTES.length;
}

// =============================================================
//  SHOWING A QUOTE ON SCREEN
// =============================================================
function showQuote(index) {
  currentIndex = index;
  const quote = QUOTES[index];

  quoteTextEl.textContent   = quote.text;
  quoteSourceEl.textContent = "— " + quote.source;

  updateFavoriteIcon();
  fadeIn();
}

// A gentle fade-in each time the quote changes. We remove then
// re-add a CSS class to restart the animation.
function fadeIn() {
  quoteView.classList.remove("fade");
  void quoteView.offsetWidth; // forces the browser to "notice" the change
  quoteView.classList.add("fade");
}

// =============================================================
//  FAVORITES — saved in localStorage so they survive a refresh.
//  We identify a quote by its text (simple and good enough here).
// =============================================================
function loadFavorites() {
  const saved = localStorage.getItem("favorites");
  // If nothing saved yet, start with an empty list.
  return saved ? JSON.parse(saved) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(quoteText) {
  return loadFavorites().includes(quoteText);
}

function toggleFavorite() {
  const quoteText = QUOTES[currentIndex].text;
  let favorites = loadFavorites();

  if (favorites.includes(quoteText)) {
    // Remove it: keep everything that ISN'T this quote.
    favorites = favorites.filter(function (t) { return t !== quoteText; });
  } else {
    favorites.push(quoteText);
  }

  saveFavorites(favorites);
  updateFavoriteIcon();
}

// Filled heart = favorited, hollow heart = not.
function updateFavoriteIcon() {
  if (isFavorite(QUOTES[currentIndex].text)) {
    favoriteIcon.textContent = "♥";
    favoriteBtn.classList.add("active");
  } else {
    favoriteIcon.textContent = "♡";
    favoriteBtn.classList.remove("active");
  }
}

// =============================================================
//  THE FAVORITES LIST VIEW
// =============================================================
function renderFavorites() {
  const favorites = loadFavorites();
  favoritesList.innerHTML = ""; // clear whatever was there before

  if (favorites.length === 0) {
    favoritesEmpty.classList.remove("hidden");
    return;
  }
  favoritesEmpty.classList.add("hidden");

  favorites.forEach(function (text) {
    // Find the full quote (to also show its source).
    const quote = QUOTES.find(function (q) { return q.text === text; });
    const source = quote ? quote.source : "Unknown";

    const li = document.createElement("li");
    li.className = "fav-item";
    li.innerHTML =
      '<blockquote>' + text + '</blockquote>' +
      '<span class="fav-source">— ' + source + '</span>';

    // A button to un-star this favorite.
    const removeBtn = document.createElement("button");
    removeBtn.className = "fav-remove";
    removeBtn.textContent = "♥";
    removeBtn.title = "Remove from favorites";
    removeBtn.addEventListener("click", function () {
      let favs = loadFavorites().filter(function (t) { return t !== text; });
      saveFavorites(favs);
      renderFavorites();   // refresh the list
      updateFavoriteIcon(); // in case the removed one is on screen
    });

    li.appendChild(removeBtn);
    favoritesList.appendChild(li);
  });
}

// =============================================================
//  SWITCHING BETWEEN VIEWS (quote  <->  favorites)
// =============================================================
function openFavorites() {
  renderFavorites();
  quoteView.classList.add("hidden");
  favoritesView.classList.remove("hidden");
  showFavoritesBtn.classList.add("hidden");
  showQuoteBtn.classList.remove("hidden");
}

function openQuote() {
  favoritesView.classList.add("hidden");
  quoteView.classList.remove("hidden");
  showQuoteBtn.classList.add("hidden");
  showFavoritesBtn.classList.remove("hidden");
  updateFavoriteIcon();
}

// =============================================================
//  WIRING UP THE BUTTONS (what each click does)
// =============================================================

// "Show me another": pick a RANDOM quote that isn't the one
// already showing, and reveal the "Back to today" link.
anotherBtn.addEventListener("click", function () {
  let next = currentIndex;
  if (QUOTES.length > 1) {
    while (next === currentIndex) {
      next = Math.floor(Math.random() * QUOTES.length);
    }
  }
  showQuote(next);
  backBtn.classList.remove("hidden");
});

// "Back to today": return to the official daily quote.
backBtn.addEventListener("click", function () {
  showQuote(getDailyIndex());
  backBtn.classList.add("hidden");
});

favoriteBtn.addEventListener("click", toggleFavorite);
showFavoritesBtn.addEventListener("click", openFavorites);
showQuoteBtn.addEventListener("click", openQuote);

// =============================================================
//  START THE APP
// =============================================================
function init() {
  // Show today's date, nicely formatted, e.g. "Friday, 23 May 2026".
  dateEl.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // Safety net: if quotes.js is empty or missing.
  if (typeof QUOTES === "undefined" || QUOTES.length === 0) {
    quoteTextEl.textContent = "No quotes found. Add some in quotes.js!";
    return;
  }

  showQuote(getDailyIndex());
}

init();
