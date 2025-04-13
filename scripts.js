// Configuración editable para la florería
const BUSINESS_CONFIG = {
    businessName: "Florería Encanto",
    phoneNumber: "+51987654321",
    mapCoordinates: [-12.046374, -77.042793],
    mapZoom: 15,
    mapAddress: "Av. Floral 123, Lima",
    socialLinks: {
        instagram: "https://instagram.com/floreriaencanto",
        facebook: "https://facebook.com/floreriaencanto",
        tiktok: "https://tiktok.com/@floreriaencanto"
    },
    schedules: {
        monday: [{ start: "09:00", end: "20:00" }],
        tuesday: [{ start: "09:00", end: "20:00" }],
        wednesday: [{ start: "09:00", end: "20:00" }],
        thursday: [{ start: "09:00", end: "20:00" }],
        friday: [{ start: "09:00", end: "20:00" }],
        saturday: [{ start: "10:00", end: "18:00" }],
        sunday: [{ start: "10:00", end: "15:00" }]
    },
    paymentQRs: {
        yape: "assets/img/qr/yape.png",
        plin: "assets/img/qr/plin.png"
    }
};

// Carrito (persistente en localStorage)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Configurar navegación (index.html)
    setupNavigation();

    // Actualizar contador del carrito
    updateCartCount();

    // Cargar contenido inicial
    const lastSection = localStorage.getItem('currentSection') || 'inicio';
    loadContent(lastSection);
});

// Configurar navegación
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            loadContent(section);
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Cargar contenido dinámico
function loadContent(section) {
    fetch(`${section}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar ${section}.html`);
            return response.text();
        })
        .then(data => {
            document.getElementById('content').innerHTML = data;
            if (section === 'catalogo') initCatalogo();
            if (section === 'carrito') initCarrito();
            if (section === 'localizacion') initLocalizacion();
            if (section === 'inicio') initInicio();
            updateCartCount();
            localStorage.setItem('currentSection', section);
        })
        .catch(error => {
            console.error('Error al cargar la sección:', error);
            document.getElementById('content').innerHTML = `
                <div class="error-message">
                    <h3>¡Ups, algo salió mal!</h3>
                    <p>No pudimos cargar esta sección. Por favor, intenta de nuevo.</p>
                </div>
            `;
        });
}

// Mostrar notificaciones
function showNotification(title, message) {
    const modal = document.createElement('div');
    modal.classList.add('notification-modal', 'flex');
    modal.innerHTML = `
        <div class="notification-modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="close-notification">Aceptar</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => modal.remove());

    // Auto-cerrar después de 5 segundos
    setTimeout(() => modal.remove(), 5000);
}

// Animar ícono del carrito
function triggerCartJump() {
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('cart-jump');
        setTimeout(() => cartIcon.classList.remove('cart-jump'), 300);
    }
}

// Actualizar contador del carrito
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('hidden', totalItems === 0);
    }
}

// Inicializar catálogo
function initCatalogo() {
    // Configurar pestañas
    setupCategoryTabs();

    // Configurar modal
    setupModal();

    // Configurar eventos
    document.querySelectorAll('.view-details-btn').forEach(btn => btn.addEventListener('click', openModal));
    document.querySelectorAll('.view-photo-btn').forEach(btn => btn.addEventListener('click', openPhotoModal));
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => btn.addEventListener('click', addToCart));
}

// Configurar pestañas de categorías
function setupCategoryTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const categories = document.querySelectorAll('.category');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');

            // Actualizar pestañas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Mostrar categoría seleccionada
            categories.forEach(cat => {
                cat.classList.add('hidden');
                if (cat.getAttribute('data-category') === category) {
                    cat.classList.remove('hidden');
                }
            });
        });
    });

    // Mostrar "todos" por defecto
    const defaultTab = document.querySelector('.tab-btn[data-category="todos"]');
    if (defaultTab) defaultTab.click();
}

// Configurar modal de detalles
function setupModal() {
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalClose = document.getElementById('modal-close');

    if (!modal || !modalTitle || !modalDescription || !modalClose) return;

    modalClose.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// Abrir modal de detalles
function openModal(e) {
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    const name = e.currentTarget.getAttribute('data-name');
    const description = e.currentTarget.getAttribute('data-description');

    modalTitle.textContent = name;
    modalDescription.textContent = description;
    modal.classList.remove('hidden');
}

// Abrir modal de foto
function openPhotoModal(e) {
    const imageSrc = e.currentTarget.getAttribute('data-image');

    // Crear modal dinámicamente
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="photo-modal-content">
            <button class="modal-close-btn"><i class="fas fa-times"></i></button>
            <img src="${imageSrc}" alt="Foto del producto">
        </div>
    `;
    document.body.appendChild(modal);

    // Configurar cierre
    const closeBtn = modal.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', () => modal.remove());

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Agregar al carrito
function addToCart(e) {
    const name = e.currentTarget.getAttribute('data-name');
    const price = parseFloat(e.currentTarget.getAttribute('data-price'));
    const image = e.currentTarget.getAttribute('data-image') || 'assets/img/placeholder.jpg';

    const existingItem = cart.find(i => i.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }

    triggerCartJump();
    updateCartCount();
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification('Producto añadido', `${name} se ha añadido al carrito.`);
}

// Inicializar carrito
function initCarrito() {
    renderCart();

    const stepItems = document.getElementById('step-items');
    const stepDetails = document.getElementById('step-details');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const goToCatalogo = document.getElementById('go-to-catalogo');
    const detailsBack = document.getElementById('details-back');
    const orderForm = document.getElementById('order-form');
    const confirmationModal = document.getElementById('confirmation-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const paymentSelect = document.getElementById('order-payment');

    if (goToCatalogo) {
        goToCatalogo.addEventListener('click', () => {
            loadContent('catalogo');
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            renderCart();
            showNotification('Carrito vacío', 'Todos los arreglos han sido eliminados.');
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Carrito vacío', 'Añade al menos un arreglo floral para continuar.');
                return;
            }
            stepItems.classList.add('hidden');
            stepDetails.classList.remove('hidden');
        });
    }

    if (detailsBack) {
        detailsBack.addEventListener('click', () => {
            stepDetails.classList.add('hidden');
            stepItems.classList.remove('hidden');
        });
    }

    if (paymentSelect) {
        paymentSelect.addEventListener('change', () => {
            const paymentQr = document.getElementById('payment-qr');
            const qrImage = document.getElementById('qr-image');
            const qrInstruction = document.getElementById('qr-instruction');
            if (paymentSelect.value === 'yape') {
                paymentQr.classList.remove('hidden');
                qrImage.src = BUSINESS_CONFIG.paymentQRs.yape;
                qrInstruction.textContent = 'Escanea este código con Yape para realizar el pago.';
            } else if (paymentSelect.value === 'plin') {
                paymentQr.classList.remove('hidden');
                qrImage.src = BUSINESS_CONFIG.paymentQRs.plin;
                qrInstruction.textContent = 'Escanea este código con Plin para realizar el pago.';
            } else {
                paymentQr.classList.add('hidden');
                qrImage.src = '';
                qrInstruction.textContent = '';
            }
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('order-name').value;
            const date = document.getElementById('order-date').value;
            const delivery = document.getElementById('order-delivery').value;
            const message = document.getElementById('order-message').value;
            const payment = document.getElementById('order-payment').value;

            if (!name || !date || !delivery || !payment) {
                showNotification('Campos incompletos', 'Por favor, completa todos los campos requeridos.');
                return;
            }

            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            let orderSummary = `Resumen del pedido:\n`;
            cart.forEach(item => {
                orderSummary += `- ${item.name} (x${item.quantity}): S/ ${(item.price * item.quantity).toFixed(2)}\n`;
            });
            orderSummary += `Total: S/ ${total.toFixed(2)}\n`;
            orderSummary += `Nombre: ${name}\n`;
            orderSummary += `Fecha de entrega: ${date}\n`;
            orderSummary += `Tipo de entrega: ${delivery === 'recojo' ? 'Recojo en tienda' : 'Delivery'}\n`;
            if (message) orderSummary += `Dedicatoria: ${message}\n`;
            orderSummary += `Método de pago: ${payment.charAt(0).toUpperCase() + payment.slice(1)}`;

            const modalMessage = document.getElementById('modal-message');
            modalMessage.innerHTML = orderSummary.replace(/\n/g, '<br>');
            confirmationModal.classList.remove('hidden');
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            confirmationModal.classList.add('hidden');
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            const name = document.getElementById('order-name').value;
            const date = document.getElementById('order-date').value;
            const delivery = document.getElementById('order-delivery').value;
            const message = document.getElementById('order-message').value;
            const payment = document.getElementById('order-payment').value;

            let whatsappMessage = `¡Nuevo pedido para Florería Encanto!\n\n`;
            whatsappMessage += `Arreglos:\n`;
            cart.forEach(item => {
                whatsappMessage += `- ${item.name} (x${item.quantity}): S/ ${(item.price * item.quantity).toFixed(2)}\n`;
            });
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            whatsappMessage += `\nTotal: S/ ${total.toFixed(2)}\n`;
            whatsappMessage += `Nombre: ${name}\n`;
            whatsappMessage += `Fecha de entrega: ${date}\n`;
            whatsappMessage += `Tipo de entrega: ${delivery === 'recojo' ? 'Recojo en tienda' : 'Delivery'}\n`;
            if (message) whatsappMessage += `Dedicatoria: ${message}\n`;
            whatsappMessage += `Método de pago: ${payment.charAt(0).toUpperCase() + payment.slice(1)}`;

            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            confirmationModal.classList.add('hidden');
            stepDetails.classList.add('hidden');
            stepItems.classList.remove('hidden');
            showNotification('Pedido enviado', 'Tu pedido ha sido enviado por WhatsApp. ¡Gracias por elegirnos!');
        });
    }
}

// Renderizar carrito
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartEmpty = document.getElementById('cart-empty');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartItems || !cartTotal || !cartEmpty) return;

    if (cart.length === 0) {
        cartItems.classList.add('hidden');
        cartTotal.classList.add('hidden');
        cartEmpty.classList.remove('hidden');
        if (clearCartBtn) clearCartBtn.classList.add('hidden');
        if (checkoutBtn) checkoutBtn.classList.add('hidden');
    } else {
        cartItems.classList.remove('hidden');
        cartTotal.classList.remove('hidden');
        cartEmpty.classList.add('hidden');
        if (clearCartBtn) clearCartBtn.classList.remove('hidden');
        if (checkoutBtn) checkoutBtn.classList.remove('hidden');

        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add('cart-item');
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>S/ ${(item.price * item.quantity).toFixed(2)} (x${item.quantity})</p>
                </div>
                <button class="remove-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(li);
            total += item.price * item.quantity;
        });

        cartTotal.textContent = `Total: S/ ${total.toFixed(2)}`;
    }

    updateCartCount();
    localStorage.setItem('cart', JSON.stringify(cart));

    // Configurar evento para eliminar ítems
    cartItems.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            cart.splice(index, 1);
            renderCart();
            showNotification('Arreglo eliminado', 'Se eliminó un arreglo del carrito.');
        });
    });
}

// Inicializar localización (mapa y modal)
function initLocalizacion() {
    // Configurar dirección
    const addressElement = document.getElementById('contact-address');
    if (addressElement) {
        addressElement.textContent = BUSINESS_CONFIG.mapAddress;
    }

    // Configurar mapa
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        const map = L.map('map').setView(BUSINESS_CONFIG.mapCoordinates, BUSINESS_CONFIG.mapZoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        L.marker(BUSINESS_CONFIG.mapCoordinates).addTo(map)
            .bindPopup(BUSINESS_CONFIG.businessName)
            .openPopup();
        setTimeout(() => map.invalidateSize(), 100);
    }

    // Configurar modal y botón de direcciones
    const directionsBtn = document.getElementById('directions-btn');
    const locationModal = document.getElementById('location-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (directionsBtn && locationModal && closeModalBtn) {
        directionsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            locationModal.classList.remove('hidden');
        });

        closeModalBtn.addEventListener('click', () => {
            locationModal.classList.add('hidden');
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${BUSINESS_CONFIG.mapCoordinates[0]},${BUSINESS_CONFIG.mapCoordinates[1]}`;
            window.open(mapsUrl, '_blank');
        });

        locationModal.addEventListener('click', (e) => {
            if (e.target === locationModal) {
                locationModal.classList.add('hidden');
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${BUSINESS_CONFIG.mapCoordinates[0]},${BUSINESS_CONFIG.mapCoordinates[1]}`;
                window.open(mapsUrl, '_blank');
            }
        });
    }
}

// Inicializar inicio (slider)
function initInicio() {
    const slides = document.querySelectorAll('.slides img');
    let currentSlide = 0;

    if (slides.length === 0) return;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    showSlide(currentSlide);
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 4000);
}