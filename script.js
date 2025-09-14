// Mock data for demonstration (replace with real API calls)
const mockCards = {
    "Charizard PSA 10": {
        ebayAvg: 250.00,
        collectorCrypt: 220.00,
        courtyard: 235.00,
        arenaClub: 210.00
    },
    "Pikachu CGC 9.5": {
        ebayAvg: 150.00,
        collectorCrypt: 140.00,
        courtyard: 155.00,
        arenaClub: 135.00
    },
    "Mickey Mantle PSA 8": {
        ebayAvg: 5000.00,
        collectorCrypt: null, // Not listed
        courtyard: 4800.00,
        arenaClub: 4900.00
    }
};

const mockDeals = [
    { name: "Charizard PSA 10", price: 210.00, platform: "Arena Club", ebayAvg: 250.00, image: "https://via.placeholder.com/200x150?text=Charizard" },
    { name: "Pikachu CGC 9.5", price: 135.00, platform: "Arena Club", ebayAvg: 150.00, image: "https://via.placeholder.com/200x150?text=Pikachu" },
    { name: "Baseball Rookie PSA 9", price: 300.00, platform: "Courtyard.io", ebayAvg: 350.00, image: "https://via.placeholder.com/200x150?text=Rookie" }
];

// Autocomplete suggestions
const suggestions = Object.keys(mockCards);

// Search function
function searchCard() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    const card = mockCards[query];
    if (!card) {
        alert('Card not found. Try "Charizard PSA 10" or similar.');
        return;
    }

    document.getElementById('card-name').textContent = query;
    const tbody = document.querySelector('#price-table tbody');
    tbody.innerHTML = '';

    // Add rows for each platform
    const platforms = ['collectorCrypt', 'courtyard', 'arenaClub'];
    platforms.forEach(platform => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = platform.replace(/([A-Z])/g, ' $1').trim().toUpperCase(); // e.g., "Collector Crypt"
        const price = card[platform];
        const priceCell = row.insertCell(1);
        if (price) {
            priceCell.textContent = `$${price.toFixed(2)}`;
        } else {
            priceCell.textContent = 'N/A';
        }
        row.insertCell(2).textContent = `$${card.ebayAvg.toFixed(2)}`;
        const dealCell = row.insertCell(3);
        if (price && price < card.ebayAvg) {
            dealCell.textContent = 'Yes';
            dealCell.classList.add('deal-yes');
        } else {
            dealCell.textContent = 'No';
            dealCell.classList.add('deal-no');
        }
    });

    document.getElementById('comparison-section').style.display = 'block';
    document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
}

// Autocomplete
document.getElementById('search-input').addEventListener('input', function() {
    const input = this.value.toLowerCase();
    const auto = document.getElementById('autocomplete');
    auto.innerHTML = '';

    if (input.length < 2) {
        auto.style.display = 'none';
        return;
    }

    const filtered = suggestions.filter(s => s.toLowerCase().includes(input));
    filtered.forEach(suggestion => {
        const div = document.createElement('div');
        div.textContent = suggestion;
        div.onclick = () => {
            document.getElementById('search-input').value = suggestion;
            auto.style.display = 'none';
            searchCard();
        };
        auto.appendChild(div);
    });

    auto.style.display = filtered.length ? 'block' : 'none';
    auto.style.left = this.offsetLeft + 'px'; // Position under input
});

// Deals section
function loadDeals() {
    const dealsList = document.getElementById('deals-list');
    dealsList.innerHTML = '';

    mockDeals.forEach(deal => {
        const card = document.createElement('div');
        card.classList.add('deal-card');
        card.innerHTML = `
            <img src="${deal.image}" alt="${deal.name}">
            <h3>${deal.name}</h3>
            <p>New on ${deal.platform}: $${deal.price.toFixed(2)} (eBay: $${deal.ebayAvg.toFixed(2)})</p>
            <p class="price">💰 Save $${(deal.ebayAvg - deal.price).toFixed(2)}!</p>
        `;
        dealsList.appendChild(card);
    });
}

function refreshDeals() {
    // Simulate refresh with loading
    const button = event.target;
    button.textContent = 'Loading...';
    setTimeout(() => {
        loadDeals();
        button.textContent = 'Refresh Deals';
    }, 1000);
}

// Initialize
loadDeals();
