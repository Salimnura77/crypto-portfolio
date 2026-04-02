const portfolio = [
  {
    id: "btc",
    name: "BTC",
    amount: 0.35,
    buyPrice: 32000,
    currentPrice: 42000,
  },
  {
    id: "eth",
    name: "ETH",
    amount: 1.8,
    buyPrice: 1800,
    currentPrice: 2100,
  },
  {
    id: "sol",
    name: "SOL",
    amount: 12,
    buyPrice: 95,
    currentPrice: 82,
  },
];

const state = {
  filter: "all",
};

const portfolioList = document.querySelector("#portfolioList");
const totalValueEl = document.querySelector("#totalValue");
const totalPnLEl = document.querySelector("#totalPnL");
const totalCoinsEl = document.querySelector("#totalCoins");
const totalCostEl = document.querySelector("#totalCost");
const profitableCountEl = document.querySelector("#profitableCount");
const losingCountEl = document.querySelector("#losingCount");
const coinForm = document.querySelector("#coinForm");
const filterButtons = document.querySelectorAll(".filter");

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (value) => currency.format(value);
const getValue = (coin) => coin.amount * coin.currentPrice;
const getCost = (coin) => coin.amount * coin.buyPrice;
const getPnL = (coin) => getValue(coin) - getCost(coin);
const getPnLPct = (coin) => (getPnL(coin) / Math.max(getCost(coin), 1)) * 100;
const normalizeName = (value) => value.trim().toUpperCase();
const makeId = (value) =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${value}-${Date.now()}`;

const renderPortfolio = () => {
  const profitableCoins = portfolio.filter((coin) => getPnL(coin) > 0);

  const filteredCoins = portfolio.filter((coin) => {
    if (state.filter === "profit") {
      return getPnL(coin) > 0;
    }
    if (state.filter === "loss") {
      return getPnL(coin) < 0;
    }
    return true;
  });

  const listMarkup = filteredCoins
    .map((coin) => {
      const pnl = getPnL(coin);
      const pnlLabel = pnl >= 0 ? "profit" : "loss";
      const pnlText = `${formatCurrency(pnl)} (${getPnLPct(coin).toFixed(1)}%)`;

      return `
        <article class="card">
          <div class="card-head">
            <div class="coin-name">${coin.name}</div>
            <span class="badge ${pnlLabel}">${pnlLabel.toUpperCase()}</span>
          </div>
          <div class="card-grid">
            <div>
              <div class="label">Amount</div>
              <div class="value">${coin.amount}</div>
            </div>
            <div>
              <div class="label">Value</div>
              <div class="value">${formatCurrency(getValue(coin))}</div>
            </div>
            <div>
              <div class="label">P/L</div>
              <div class="value">${pnlText}</div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  portfolioList.innerHTML =
    listMarkup ||
    '<div class="card">No coins match this filter yet.</div>';

  const totalValue = portfolio.reduce((sum, coin) => sum + getValue(coin), 0);
  const totalCost = portfolio.reduce((sum, coin) => sum + getCost(coin), 0);
  const totalPnL = totalValue - totalCost;

  totalValueEl.textContent = formatCurrency(totalValue);
  totalPnLEl.textContent = formatCurrency(totalPnL);
  totalCoinsEl.textContent = portfolio.length.toString();
  totalCostEl.textContent = formatCurrency(totalCost);
  profitableCountEl.textContent = profitableCoins.length.toString();
  losingCountEl.textContent = (portfolio.length - profitableCoins.length).toString();
};

const handleSubmit = (event) => {
  event.preventDefault();

  const name = normalizeName(document.querySelector("#coinName").value);
  const amount = Number.parseFloat(
    document.querySelector("#coinAmount").value
  );
  const buyPrice = Number.parseFloat(document.querySelector("#buyPrice").value);
  const currentPrice = Number.parseFloat(
    document.querySelector("#currentPrice").value
  );

  const newCoin = {
    id: makeId(name),
    name,
    amount,
    buyPrice,
    currentPrice,
  };

  portfolio.unshift(newCoin);
  coinForm.reset();
  renderPortfolio();
};

const setFilter = (event) => {
  const button = event.currentTarget;
  state.filter = button.dataset.filter;

  filterButtons.forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  renderPortfolio();
};

coinForm.addEventListener("submit", handleSubmit);
filterButtons.forEach((button) => button.addEventListener("click", setFilter));

renderPortfolio();
