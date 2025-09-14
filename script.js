// Mock data with listing URLs
const mockCards = {
    "Charizard PSA 10": {
        ebayAvg: 250.00,
        collectorCrypt: { price: 220.00, url: "https://magiceden.io/item-details/charizard-psa10" },
        courtyard: { price: 235.00, url: "https://opensea.io/assets/matic/charizard-psa10" },
        arenaClub: { price: 210.00, url: "https://arenaclub.com/listing/charizard-psa10" }
    },
    "Pikachu CGC 9.5": {
        ebayAvg: 150.00,
        collectorCrypt: { price: 140.00, url: "https://magiceden.io/item-details/pikachu-cgc95" },
        courtyard: { price: 155.00, url: "https://opensea.io/assets/matic/pikachu-cgc95" },
        arenaClub: { price: 135.00, url: "https://arenaclub.com/listing/pikachu-cgc95" }
    },
    "Mickey Mantle PSA 8": {
        ebayAvg: 5000.00,
        collectorCrypt: { price: null, url: null },
        courtyard: { price: 4800.00, url: "https://opensea.io/assets/matic/mantle-psa8" },
        arenaClub: { price: 4900.00, url: "https://arenaclub.com/listing/mantle-psa8" }
    }
};

const mockDeals = [
    {
        name: "Charizard PSA 10",
        price: 210.00,
        platform: "Arena Club",
        ebayAvg: 250.00,
        image: "https://via.placeholder.com/200x150?text=Charizard",
        url: "https://arenaclub.com/listing/charizard-psa10"
    },
    {
        name: "Pikachu CGC 9.5",
        price: 135.00,
        platform: "Arena Club",
        ebayAvg: 150.00,
        image: "https://via.placeholder.com/200x150?text=Pikachu",
        url: "https://arenaclub.com/listing/pikachu-cgc95"
    },
    {
        name: "Baseball Rookie PSA 9",
        price: 300.00,
        platform: "Courtyard.io",
        ebayAvg: 350.00,
        image: "https://via.placeholder.com/200x150?text=Rookie",
        url: "https://opensea.io/assets/matic/rookie-psa9"
    }
];

// Autocomplete suggestions
const suggestions = Object.keys(mockCards);

// Replace with your eBay AppID
const EBAY_APP_ID = 'YOUR_EBAY_APP_ID';

// Fetch eBay 14-day average sold price
async function fetchEbayAverage(query) {
    if (!EBAY_APP_ID || EBAY_APP_ID === 'YOUR_EBAY_APP_ID') {
        const card = mockCards[query];
        return card ? card.ebayAvg : null;
    }

    const today = new Date('2025-09-14');
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fromDate = fourteenDaysAgo.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];

    const url = `https://api.ebay.com/commerce/marketplace-insights/paf/v1_beta/search?q=${encodeURIComponent(query + ' sold')}&filter=sold_date_from:${fromDate}T00:00:00Z,sold_date_to:${toDate}T23:59:59Z&limit=50`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${EBAY_APP_ID}` }
        });
        const data = await response.json();
        if (data.itemSummaries && data.itemSummaries.length > 0) {
            const soldPrices = data.itemSummaries
                .filter(item => item.sellingStatus && item.sellingStatus[0].currentPrice)
                .map(item => parseFloat(item.sellingStatus[0].currentPrice[0].value));
            return soldPrices.length > 0 ? soldPrices.reduce((a, b) => a + b, 0) / soldPrices.length : null;
        }
        return null;
    } catch (error) {
        console.error('eBay API error:', error);
        return null;
    }
}

// Fetch Collector Crypt price and listing URL
async function fetchCollectorCryptPrice(query) {
    const url = `https://api-mainnet.magiceden.dev/v2/collections?offset=0&limit=1&q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            const price = parseFloat(data[0].floorPrice / 1e9) * 150; // SOL to USD
            const url = `https://magiceden.io/item-details/${data[0].id || query.toLowerCase().replace(/\s/g, '-')}`;
            return { price, url };
        }
        return { price: null, url: null };
    } catch (error) {
        console.error('Collector Crypt error:', error);
        return { price: null, url: null };
    }
}

// Fetch Courtyard.io price and listing URL
async function fetchCourtyardPrice(query) {
    const url = `https://api.opensea.io/api/v2/collections?search[string_query]=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url, {
            headers: { 'X-API-KEY': 'demo' }
        });
        const data = await response.json();
        if (data.collections && data.collections.length > 0) {
            const price = parseFloat(data.collections[0].stats.floor_price);
            const url = `https://opensea.io/assets/matic/${data.collections[0].contract_address || query.toLowerCase().replace(/\s/g, '-')}`;
            return { price, url };
        }
        return { price: null, url: null };
    } catch (error) {
        console.error('Courtyard error:', error);
        return { price: null, url: null };
    }
}

// Fetch Arena Club price and listing URL (mock)
function fetchArenaClubPrice(query) {
    const card = mockCards[query];
    return card ? card.arenaClub : { price: null, url: null };
}

// Search function with links
async function searchCard() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    document.getElementById('loading').style.display = 'block';

    // Fetch data
    const ebayAvg = await fetchEbayAverage(query);
    const collectorCrypt = await fetchCollectorCryptPrice(query);
    const courtyard = await fetchCourtyardPrice(query);
    const arenaClub = fetchArenaClubPrice(query);

    // Fallback to mock
    const fallback = mockCards[query];
    const cardData = {
        ebayAvg: ebayAvg || fallback?.ebayAvg || 0,
        collectorCrypt: collectorCrypt || fallback?.collectorCrypt || { price: null, url: null },
        courtyard: courtyard || fallback?.courtyard || { price: null, url: null },
        arenaClub: arenaClub || fallback?.arenaClub || { price: null, url: null }
    };

    if (cardData.ebayAvg === 0) {
        alert('No eBay data found for last 14 days. Using mock.');
    }

    document.getElementById('card-name').textContent = query;
    const tbody = document.querySelector('#price-table tbody');
    tbody.innerHTML = '';

    const platforms = [
        { key: 'collectorCrypt', name: 'Collector Crypt' },
        { key: 'courtyard', name: 'Courtyard.io' },
        { key: 'arenaClub', name: 'Arena Club' }
    ];

    platforms.forEach(platform => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = platform.name;
        const price = cardData[platform.key].price;
        const priceCell = row.insertCell(1);
        if (price) {
            priceCell.textContent = `$${price.toFixed(2)}`;
        } else {
            priceCell.textContent = 'N/A';
        }
        row.insertCell(2).textContent = `$${cardData.ebayAvg.toFixed(2)}`;
        const dealCell = row.insertCell(3);
        if (price && price < cardData.ebayAvg) {
            dealCell.textContent = 'Yes';
            dealCell.classList.add('deal-yes');
        } else {
            dealCell.textContent = 'No';
            dealCell.classList.add('deal-no');
        }
        const linkCell = row.insertCell(4);
        if (cardData[platform.key].url && price) {
            linkCell.innerHTML = `<a href="${cardData[platform.key].url}" target="_blank" class="link-button">View Listing</a>`;
        } else {
            linkCell.innerHTML = `<span class="link-button disabled">Not Available</span>`;
        }
    });

    document.getElementById('comparison-section').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
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
});

// Deals section with links
function loadDeals() {
    const dealsList = document.getElementById('deals-list');
    dealsList.innerHTML = '';

    mockDeals.filter(deal => deal.price < deal.ebayAvg).forEach(deal => {
        const card = document.createElement('div');
        card.classList.add('deal-card');
        card.innerHTML = `
            <img src="${deal.image}" alt="${deal.name}">
            <h3>${deal.name}</h3>
            <p>New on ${deal.platform}: $${deal.price.toFixed(2)} (eBay 14-Day Avg Sold: $${deal.ebayAvg.toFixed(2)})</p>
            <p class="price">💰 Save $${(deal.ebayAvg - deal.price).toFixed(2)}!</p>
            <a href="${deal.url}" target="_blank" class="link-button">View Listing</a>
        `;
        dealsList.appendChild(card);
    });
}

function refreshDeals() {
    const button = event.target;
    button.textContent = 'Loading...';
    setTimeout(() => {
        loadDeals();
        button.textContent = 'Refresh Deals';
    }, 1000);
}

// Initialize
loadDeals();
