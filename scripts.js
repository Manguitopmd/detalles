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
    timeInterval: 30, // Intervalo de 30 minutos para horarios
    prepTimeHours: 48, // Tiempo de preparación: 48 horas
    paymentQRs: {
        yape: "assets/img/qr/yape.png",
        plin: "assets/img/qr/plin.png"
    }
};

// Validar prepTimeHours
if (!Number.isInteger(BUSINESS_CONFIG.prepTimeHours) || BUSINESS_CONFIG.prepTimeHours < 1) {
    console.error('prepTimeHours debe ser un número entero ≥ 1');
    BUSINESS_CONFIG.prepTimeHours = 48; // Valor por defecto
}

// Carrito (persistente en localStorage)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando Florería Encanto...');
    // Configurar navegación
    setupNavigation();

    // Actualizar contador del carrito
    updateCartCount();

    // Cargar contenido inicial
    const lastSection = localStorage.getItem('currentSection') || 'inicio';
    loadContent(lastSection);

    // Configurar lazy loading
    setupLazyLoading();
});

// Configurar lazy loading
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    images.forEach(img => observer.observe(img));
}

// Configurar navegación
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            console.log(`Cargando sección: ${section}`);
            loadContent(section);
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Cargar contenido dinámico
function loadContent(section) {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading-message">Cargando contenido, por favor espera...</div>';
    
    fetch(`${section}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar ${section}.html`);
            return response.text();
        })
        .then(data => {
            content.innerHTML = data;
            if (section === 'catalogo') initCatalogo();
            if (section === 'carrito') initCarrito();
            if (section === 'localizacion') initLocalizacion();
            if (section === 'inicio') initInicio();
            updateCartCount();
            localStorage.setItem('currentSection', section);
            setupLazyLoading();
        })
        .catch(error => {
            console.error('Error al cargar la sección:', error);
            content.innerHTML = `
                <div class="error-message">
                    <h3>¡Ups, algo salió mal!</h3>
                    <p>No pudimos cargar esta sección. Intenta de nuevo o contáctanos al ${BUSINESS_CONFIG.phoneNumber}.</p>
                </div>
            `;
        });
}

// Mostrar notificaciones
function showNotification(title, message, showCartButton = false, itemName = '') {
    const modal = document.createElement('div');
    modal.classList.add('notification-modal');
    let buttons = `
        <button class="modal-close-btn" aria-label="Cerrar notificación"><i class="fas fa-times"></i></button>
    `;
    if (showCartButton) {
        buttons += `
            <button class="go-to-cart-btn btn">Ir al Carrito</button>
        `;
    }
    modal.innerHTML = `
        <div class="notification-modal-content">
            ${buttons}
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.remove());
    }

    if (showCartButton) {
        const cartBtn = modal.querySelector('.go-to-cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                modal.remove();
                loadContent('carrito');
            });
        }
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

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

// Google Analytics (eventos)
function trackEvent(eventName, params) {
    if (window.gtag) {
        gtag('event', eventName, params);
    }
}

// Inicializar catálogo
function initCatalogo() {
    setupCategoryTabs();
    setupModal();

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
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            categories.forEach(cat => {
                cat.classList.add('hidden');
                if (cat.getAttribute('data-category') === category) {
                    cat.classList.remove('hidden');
                }
            });
        });
    });

    const defaultTab = document.querySelector('.tab-btn[data-category="todos"]');
    if (defaultTab) defaultTab.click();
}

// Configurar modal de detalles
function setupModal() {
    const modal = document.getElementById('service-modal');
    if (!modal) return;

    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', () => modal.classList.add('hidden'));
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// Abrir modal de detalles
function openModal(e) {
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    if (!modal || !modalTitle || !modalDescription) return;

    const name = e.currentTarget.getAttribute('data-name');
    const description = e.currentTarget.getAttribute('data-description');
    modalTitle.textContent = name;
    modalDescription.textContent = description;
    modal.classList.remove('hidden');
}

// Abrir modal de foto
function openPhotoModal(e) {
    const imageSrc = e.currentTarget.getAttribute('data-image');
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="photo-modal-content">
            <button class="modal-close-btn" aria-label="Cerrar modal de foto"><i class="fas fa-times"></i></button>
            <img src="${imageSrc}" alt="Foto del producto">
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Agregar al carrito
function addToCart(e) {
    const name = e.currentTarget.getAttribute('data-name');
    const price = parseFloat(e.currentTarget.getAttribute('data-price'));
    const image = e.currentTarget.getAttribute('data-image') || 'assets/img/placeholder.jpg';
    const stock = parseInt(e.currentTarget.getAttribute('data-stock') || 10);

    const existingItem = cart.find(i => i.name === name);
    if (existingItem) {
        if (existingItem.quantity >= stock) {
            showNotification('Sin stock', `No hay más ${name} disponibles.`);
            return;
        }
        existingItem.quantity += 1;
    } else {
        if (stock < 1) {
            showNotification('Sin stock', `${name} está agotado.`);
            return;
        }
        cart.push({ name, price, image, quantity: 1, stock });
    }

    triggerCartJump();
    updateCartCount();
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification('Producto añadido', `${name} se ha añadido al carrito.`, true, name);

    // Evento Analytics
    trackEvent('add_to_cart', {
        item_name: name,
        item_price: price,
        quantity: 1
    });
}

// Parsear hora
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
}

// Formatear hora
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Obtener fecha mínima (hoy + prepTimeHours)
function getMinDate() {
    const now = new Date();
    now.setHours(now.getHours() + BUSINESS_CONFIG.prepTimeHours);
    return now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Generar opciones de hora
function generateTimeOptions(date) {
    const timeSelect = document.getElementById('order-time');
    const orderForm = document.getElementById('order-form');
    if (!timeSelect || !orderForm) return;

    timeSelect.innerHTML = '<option value="">Selecciona una hora</option>';
    const selectedDate = new Date(date + 'T00:00:00-05:00');
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const selectedDay = dayNames[selectedDate.getDay()];
    const daySchedule = BUSINESS_CONFIG.schedules[selectedDay] || [];

    if (daySchedule.length === 0) {
        timeSelect.innerHTML = '<option value="">Día no disponible</option>';
        timeSelect.disabled = true;
        orderForm.querySelector('button[type="submit"]').disabled = true;
        showNotification('Día no disponible', 'No hay horarios disponibles para este día. Por favor, selecciona otra fecha.');
        return;
    }

    timeSelect.disabled = false;
    orderForm.querySelector('button[type="submit"]').disabled = false;

    daySchedule.forEach(shift => {
        let startTime = parseTime(shift.start);
        const endTime = parseTime(shift.end);

        while (startTime < endTime) {
            const timeString = formatTime(startTime);
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = timeString;
            timeSelect.appendChild(option);
            startTime.setMinutes(startTime.getMinutes() + BUSINESS_CONFIG.timeInterval);
        }
    });
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
    const deliverySelect = document.getElementById('order-delivery');
    const addressGroup = document.getElementById('address-group');
    const orderMessage = document.getElementById('order-message');
    const charCount = document.getElementById('char-count');
    const dateInput = document.getElementById('order-date');

    // Analytics: Ver carrito
    trackEvent('view_cart', {
        items: cart.map(item => ({
            item_name: item.name,
            item_price: item.price,
            quantity: item.quantity
        }))
    });

    // Mensaje de preparación
    if (stepDetails) {
        const minDate = getMinDate();
        const prepMessage = document.createElement('p');
        prepMessage.classList.add('prep-message');
        prepMessage.textContent = `Los pedidos requieren ${BUSINESS_CONFIG.prepTimeHours} horas de preparación. Selecciona una fecha a partir del ${minDate}.`;
        const prepContainer = document.getElementById('prep-message-container');
        if (prepContainer) {
            prepContainer.appendChild(prepMessage);
        }
    }

    // Validación en tiempo real
    if (orderForm) {
        const inputs = orderForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.value.trim() === '' && input.required) {
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '#ff69b4';
                }
            });
        });
    }

    // Contador de caracteres
    if (orderMessage && charCount) {
        orderMessage.addEventListener('input', () => {
            const count = orderMessage.value.length;
            charCount.textContent = `${count}/200`;
            charCount.style.color = count > 180 ? 'red' : '#555555';
        });
    }

    // Dirección condicional
    if (deliverySelect && addressGroup) {
        deliverySelect.addEventListener('change', () => {
            addressGroup.classList.toggle('hidden', deliverySelect.value !== 'delivery');
            const addressInput = document.getElementById('order-address');
            if (addressInput) addressInput.required = deliverySelect.value === 'delivery';
        });
    }

    // Horarios dinámicos y validación estricta de fecha
    if (dateInput) {
        const minDate = getMinDate();
        dateInput.setAttribute('min', minDate);
        // Forzar min en el picker
        dateInput.addEventListener('focus', () => {
            dateInput.setAttribute('min', minDate);
        });
        dateInput.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            const minDateObj = new Date(minDate);
            if (isNaN(selectedDate) || selectedDate < minDateObj) {
                showNotification('Fecha inválida', `Por favor, selecciona una fecha válida (mínimo ${BUSINESS_CONFIG.prepTimeHours} horas desde ahora).`);
                dateInput.value = '';
                document.getElementById('order-time').innerHTML = '<option value="">Selecciona un horario</option>';
                return;
            }
            generateTimeOptions(e.target.value);
        });
    }

    if (goToCatalogo) {
        goToCatalogo.addEventListener('click', () => loadContent('catalogo'));
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            renderCart();
            // Sin notificación, solo actualiza el carrito
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Carrito vacío', 'Explora nuestros arreglos florales ahora.');
                return;
            }
            stepItems.classList.add('hidden');
            stepDetails.classList.remove('hidden');
            trackEvent('begin_checkout', {
                value: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
                items: cart.map(item => ({
                    item_name: item.name,
                    item_price: item.price,
                    quantity: item.quantity
                }))
            });
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
            if (!paymentQr || !qrImage || !qrInstruction) return;

            if (paymentSelect.value === 'yape') {
                paymentQr.classList.remove('hidden');
                qrImage.dataset.src = BUSINESS_CONFIG.paymentQRs.yape;
                qrInstruction.textContent = 'Escanea este código con Yape para realizar el pago.';
            } else if (paymentSelect.value === 'plin') {
                paymentQr.classList.remove('hidden');
                qrImage.dataset.src = BUSINESS_CONFIG.paymentQRs.plin;
                qrInstruction.textContent = 'Escanea este código con Plin para realizar el pago.';
            } else {
                paymentQr.classList.add('hidden');
                qrImage.dataset.src = '';
                qrInstruction.textContent = '';
            }
            setupLazyLoading(); // Recargar QR
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('order-name').value;
            const date = document.getElementById('order-date').value;
            const time = document.getElementById('order-time').value;
            const delivery = document.getElementById('order-delivery').value;
            const address = document.getElementById('order-address')?.value;
            const message = document.getElementById('order-message').value;
            const payment = document.getElementById('order-payment').value;

            const selectedDate = new Date(date);
            const minDateObj = new Date(getMinDate());

            if (!name || !date || !time || !delivery || !payment || (delivery === 'delivery' && !address)) {
                showNotification('Campos incompletos', 'Por favor, completa todos los campos requeridos.');
                return;
            }

            if (isNaN(selectedDate) || selectedDate < minDateObj) {
                showNotification('Fecha inválida', `Por favor, selecciona una fecha válida (mínimo ${BUSINESS_CONFIG.prepTimeHours} horas desde ahora).`);
                dateInput.value = '';
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
            orderSummary += `Hora: ${time}\n`;
            orderSummary += `Tipo de entrega: ${delivery === 'recojo' ? 'Recojo en tienda' : 'Delivery'}\n`;
            if (delivery === 'delivery') orderSummary += `Dirección: ${address}\n`;
            if (message) orderSummary += `Dedicatoria: ${message}\n`;
            orderSummary += `Método de pago: ${payment.charAt(0).toUpperCase() + payment.slice(1)}`;

            const modalMessage = document.getElementById('modal-message');
            if (modalMessage) {
                modalMessage.innerHTML = orderSummary.replace(/\n/g, '<br>');
                confirmationModal.classList.remove('hidden');
            }
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', () => confirmationModal.classList.add('hidden'));
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            const name = document.getElementById('order-name').value;
            const date = document.getElementById('order-date').value;
            const time = document.getElementById('order-time').value;
            const delivery = document.getElementById('order-delivery').value;
            const address = document.getElementById('order-address')?.value;
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
            whatsappMessage += `Hora: ${time}\n`;
            whatsappMessage += `Tipo de entrega: ${delivery === 'recojo' ? 'Recojo en tienda' : 'Delivery'}\n`;
            if (delivery === 'delivery') whatsappMessage += `Dirección: ${address}\n`;
            if (message) whatsappMessage += `Dedicatoria: ${message}\n`;
            whatsappMessage += `Método de pago: ${payment.charAt(0).toUpperCase() + payment.slice(1)}`;

            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            // Evento Analytics
            trackEvent('purchase', {
                value: total,
                currency: 'PEN',
                items: cart.map(item => ({
                    item_name: item.name,
                    item_price: item.price,
                    quantity: item.quantity
                }))
            });

            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            confirmationModal.classList.add('hidden');
            stepDetails.classList.add('hidden');
            stepItems.classList.remove('hidden');
            showNotification('¡Gracias por tu pedido!', 'Tu pedido ha sido enviado por WhatsApp. Te contactaremos pronto.');
        });
    }

    // Mensaje de urgencia
    const urgencyMessage = document.querySelector('.urgency-message');
    if (!urgencyMessage) {
        const newUrgencyMessage = document.createElement('div');
        newUrgencyMessage.classList.add('urgency-message');
        newUrgencyMessage.textContent = '¡Confirma pronto, las flores se agotan!';
        const carritoSection = document.querySelector('.carrito-section');
        if (carritoSection) {
            carritoSection.insertBefore(newUrgencyMessage, carritoSection.firstChild);
        }
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
        cartEmpty.innerHTML = `
            <h3>¡No dejes pasar la oportunidad!</h3>
            <p>Explora nuestros arreglos florales ahora.</p>
            <button id="go-to-catalogo" class="btn" data-section="catalogo">Ver Arreglos</button>
        `;
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
                    <p>S/ ${(item.price * item.quantity).toFixed(2)} (x${item.quantity}) ${item.stock ? `(Quedan ${item.stock - item.quantity})` : ''}</p>
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
            // Sin notificación, solo actualiza
        });
    });

    // Reasignar evento para el botón del catálogo
    const goToCatalogo = document.getElementById('go-to-catalogo');
    if (goToCatalogo) {
        goToCatalogo.addEventListener('click', () => loadContent('catalogo'));
    }
}

// Inicializar localización
function initLocalizacion() {
    const addressElement = document.getElementById('contact-address');
    if (addressElement) {
        addressElement.textContent = BUSINESS_CONFIG.mapAddress;
    }

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

// Inicializar inicio (slider corregido)
function initInicio() {
    const slides = document.querySelectorAll('.slides img');
    let currentSlide = 0;

    if (slides.length === 0) {
        console.warn('No se encontraron imágenes en el slider.');
        return;
    }

    // Lazy loading para slider
    slides.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    });

    function showSlide(index) {
        console.log(`Mostrando slide ${index + 1}/${slides.length}`);
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    showSlide(currentSlide);
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 4000);
}