// Global state
let currentUser = null;
let authMode = 'login';
let searchType = 'flight';
let bookings = [];

// API configuration
const API_URL = 'http://localhost:3000';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDestinations();
    setupEventListeners();
    setTodayDate();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('chatForm').addEventListener('submit', handleChat);
}

// Set today's date as minimum for date inputs
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('departDate').min = today;
    document.getElementById('returnDate').min = today;
}

// Check authentication status
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/api/auth/session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                setCurrentUser(user);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
}

// Set current user
function setCurrentUser(user) {
    currentUser = user;
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('userMenu').classList.remove('hidden');
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
    loadBookings();
}

// Show login modal
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

// Close login modal
function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

// Toggle between login and signup
function toggleAuthMode() {
    authMode = authMode === 'login' ? 'signup' : 'login';
    const isSignup = authMode === 'signup';
    
    document.getElementById('modalTitle').textContent = isSignup ? 'Sign Up' : 'Login';
    document.getElementById('nameGroup').classList.toggle('hidden', !isSignup);
    document.getElementById('authToggleText').textContent = isSignup ? 'Already have an account?' : "Don't have an account?";
    document.getElementById('authToggleLink').textContent = isSignup ? 'Login' : 'Sign up';
    document.querySelector('#authForm button[type="submit"]').textContent = isSignup ? 'Sign Up' : 'Login';
}

// Handle authentication
async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const name = document.getElementById('nameInput').value;
    
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode === 'login' 
        ? { email, password }
        : { email, password, name };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            setCurrentUser(data.user);
            closeLoginModal();
            showToast(`Welcome ${data.user.name}!`, 'success');
        } else {
            showToast(data.error || 'Authentication failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('userMenu').classList.add('hidden');
    document.getElementById('bookingsList').innerHTML = '<p>Please login to view your bookings</p>';
    showToast('Logged out successfully', 'success');
}

// Show section
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
}

// Set search type
function setSearchType(type) {
    searchType = type;
    document.querySelectorAll('.search-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const searchBtn = document.querySelector('#searchForm button[type="submit"]');
    searchBtn.textContent = type === 'flight' ? 'Search Flights' : 'Search Hotels';
    
    // Update form fields
    if (type === 'hotel') {
        document.getElementById('fromInput').placeholder = 'City';
        document.getElementById('toInput').style.display = 'none';
        document.getElementById('passengers').style.display = 'none';
    } else {
        document.getElementById('fromInput').placeholder = 'From City';
        document.getElementById('toInput').style.display = 'block';
        document.getElementById('passengers').style.display = 'block';
    }
}

// Handle search
async function handleSearch(e) {
    e.preventDefault();
    
    const from = document.getElementById('fromInput').value;
    const to = document.getElementById('toInput').value;
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const passengers = document.getElementById('passengers').value;
    
    const searchData = {
        type: searchType,
        from,
        to,
        departure: departDate,
        return: returnDate,
        travelers: passengers
    };
    
    try {
        const response = await fetch(`${API_URL}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        });
        
        const results = await response.json();
        
        if (searchType === 'flight') {
            displayFlights(results);
            showSection('flights');
        } else {
            displayHotels(results);
            showSection('hotels');
        }
    } catch (error) {
        showToast('Search failed. Please try again.', 'error');
    }
}

// Display flights
function displayFlights(flights) {
    const container = document.getElementById('flightResults');
    
    if (!flights || flights.length === 0) {
        container.innerHTML = '<p>No flights found. Try different search criteria.</p>';
        return;
    }
    
    container.innerHTML = flights.map(flight => `
        <div class="result-card">
            <div class="flight-info">
                <h3>${flight.airline}</h3>
                <p class="route">${flight.from} → ${flight.to}</p>
                <p class="time">Duration: ${flight.duration}</p>
                <p class="stops">Stops: ${flight.stops || 0}</p>
            </div>
            <div class="price-info">
                <p class="price">$${flight.price}</p>
                <button class="btn btn-primary" onclick="bookFlight('${flight.id}', ${flight.price})">Book Now</button>
            </div>
        </div>
    `).join('');
}

// Display hotels
function displayHotels(hotels) {
    const container = document.getElementById('hotelResults');
    
    if (!hotels || hotels.length === 0) {
        container.innerHTML = '<p>No hotels found. Try different search criteria.</p>';
        return;
    }
    
    container.innerHTML = hotels.map(hotel => `
        <div class="result-card">
            <img src="${hotel.image}" alt="${hotel.name}" class="hotel-image">
            <div class="hotel-info">
                <h3>${hotel.name}</h3>
                <p class="location">${hotel.location}</p>
                <p class="rating">Rating: ${hotel.rating} ⭐</p>
                <p class="amenities">${hotel.amenities.join(', ')}</p>
            </div>
            <div class="price-info">
                <p class="price">$${hotel.price}/night</p>
                <button class="btn btn-primary" onclick="bookHotel('${hotel.id}', ${hotel.price})">Book Now</button>
            </div>
        </div>
    `).join('');
}

// Book flight
async function bookFlight(flightId, price) {
    if (!currentUser) {
        showToast('Please login to book flights', 'error');
        showLoginModal();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/flights/${flightId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                passengers: 1,
                seatClass: 'economy'
            })
        });
        
        const booking = await response.json();
        
        if (response.ok) {
            showToast(`Flight booked successfully! Confirmation: ${booking.confirmationCode}`, 'success');
            loadBookings();
            showSection('bookings');
        } else {
            showToast('Booking failed. Please try again.', 'error');
        }
    } catch (error) {
        showToast('Booking failed. Please try again.', 'error');
    }
}

// Book hotel
async function bookHotel(hotelId, price) {
    if (!currentUser) {
        showToast('Please login to book hotels', 'error');
        showLoginModal();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/hotels/${hotelId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                checkIn: document.getElementById('departDate').value,
                checkOut: document.getElementById('returnDate').value || document.getElementById('departDate').value,
                guests: 1,
                roomType: 'standard'
            })
        });
        
        const booking = await response.json();
        
        if (response.ok) {
            showToast(`Hotel booked successfully! Confirmation: ${booking.confirmationCode}`, 'success');
            loadBookings();
            showSection('bookings');
        } else {
            showToast('Booking failed. Please try again.', 'error');
        }
    } catch (error) {
        showToast('Booking failed. Please try again.', 'error');
    }
}

// Load bookings
async function loadBookings() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/api/bookings`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        bookings = data.bookings;
        displayBookings();
    } catch (error) {
        console.error('Failed to load bookings:', error);
    }
}

// Display bookings
function displayBookings() {
    const container = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>You have no bookings yet.</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <h4>Booking #${booking.confirmationCode || booking.id}</h4>
            <p>Status: ${booking.status}</p>
            <p>Total: $${booking.totalPrice}</p>
            <p>Date: ${new Date(booking.createdAt).toLocaleDateString()}</p>
            ${booking.status !== 'cancelled' ? 
                `<button class="btn btn-secondary" onclick="cancelBooking('${booking.id}')">Cancel</button>` : ''}
        </div>
    `).join('');
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showToast('Booking cancelled successfully', 'success');
            loadBookings();
        } else {
            showToast('Cancellation failed. Please try again.', 'error');
        }
    } catch (error) {
        showToast('Cancellation failed. Please try again.', 'error');
    }
}

// Load destinations
async function loadDestinations() {
    try {
        const response = await fetch(`${API_URL}/api/destinations/trending`);
        const data = await response.json();
        displayDestinations(data.destinations);
    } catch (error) {
        console.error('Failed to load destinations:', error);
    }
}

// Display destinations
function displayDestinations(destinations) {
    const container = document.getElementById('destinationsGrid');
    
    container.innerHTML = destinations.map(dest => `
        <div class="destination-card">
            <img src="${dest.image}" alt="${dest.name}">
            <div class="destination-info">
                <h3>${dest.name}</h3>
                <p>${dest.description}</p>
                <p class="price">From $${dest.price}</p>
                <button class="btn btn-primary" onclick="searchDestination('${dest.name}')">Explore</button>
            </div>
        </div>
    `).join('');
}

// Search destination
function searchDestination(destination) {
    const city = destination.split(',')[0];
    document.getElementById('toInput').value = city;
    document.getElementById('fromInput').focus();
}

// Toggle AI Chat
function toggleAIChat() {
    document.getElementById('aiChatWindow').classList.toggle('active');
}

// Handle chat
async function handleChat(e) {
    e.preventDefault();
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch(`${API_URL}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        addChatMessage(data.response, 'bot');
    } catch (error) {
        addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Add chat message
function addChatMessage(message, sender) {
    const container = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}`;
    messageEl.innerHTML = `<div class="message-content">${message}</div>`;
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}