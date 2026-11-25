import React, { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Share,
} from 'react-native';

const BRAND = {
  name: 'NexaMarket',
  slogan: 'Compra todo en un solo lugar',
  primary: '#1f3a5f',
  accent: '#f97316',
  success: '#16a34a',
  soft: '#eef4ff',
  danger: '#dc2626',
  dark: '#0f172a',
  muted: '#64748b',
};

const STORAGE_KEY = '@nexamarket:state';
const COUPON_CODE = 'BIENVENIDO10';
const COUPON_RATE = 0.1;
const VALID_CATEGORIES = ['Tecnología', 'Hogar', 'Deporte', 'Mascotas', 'Moda'];
const VALID_SHIPPING_MODES = ['Estándar', 'Exprés'];
const SHIPPING_RATES = {
  Mosquera: { 'Estándar': 6000, 'Exprés': 10000, days: '1 a 2 días' },
  Funza: { 'Estándar': 8000, 'Exprés': 12000, days: '1 a 2 días' },
  Madrid: { 'Estándar': 10000, 'Exprés': 14000, days: '1 a 3 días' },
};
const DEFAULT_BUYER = { name: '', phone: '', municipality: '', address: '' };
const PERSON_TEXT_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
const hasPersonLetter = (value) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(value);
const getProductVariants = (product) =>
  Array.isArray(product?.variants) && product.variants.length
    ? product.variants
    : null;

const initialProducts = [
  {
    id: 'PROD-001',
    name: 'Audífonos inalámbricos',
    brand: 'NexaSound',
    category: 'Tecnología',
    price: 189000,
    stock: 14,
    variants: [
      { id: 'PROD-001-NEGRO', label: 'Negro', price: 189000, stock: 8 },
      { id: 'PROD-001-BLANCO', label: 'Blanco', price: 199000, stock: 6 },
    ],
    description: 'Audio envolvente con cancelación de ruido y batería de larga duración para estudiar o trabajar sin distracciones.',
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }, { rating: 5 }],
  },
  {
    id: 'PROD-002',
    name: 'Reloj inteligente',
    brand: 'PulseFit',
    category: 'Tecnología',
    price: 245000,
    stock: 0,
    description: 'Reloj inteligente con seguimiento de sueño, pasos y notificaciones para una vida activa y conectada.',
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 4 }],
  },
  {
    id: 'PROD-003',
    name: 'Cámara compacta',
    brand: 'LensGo',
    category: 'Tecnología',
    price: 329000,
    stock: 5,
    description: 'Captura video y fotos nítidas para viajes, reuniones y contenido rápido en redes sociales.',
    reviews: [{ rating: 5 }, { rating: 5 }],
  },
  {
    id: 'PROD-004',
    name: 'Lámpara de escritorio',
    brand: 'Luma',
    category: 'Hogar',
    price: 89000,
    stock: 11,
    variants: [
      { id: 'PROD-004-PEQUENA', label: 'Pequeña', price: 89000, stock: 7 },
      { id: 'PROD-004-GRANDE', label: 'Grande', price: 109000, stock: 4 },
    ],
    description: 'Luz cálida con ajuste de intensidad para crear ambientes cómodos en dormitorios, salones y escritorios.',
    reviews: [{ rating: 4 }, { rating: 5 }, { rating: 4 }],
  },
  {
    id: 'PROD-005',
    name: 'Set de tazas',
    category: 'Hogar',
    price: 54000,
    stock: 17,
    description: 'Pack de tazas de cerámica con diseño minimalista, ideal para reuniones y regalos.',
    reviews: [{ rating: 4 }, { rating: 3 }, { rating: 5 }],
  },
  {
    id: 'PROD-006',
    name: 'Sofá compacto',
    category: 'Hogar',
    price: 420000,
    stock: 4,
    description: 'Sofá plegable ideal para espacios pequeños, viajes, casas de fin de semana y prácticas.',
    reviews: [{ rating: 5 }, { rating: 4 }],
  },
  {
    id: 'PROD-007',
    name: 'Mancuernas 5 kg',
    brand: 'PowerHome',
    category: 'Deporte',
    price: 129000,
    stock: 9,
    variants: [
      { id: 'PROD-007-3KG', label: '3 kg', price: 89000, stock: 5 },
      { id: 'PROD-007-5KG', label: '5 kg', price: 129000, stock: 4 },
      { id: 'PROD-007-8KG', label: '8 kg', price: 169000, stock: 0 },
    ],
    description: 'Par de mancuernas con agarre ergonómico para entrenamientos intensos en casa o en gimnasio.',
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
  },
  {
    id: 'PROD-008',
    name: 'Botella deportiva',
    category: 'Deporte',
    price: 42000,
    stock: 20,
    description: 'Botella deportiva libre de BPA con aislamiento térmico para entrenamientos y salidas rápidas.',
    reviews: [{ rating: 4 }, { rating: 4 }, { rating: 5 }],
  },
  {
    id: 'PROD-009',
    name: 'Balón de fútbol',
    category: 'Deporte',
    price: 76000,
    stock: 12,
    description: 'Balón resistente para entrenamientos, partidos casuales y actividades familiares.',
    reviews: [{ rating: 5 }, { rating: 3 }, { rating: 4 }],
  },
  {
    id: 'PROD-010',
    name: 'Collar luminoso',
    category: 'Mascotas',
    price: 35000,
    stock: 18,
    description: 'Collar luminoso para paseos nocturnos y mayor visibilidad para tus mascotas.',
    reviews: [{ rating: 4 }, { rating: 5 }],
  },
  {
    id: 'PROD-011',
    name: 'Cama para mascota',
    category: 'Mascotas',
    price: 180000,
    stock: 6,
    description: 'Cama suave y acolchada para perros y gatos, con tela lavable y alto confort.',
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
  },
  {
    id: 'PROD-012',
    name: 'Cartera clásica',
    category: 'Moda',
    price: 98000,
    stock: 10,
    description: 'Cartera moderna con cierre seguro y diseño elegante para uso diario y presentaciones.',
    reviews: [{ rating: 4 }, { rating: 5 }, { rating: 4 }],
  },
];

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const averageRating = (reviews = []) => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return total / reviews.length;
};

const generateOrderCode = () => {
  const timePart = Date.now().toString(36).slice(-5).toUpperCase();
  const randomPart = Math.floor(Math.random() * 46656).toString(36).padStart(3, '0').toUpperCase();
  return `PED-${timePart}-${randomPart}`;
};

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [history, setHistory] = useState([]);
  const [screen, setScreen] = useState('catalog');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [sortMode, setSortMode] = useState('none');
  const [buyer, setBuyer] = useState(DEFAULT_BUYER);
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [notice, setNotice] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [sellerForm, setSellerForm] = useState({
    id: '',
    name: '',
    category: 'Tecnología',
    price: '',
    stock: '',
    description: '',
  });
  const [reviewDraft, setReviewDraft] = useState(5);
  const [compareIds, setCompareIds] = useState([]);
  const [brandFilter, setBrandFilter] = useState('Todas');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('Todos');
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedVariantQty, setSelectedVariantQty] = useState(1);
  const [questions, setQuestions] = useState({});
  const [questionDraft, setQuestionDraft] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addressDraft, setAddressDraft] = useState({ id: '', alias: '', municipality: '', reference: '' });
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingMode, setShippingMode] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [stockSubscriptions, setStockSubscriptions] = useState([]);
  const [supportCases, setSupportCases] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [supportDraft, setSupportDraft] = useState({ orderId: '', reason: 'Entrega', description: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const hasLoadedState = useRef(false);
  const noticeTimeout = useRef(null);

  useEffect(() => {
    const loadState = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          hasLoadedState.current = true;
          return;
        }
        const parsed = JSON.parse(raw);
        const validProducts = Array.isArray(parsed.products)
          ? parsed.products.filter((product) =>
              product &&
              typeof product.id === 'string' &&
              typeof product.name === 'string' &&
              product.name.trim() &&
              typeof product.category === 'string' &&
              VALID_CATEGORIES.includes(product.category) &&
              Number.isInteger(Number(product.price)) &&
              Number(product.price) > 0 &&
              Number.isInteger(Number(product.stock)) &&
              Number(product.stock) >= 0 &&
              typeof product.description === 'string' &&
              product.description.trim().length >= 15
            ).map((product) => ({
              ...product,
              price: Number(product.price),
              stock: Number(product.stock),
              reviews: Array.isArray(product.reviews)
                ? product.reviews.filter((review) =>
                    review &&
                    Number.isInteger(Number(review.rating)) &&
                    Number(review.rating) >= 1 &&
                    Number(review.rating) <= 5
                  )
                : [],
            }))
          : [];

        const initialProductIds = new Set(initialProducts.map((product) => product.id));
        const restoredProducts = [
          ...initialProducts,
          ...validProducts.filter((product) => !initialProductIds.has(product.id)),
        ];
        setProducts(restoredProducts);

        const validFavoriteIds = new Set(restoredProducts.map((product) => product.id));
        setFavorites(
          Array.isArray(parsed.favorites)
            ? [...new Set(parsed.favorites.filter((id) => validFavoriteIds.has(id)))]
            : []
        );

        const restoredCart = [];
        if (Array.isArray(parsed.cart)) {
          parsed.cart.forEach((entry) => {
            if (!entry || typeof entry.id !== 'string') return;
            const product = restoredProducts.find((item) => item.id === entry.id);
            const qty = Number(entry.qty);
            if (!product || !Number.isInteger(qty) || qty <= 0) return;
            const variant = entry.variantId
              ? getProductVariants(product)?.find((item) => item.id === entry.variantId)
              : null;
            const availableStock = variant ? variant.stock : product.stock;
            if (availableStock <= 0) return;

            const existing = restoredCart.find((item) =>
              item.id === entry.id && (item.variantId || null) === (entry.variantId || null)
            );
            if (existing) {
              existing.qty = Math.min(existing.qty + qty, availableStock);
            } else {
              restoredCart.push({
                id: entry.id,
                variantId: entry.variantId || null,
                qty: Math.min(qty, availableStock),
              });
            }
          });
        }
        setCart(restoredCart);
        setHistory(Array.isArray(parsed.history) ? parsed.history : []);
        setAddresses(Array.isArray(parsed.addresses) ? parsed.addresses : []);
        setSelectedAddressId(
          Array.isArray(parsed.addresses)
            ? parsed.addresses.find((address) => address.isPrimary)?.id || null
            : null
        );
        setQuestions(parsed.questions && typeof parsed.questions === 'object' ? parsed.questions : {});
        setNotifications(Array.isArray(parsed.notifications) ? parsed.notifications : []);
        setStockSubscriptions(Array.isArray(parsed.stockSubscriptions) ? parsed.stockSubscriptions : []);
        setSupportCases(Array.isArray(parsed.supportCases) ? parsed.supportCases : []);
        setReturnRequests(Array.isArray(parsed.returnRequests) ? parsed.returnRequests : []);
        setDarkMode(parsed.darkMode === true);
        setLargeText(parsed.largeText === true);
      } catch (error) {
        console.log('Error loading store:', error);
        setProducts(initialProducts);
        setFavorites([]);
        setCart([]);
        setHistory([]);
      } finally {
        hasLoadedState.current = true;
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    const saveState = async () => {
      if (!hasLoadedState.current) return;
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            products,
            favorites,
            cart,
            history,
            addresses,
            questions,
            notifications,
            stockSubscriptions,
            supportCases,
            returnRequests,
            darkMode,
            largeText,
          })
        );
      } catch (error) {
        console.log('Error saving store:', error);
      }
    };

    saveState();
  }, [products, favorites, cart, history, addresses, questions, notifications, stockSubscriptions, supportCases, returnRequests, darkMode, largeText]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const matchesSearch =
        !search.trim() || product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter;
      const brand = product.brand || 'Sin marca';
      const matchesBrand = brandFilter === 'Todas' || brand === brandFilter;
      const minimum = appliedMinPrice === '' ? null : Number(appliedMinPrice);
      const maximum = appliedMaxPrice === '' ? null : Number(appliedMaxPrice);
      const matchesMinimum = minimum === null || product.price >= minimum;
      const matchesMaximum = maximum === null || product.price <= maximum;
      const hasVariantAvailability = getProductVariants(product)
        ? getProductVariants(product).some((variant) => variant.stock > 0)
        : false;
      const available = getProductVariants(product) ? hasVariantAvailability : product.stock > 0;
      const matchesAvailability =
        availabilityFilter === 'Todos' ||
        (availabilityFilter === 'Disponible' && available) ||
        (availabilityFilter === 'Agotado' && !available);
      return matchesSearch && matchesCategory && matchesBrand && matchesMinimum &&
        matchesMaximum && matchesAvailability;
    });

    if (sortMode === 'asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    }
    if (sortMode === 'desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, search, categoryFilter, sortMode, brandFilter, appliedMinPrice, appliedMaxPrice, availabilityFilter]);

  const favoriteProducts = products.filter((product) => favorites.includes(product.id));

  const cartItems = cart
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      if (!product) return null;
      const variant = entry.variantId
        ? getProductVariants(product)?.find((item) => item.id === entry.variantId) || null
        : null;
      return {
        ...entry,
        product,
        variant,
        unitPrice: variant ? variant.price : product.price,
      };
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) || null;
  const shipping =
    cartItems.length === 0 || !selectedAddress || !shippingMode
      ? 0
      : SHIPPING_RATES[selectedAddress.municipality]?.[shippingMode] || 0;
  const couponDiscount =
    couponApplied && cartItems.length > 0 ? Math.round(subtotal * COUPON_RATE) : 0;
  const total = Math.max(subtotal + shipping - couponDiscount, 0);

  const showNotice = (message) => {
    if (noticeTimeout.current) {
      clearTimeout(noticeTimeout.current);
    }
    setNotice(message);
    if (message) {
      noticeTimeout.current = setTimeout(() => {
        setNotice('');
        noticeTimeout.current = null;
      }, 2600);
    }
  };

  useEffect(
    () => () => {
      if (noticeTimeout.current) {
        clearTimeout(noticeTimeout.current);
      }
    },
    []
  );

  const toggleFavorite = (productId) => {
    const isFavorite = favorites.includes(productId);
    setFavorites((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
    showNotice(isFavorite ? 'Producto quitado de favoritos.' : 'Producto agregado a favoritos.');
  };

  const addToCart = (product, variant = null, quantity = 1) => {
    if (!product || product.stock <= 0) {
      showNotice('Este producto está agotado.');
      return;
    }

    if (getProductVariants(product) && !variant) {
      showNotice('Selecciona una variante antes de agregar el producto.');
      return;
    }

    const availableStock = variant ? variant.stock : product.stock;
    const requestedQty = Number(quantity);
    if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
      showNotice('La cantidad debe ser un número entero válido.');
      return;
    }
    if (requestedQty > availableStock) {
      showNotice(`Stock insuficiente. Máximo permitido: ${availableStock} unidad(es).`);
      return;
    }

    const existing = cart.find((item) => item.id === product.id && item.variantId === (variant?.id || null));
    if (existing && existing.qty + requestedQty > availableStock) {
      showNotice(`Stock insuficiente. Máximo permitido: ${availableStock} unidad(es).`);
      return;
    }

    setCart((previous) => {
      return existing
        ? previous.map((item) =>
            item.id === product.id && item.variantId === (variant?.id || null)
              ? { ...item, qty: item.qty + requestedQty }
              : item
          )
        : [...previous, { id: product.id, variantId: variant?.id || null, qty: requestedQty }];
    });
    showNotice(existing ? `Cantidad de ${product.name} actualizada.` : `${product.name} agregado al carrito.`);
  };

  const changeCartQty = (productId, variantId, delta) => {
    const item = cart.find((entry) =>
      entry.id === productId && (entry.variantId || null) === (variantId || null)
    );
    const product = products.find((entry) => entry.id === productId);
    if (!item || !product) return;

    const nextQty = item.qty + delta;
    const variant = variantId
      ? getProductVariants(product)?.find((entry) => entry.id === variantId)
      : null;
    const availableStock = variant ? variant.stock : product.stock;
    if (nextQty > availableStock) {
      showNotice('La cantidad supera el stock disponible.');
      return;
    }

    if (nextQty <= 0) {
      setCart((previous) => previous.filter((entry) =>
        !(entry.id === productId && (entry.variantId || null) === (variantId || null))
      ));
      showNotice(`${product.name} quitado del carrito.`);
      return;
    }

    setCart((previous) =>
      previous.map((entry) =>
        entry.id === productId && (entry.variantId || null) === (variantId || null)
          ? { ...entry, qty: nextQty }
          : entry
      )
    );
    showNotice(`Cantidad de ${product.name} actualizada: ${nextQty}.`);
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart((previous) => previous.filter((item) =>
      !(item.id === productId && (item.variantId || null) === (variantId || null))
    ));
    const product = products.find((item) => item.id === productId);
    if (product) showNotice(`${product.name} quitado del carrito.`);
  };

  const addNotification = (eventKey, message) => {
    setNotifications((previous) =>
      previous.some((item) => item.eventKey === eventKey)
        ? previous
        : [{ id: `NOT-${Date.now()}-${previous.length}`, eventKey, message, read: false, createdAt: new Date().toISOString() }, ...previous]
    );
  };

  const applyFilters = () => {
    const minimum = minPrice.trim() === '' ? null : Number(minPrice);
    const maximum = maxPrice.trim() === '' ? null : Number(maxPrice);
    if (
      (minimum !== null && (!Number.isFinite(minimum) || minimum < 0)) ||
      (maximum !== null && (!Number.isFinite(maximum) || maximum < 0))
    ) {
      showNotice('Los precios deben ser números mayores o iguales a cero.');
      return;
    }
    if (minimum !== null && maximum !== null && minimum > maximum) {
      showNotice('El precio mínimo no puede ser mayor que el precio máximo.');
      return;
    }
    setAppliedMinPrice(minPrice.trim());
    setAppliedMaxPrice(maxPrice.trim());
    showNotice('Filtros aplicados.');
  };

  const resetFilters = () => {
    setBrandFilter('Todas');
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setAvailabilityFilter('Todos');
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponApplied(false);
      showNotice('Ingresa un código válido para aplicar descuento.');
      return;
    }

    if (code === COUPON_CODE) {
      setCouponApplied(true);
      showNotice(`Cupón ${COUPON_CODE} aplicado: 10% de descuento.`);
      return;
    }

    setCouponApplied(false);
    showNotice('Cupón inválido.');
  };

  const handleCheckout = () => {
    if (!cartItems.length) {
      showNotice('Agrega al menos un producto antes de pagar.');
      return;
    }
    setScreen('checkout');
  };

  const handleConfirmPurchase = () => {
    if (!cartItems.length) {
      showNotice('El carrito está vacío.');
      return;
    }

    if (!selectedAddressId || !selectedAddress) {
      showNotice('Selecciona una dirección antes de finalizar la compra.');
      return;
    }
    if (!shippingMode) {
      showNotice('Selecciona una modalidad de envío antes de finalizar la compra.');
      return;
    }
    if (!SHIPPING_RATES[selectedAddress.municipality]?.[shippingMode]) {
      showNotice('El municipio seleccionado no tiene envío disponible.');
      return;
    }

    const cleanBuyer = {
      name: buyer.name.trim(),
      phone: buyer.phone.trim(),
      municipality: buyer.municipality.trim(),
      address: buyer.address.trim(),
    };

    if (!cleanBuyer.name || !cleanBuyer.phone || !cleanBuyer.municipality || !cleanBuyer.address) {
      showNotice('Validación fallida: completa todos los campos obligatorios de compra.');
      return;
    }

    if (
      !PERSON_TEXT_PATTERN.test(cleanBuyer.name) ||
      !hasPersonLetter(cleanBuyer.name)
    ) {
      showNotice('Validación fallida: el nombre solo puede contener letras, espacios, apóstrofes o guiones.');
      return;
    }

    if (
      !PERSON_TEXT_PATTERN.test(cleanBuyer.municipality) ||
      !hasPersonLetter(cleanBuyer.municipality)
    ) {
      showNotice('Validación fallida: la ciudad solo puede contener letras, espacios, apóstrofes o guiones.');
      return;
    }

    if (!/^\d+$/.test(cleanBuyer.phone)) {
      showNotice('Validación fallida: el teléfono solo puede contener números.');
      return;
    }

    for (const item of cartItems) {
      const stock = item.variant
        ? item.variant.stock
        : item.product.stock;
      if (item.qty > stock) {
        showNotice(`No hay stock suficiente para ${item.product.name}.`);
        return;
      }
    }

    const order = {
      id: generateOrderCode(),
      createdAt: new Date().toISOString(),
      buyer: cleanBuyer,
      status: 'Confirmado',
      statusHistory: [{ status: 'Confirmado', createdAt: new Date().toISOString() }],
      address: selectedAddress,
      shippingMode,
      shippingDays: SHIPPING_RATES[selectedAddress.municipality].days,
      items: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
        variantId: item.variantId,
        variantName: item.variant?.label || null,
        qty: item.qty,
        price: item.unitPrice,
      })),
      subtotal,
      shipping,
      couponCode: couponApplied ? COUPON_CODE : null,
      couponDiscount,
      total,
    };

    setProducts((previous) =>
      previous.map((product) => {
        const selectedItems = cartItems.filter((entry) => entry.id === product.id);
        if (!selectedItems.length) return product;
        let next = { ...product };
        if (getProductVariants(product)) {
          next.variants = getProductVariants(product).map((variant) => {
            const selected = selectedItems.find((entry) => entry.variantId === variant.id);
            return selected
              ? { ...variant, stock: Math.max(0, variant.stock - selected.qty) }
              : variant;
          });
          next.stock = next.variants.reduce((sum, variant) => sum + variant.stock, 0);
        } else {
          const selected = selectedItems.reduce((sum, entry) => sum + entry.qty, 0);
          next.stock = Math.max(0, product.stock - selected);
        }
        return next;
      })
    );

    setHistory((previous) => [order, ...previous]);
    setCart([]);
    setBuyer(DEFAULT_BUYER);
    setCouponInput('');
    setCouponApplied(false);
    setSelectedOrderId(order.id);
    setScreen('history');
    showNotice(`Pedido ${order.id} confirmado. Compra simulada sin cobro real.`);
  };

  const handleSellerSubmit = () => {
    const productId = sellerForm.id.trim();
    const productName = sellerForm.name.trim();
    const productCategory = sellerForm.category.trim();
    const productPrice = Number(sellerForm.price);
    const productStock = Number(sellerForm.stock);
    const productDescription = sellerForm.description.trim();

    if (
      !productId ||
      !productName ||
      !productCategory ||
      !productDescription ||
      !sellerForm.price.trim() ||
      !sellerForm.stock.trim()
    ) {
      showNotice('Validación fallida: completa todos los campos del producto.');
      return;
    }

    if (!VALID_CATEGORIES.includes(productCategory)) {
      showNotice(`Validación fallida: la categoría debe ser una de: ${VALID_CATEGORIES.join(', ')}.`);
      return;
    }

    if (productDescription.length < 15) {
      showNotice('Validación fallida: la descripción debe tener al menos 15 caracteres.');
      return;
    }

    if (!/^\d+$/.test(sellerForm.price) || !Number.isInteger(productPrice) || productPrice <= 0) {
      showNotice('Validación fallida: el precio debe ser un número entero mayor que 0.');
      return;
    }

    if (!/^\d+$/.test(sellerForm.stock) || !Number.isInteger(productStock) || productStock < 0) {
      showNotice('Validación fallida: el stock debe ser un número entero igual o mayor que 0.');
      return;
    }

    const payload = {
      id: productId,
      name: productName,
      category: productCategory,
      price: productPrice,
      stock: productStock,
      description: productDescription,
      reviews: [],
    };

    setProducts((previous) => {
      const exists = previous.some((product) => product.id === productId);
      if (exists) {
        return previous.map((product) =>
          product.id === productId
            ? { ...payload, reviews: product.reviews || [] }
            : product
        );
      }
      return [payload, ...previous];
    });

    setSellerForm({
      id: '',
      name: '',
      category: 'Tecnología',
      price: '',
      stock: '',
      description: '',
    });
    setScreen('catalog');
    showNotice('Producto guardado correctamente.');
  };

  const submitReview = () => {
    if (!selectedProductId) return;

    const rating = Number(reviewDraft);
    if (!rating || rating < 1 || rating > 5) {
      showNotice('La valoración debe estar entre 1 y 5 estrellas.');
      return;
    }

    setProducts((previous) =>
      previous.map((product) =>
        product.id === selectedProductId
          ? {
              ...product,
              reviews: [...(product.reviews || []), { rating }],
            }
          : product
      )
    );
    setReviewDraft(5);
    showNotice('Valoración registrada.');
  };

  const renderProductCard = (product) => (
    <Pressable
      key={product.id}
      style={styles.productCard}
      onPress={() => {
        setSelectedProductId(product.id);
        setScreen('detail');
      }}
    >
      <View style={styles.productVisual}>
        <Text style={styles.visualText}>{product.name.slice(0, 2).toUpperCase()}</Text>
      </View>

      <View style={styles.productContent}>
        <View style={styles.productHeaderRow}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.cardActionRow}>
            <Pressable onPress={() => toggleFavorite(product.id)}>
              <Text style={styles.favoriteText}>{favorites.includes(product.id) ? '♥' : '♡'}</Text>
            </Pressable>
            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                if (compareIds.includes(product.id)) {
                  setCompareIds((previous) => previous.filter((id) => id !== product.id));
                  showNotice('Producto retirado de la comparación.');
                } else if (compareIds.length >= 3) {
                  showNotice('Solo puedes comparar hasta tres productos.');
                } else {
                  setCompareIds((previous) => [...previous, product.id]);
                  showNotice('Producto agregado a la comparación.');
                }
              }}
              style={[
                styles.compareChip,
                compareIds.includes(product.id) && styles.compareChipActive,
              ]}
            >
              <Text style={styles.compareChipText}>
                {compareIds.includes(product.id) ? 'Comparando' : 'Comparar'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.productMeta}>
          {product.category} • {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
        </Text>
        <Text style={styles.priceText}>{money(product.price)}</Text>
        <Text style={styles.ratingText}>{averageRating(product.reviews).toFixed(1)} ★</Text>
      </View>
    </Pressable>
  );

  const renderCatalogScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Catálogo</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar productos"
        style={styles.input}
      />

      <View style={styles.filterBox}>
        <Text style={styles.label}>Filtros combinados</Text>
        <Text style={styles.label}>Marca</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['Todas', ...new Set(products.map((product) => product.brand || 'Sin marca'))].map((brand) => (
            <Pressable
              key={brand}
              onPress={() => setBrandFilter(brand)}
              style={[styles.categoryChip, brandFilter === brand && styles.categoryChipActive]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  brandFilter === brand && styles.categoryChipTextActive,
                ]}
              >
                {brand}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.filterPriceRow}>
          <TextInput
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder="Precio mínimo"
            keyboardType="numeric"
            style={[styles.input, styles.filterInput]}
          />
          <TextInput
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Precio máximo"
            keyboardType="numeric"
            style={[styles.input, styles.filterInput]}
          />
        </View>
        <View style={styles.sortOptions}>
          {['Todos', 'Disponible', 'Agotado'].map((option) => (
            <Pressable
              key={option}
              onPress={() => setAvailabilityFilter(option)}
              style={[styles.sortButton, availabilityFilter === option && styles.sortButtonActive]}
            >
              <Text style={styles.sortButtonText}>{option}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.filterActions}>
          <Pressable onPress={applyFilters} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Aplicar filtros</Text>
          </Pressable>
          <Pressable onPress={resetFilters} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Restablecer</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.label}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {['Todas', ...VALID_CATEGORIES].map((category) => (
          <Pressable
            key={category}
            onPress={() => setCategoryFilter(category)}
            style={[
              styles.categoryChip,
              categoryFilter === category && styles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                categoryFilter === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.label}>Ordenar por precio</Text>
        <View style={styles.sortOptions}>
          <Pressable
            style={[styles.sortButton, sortMode === 'asc' && styles.sortButtonActive]}
            onPress={() => setSortMode('asc')}
          >
            <Text style={styles.sortButtonText}>Menor</Text>
          </Pressable>
          <Pressable
            style={[styles.sortButton, sortMode === 'desc' && styles.sortButtonActive]}
            onPress={() => setSortMode('desc')}
          >
            <Text style={styles.sortButtonText}>Mayor</Text>
          </Pressable>
          <Pressable
            style={[styles.sortButton, sortMode === 'none' && styles.sortButtonActive]}
            onPress={() => setSortMode('none')}
          >
            <Text style={styles.sortButtonText}>Todo</Text>
          </Pressable>
        </View>
      </View>

      {compareIds.length > 0 && (
        <View style={styles.compareBox}>
          <Text style={styles.summaryTitle}>Comparador ({compareIds.length}/3)</Text>
          <View style={styles.compareColumns}>
            {compareIds.map((id) => {
              const product = products.find((item) => item.id === id);
              if (!product) return null;
              const variants = getProductVariants(product);
              const available = variants
                ? variants.some((variant) => variant.stock > 0)
                : product.stock > 0;
              return (
                <View key={id} style={styles.compareColumn}>
                  <Text style={styles.compareName}>{product.name}</Text>
                  <Text style={styles.orderDetailText}>Marca: {product.brand || 'Sin marca'}</Text>
                  <Text style={styles.orderDetailText}>{money(product.price)}</Text>
                  <Text style={styles.orderDetailText}>{available ? 'Disponible' : 'Agotado'}</Text>
                  <Pressable
                    onPress={() => setCompareIds((previous) => previous.filter((item) => item !== id))}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Retirar</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {filteredProducts.length ? (
        filteredProducts.map(renderProductCard)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No encontramos productos</Text>
          <Text style={styles.emptyText}>Prueba con otra palabra o cambia el filtro.</Text>
          <Pressable
            onPress={() => {
              setSearch('');
              setCategoryFilter('Todas');
              setSortMode('none');
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Limpiar búsqueda y filtros</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderDetailScreen = () => {
    if (!selectedProduct) return null;

    const productRating = averageRating(selectedProduct.reviews);
    const variants = getProductVariants(selectedProduct);
    const selectedVariant = variants?.find((variant) => variant.id === selectedVariantId) || null;
    const relatedProducts = products.filter((product) =>
      product.id !== selectedProduct.id &&
      product.category === selectedProduct.category &&
      (getProductVariants(product)
        ? getProductVariants(product).some((variant) => variant.stock > 0)
        : product.stock > 0)
    ).slice(0, 4);

    return (
      <View style={styles.screenBlock}>
        <View style={styles.detailHeader}>
          <Pressable onPress={() => setScreen('catalog')} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Volver</Text>
          </Pressable>
          <Pressable onPress={() => toggleFavorite(selectedProduct.id)} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>
              {favorites.includes(selectedProduct.id) ? 'Quitar favorito' : 'Favorito'}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={async () => {
            try {
              await Share.share({
                message: `${selectedProduct.name} - ${money(selectedProduct.price)}. Recomendación de NexaMarket (demo, sin sitio público publicado).`,
              });
            } catch (_error) {
              showNotice('No fue posible abrir compartir.');
            }
          }}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Compartir producto</Text>
        </Pressable>

        <View style={styles.detailVisual}>
          <Text style={styles.visualLarge}>{selectedProduct.name.slice(0, 2).toUpperCase()}</Text>
        </View>

        <Text style={styles.detailCategory}>{selectedProduct.category}</Text>
        <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
        <Text style={styles.detailPrice}>{money(selectedProduct.price)}</Text>
        <Text style={styles.detailMeta}>Disponibilidad: {selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades` : 'Agotado'}</Text>
        <Text style={styles.detailRating}>{productRating.toFixed(1)} ★ · {selectedProduct.reviews?.length || 0} valoraciones</Text>
        <Text style={styles.detailDescription}>{selectedProduct.description}</Text>

        {variants && (
          <View style={styles.variantBox}>
            <Text style={styles.label}>Elige una variante</Text>
            {variants.map((variant) => (
              <Pressable
                key={variant.id}
                onPress={() => {
                  setSelectedVariantId(variant.id);
                  setSelectedVariantQty(1);
                }}
                style={[
                  styles.variantOption,
                  selectedVariantId === variant.id && styles.variantOptionActive,
                  variant.stock <= 0 && styles.variantOptionDisabled,
                ]}
                disabled={variant.stock <= 0}
              >
                <Text style={styles.variantName}>
                  {variant.label} · {money(variant.price)}
                </Text>
                <Text style={styles.variantStock}>
                  {variant.stock > 0 ? `${variant.stock} disponibles` : 'Agotado'}
                </Text>
              </Pressable>
            ))}
            {selectedVariant && (
              <View style={styles.variantQuantityRow}>
                <Text style={styles.label}>Cantidad máxima: {selectedVariant.stock}</Text>
                <TextInput
                  value={String(selectedVariantQty)}
                  onChangeText={(value) => setSelectedVariantQty(Number(value) || 0)}
                  keyboardType="numeric"
                  style={[styles.input, styles.quantityInput]}
                />
              </View>
            )}
          </View>
        )}

        <Pressable
          onPress={() => addToCart(selectedProduct, selectedVariant, selectedVariantQty)}
          style={[styles.primaryButton, (selectedProduct.stock <= 0 || (variants && !selectedVariant)) && styles.buttonDisabled]}
          disabled={selectedProduct.stock <= 0}
        >
          <Text style={styles.primaryButtonText}>
            {selectedProduct.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
          </Text>
        </Pressable>

        <Text style={styles.label}>Valora este producto</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setReviewDraft(star)}>
              <Text style={[styles.star, reviewDraft >= star && styles.starActive]}>
                ★
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={submitReview} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Guardar valoración</Text>
        </Pressable>

        <View style={styles.filterBox}>
          <Text style={styles.summaryTitle}>Productos relacionados</Text>
          {relatedProducts.length ? relatedProducts.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => {
                setSelectedProductId(product.id);
                setSelectedVariantId(null);
                setSelectedVariantQty(1);
                setScreen('detail');
              }}
              style={styles.historyCard}
            >
              <Text style={styles.cartItemName}>{product.name}</Text>
              <Text style={styles.cartItemMeta}>{product.brand || 'Sin marca'} · {money(product.price)}</Text>
            </Pressable>
          )) : (
            <Text style={styles.emptyText}>No hay productos relacionados disponibles.</Text>
          )}
        </View>

        <View style={styles.filterBox}>
          <Text style={styles.summaryTitle}>Preguntas</Text>
          {(questions[selectedProduct.id] || []).map((question) => (
            <View key={question.id} style={styles.orderDetailBox}>
              <Text style={styles.orderDetailText}>{question.text}</Text>
              <Text style={styles.cartItemMeta}>
                {new Date(question.createdAt).toLocaleString('es-CO')} · {question.status}
              </Text>
              {question.status === 'Respondida' && (
                <Text style={styles.orderDetailText}>Respuesta demostrativa: {question.answer}</Text>
              )}
            </View>
          ))}
          {!questions[selectedProduct.id]?.length && (
            <Text style={styles.emptyText}>Todavía no hay preguntas para este producto.</Text>
          )}
          <TextInput
            value={questionDraft}
            onChangeText={setQuestionDraft}
            placeholder="Escribe una pregunta"
            multiline
            style={[styles.input, styles.textArea]}
          />
          <Pressable
            onPress={() => {
              const text = questionDraft.trim();
              if (text.length < 10) {
                showNotice('La pregunta debe tener al menos 10 caracteres.');
                return;
              }
              const question = {
                id: `P-${Date.now()}`,
                text,
                status: 'Pendiente',
                createdAt: new Date().toISOString(),
              };
              setQuestions((previous) => ({
                ...previous,
                [selectedProduct.id]: [...(previous[selectedProduct.id] || []), question],
              }));
              setQuestionDraft('');
              showNotice('Pregunta registrada como Pendiente.');
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Enviar pregunta</Text>
          </Pressable>
          {(questions[selectedProduct.id] || []).some((item) => item.status === 'Pendiente') && (
            <Pressable
              onPress={() => {
                setQuestions((previous) => ({
                  ...previous,
                  [selectedProduct.id]: (previous[selectedProduct.id] || []).map((item) =>
                    item.status === 'Pendiente'
                      ? {
                          ...item,
                          status: 'Respondida',
                          answer: 'Respuesta simulada del centro de demostración.',
                        }
                      : item
                  ),
                }));
                showNotice('Las preguntas pendientes recibieron una respuesta demostrativa.');
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Simular respuesta demostrativa</Text>
            </Pressable>
          )}

          {((variants && variants.every((variant) => variant.stock <= 0)) ||
            (!variants && selectedProduct.stock <= 0)) && (
            <Pressable
              onPress={() => {
                const key = selectedVariantId || selectedProduct.id;
                setStockSubscriptions((previous) =>
                  previous.some((item) => item.articleKey === key)
                    ? previous
                    : [
                        ...previous,
                        { id: `SUB-${Date.now()}`, articleKey: key, productId: selectedProduct.id, variantId: selectedVariantId, active: true },
                      ]
                );
                showNotice('Suscripción de reposición registrada una sola vez.');
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Avisarme cuando haya stock</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderFavoritesScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Favoritos</Text>

      {favoriteProducts.length ? (
        favoriteProducts.map(renderProductCard)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No tienes favoritos todavía</Text>
          <Text style={styles.emptyText}>Guarda un producto para verlo aquí.</Text>
          <Pressable onPress={() => setScreen('catalog')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Explorar catálogo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderCartScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Carrito</Text>

      {cartItems.length ? (
        <>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.product.name}</Text>
                {item.variant && <Text style={styles.cartItemMeta}>Variante: {item.variant.label}</Text>}
                <Text style={styles.cartItemMeta}>{money(item.unitPrice)} c/u</Text>
              </View>

              <View style={styles.cartControls}>
                <Pressable onPress={() => changeCartQty(item.id, item.variantId, -1)} style={styles.qtyButton}>
                  <Text style={styles.qtyButtonText}>-</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{item.qty}</Text>
                <Pressable onPress={() => changeCartQty(item.id, item.variantId, 1)} style={styles.qtyButton}>
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => removeFromCart(item.id, item.variantId)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </Pressable>
            </View>
          ))}

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Resumen</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{money(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>{shipping === 0 ? 'Gratis' : money(shipping)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Descuento (10%)</Text>
              <Text style={styles.summaryValue}>{couponApplied ? `-${money(couponDiscount)}` : money(0)}</Text>
            </View>
            <View style={styles.summaryRowHighlight}>
              <Text style={styles.summaryLabelStrong}>Total</Text>
              <Text style={styles.summaryValueStrong}>{money(total)}</Text>
            </View>
          </View>

          <View style={styles.couponBox}>
            <Text style={styles.label}>Cupón</Text>
            <TextInput
              value={couponInput}
              onChangeText={setCouponInput}
              placeholder="BIENVENIDO10"
              style={styles.input}
            />
            <Pressable onPress={applyCoupon} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Aplicar</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleCheckout} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continuar compra</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>Agrega productos para comenzar la compra.</Text>
          <Pressable onPress={() => setScreen('catalog')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Ir al catálogo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderCheckoutScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Datos del comprador</Text>
      <View style={styles.filterBox}>
        <Text style={styles.summaryTitle}>Dirección de entrega</Text>
        {addresses.length ? addresses.map((address) => (
          <Pressable
            key={address.id}
            onPress={() => setSelectedAddressId(address.id)}
            style={[
              styles.addressOption,
              selectedAddressId === address.id && styles.addressOptionActive,
            ]}
          >
            <Text style={styles.cartItemName}>
              {address.alias} {address.isPrimary ? '· Principal' : ''}
            </Text>
            <Text style={styles.cartItemMeta}>
              {address.municipality} · {address.reference}
            </Text>
          </Pressable>
        )) : (
          <Text style={styles.emptyText}>No tienes direcciones registradas.</Text>
        )}
        <Pressable onPress={() => setScreen('addresses')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Administrar mis direcciones</Text>
        </Pressable>
      </View>

      <View style={styles.filterBox}>
        <Text style={styles.summaryTitle}>Modalidad de envío</Text>
        {VALID_SHIPPING_MODES.map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setShippingMode(mode)}
            style={[
              styles.addressOption,
              shippingMode === mode && styles.addressOptionActive,
            ]}
          >
            <Text style={styles.cartItemName}>{mode}</Text>
            {selectedAddress && SHIPPING_RATES[selectedAddress.municipality] ? (
              <Text style={styles.cartItemMeta}>
                {money(SHIPPING_RATES[selectedAddress.municipality][mode])} · {SHIPPING_RATES[selectedAddress.municipality].days}
              </Text>
            ) : (
              <Text style={styles.cartItemMeta}>Elige una dirección compatible</Text>
            )}
          </Pressable>
        ))}
      </View>
      <TextInput
        value={buyer.name}
        onChangeText={(value) => setBuyer((previous) => ({ ...previous, name: value }))}
        placeholder="Nombre completo"
        style={styles.input}
      />
      <TextInput
        value={buyer.phone}
        onChangeText={(value) => setBuyer((previous) => ({ ...previous, phone: value }))}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        value={buyer.municipality}
        onChangeText={(value) => setBuyer((previous) => ({ ...previous, municipality: value }))}
        placeholder="Municipio"
        style={styles.input}
      />
      <TextInput
        value={buyer.address}
        onChangeText={(value) => setBuyer((previous) => ({ ...previous, address: value }))}
        placeholder="Dirección"
        multiline
        style={[styles.input, styles.textArea]}
      />

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Resumen final</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{money(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío</Text>
          <Text style={styles.summaryValue}>{shipping === 0 ? 'Gratis' : money(shipping)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Descuento (10%)</Text>
          <Text style={styles.summaryValue}>{couponApplied ? `-${money(couponDiscount)}` : money(0)}</Text>
        </View>
        <View style={styles.summaryRowHighlight}>
          <Text style={styles.summaryLabelStrong}>Total</Text>
          <Text style={styles.summaryValueStrong}>{money(total)}</Text>
        </View>
      </View>

      <View style={styles.orderDetailBox}>
        <Text style={styles.orderDetailText}>
          Esta compra es una simulación académica. No se realiza cobro real ni se solicitan datos sensibles.
        </Text>
      </View>

      <Pressable onPress={handleConfirmPurchase} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Confirmar compra simulada</Text>
      </Pressable>
      <Pressable onPress={() => setScreen('cart')} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Volver al carrito</Text>
      </Pressable>
    </View>
  );

  const renderHistoryScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Historial</Text>

      {history.length ? (
        history.map((order) => (
          <View key={order.id} style={styles.historyCard}>
            <Pressable onPress={() => setSelectedOrderId(order.id)}>
              <Text style={styles.historyCode}>{order.id}</Text>
              <Text style={styles.historyDate}>
                {new Date(order.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
              <Text style={styles.historyTotal}>{money(order.total)}</Text>
            </Pressable>

            {selectedOrderId === order.id && (
              <View style={styles.orderDetailBox}>
                <Text style={styles.orderDetailTitle}>Detalle</Text>
                <Text style={styles.orderDetailText}>Cliente: {order.buyer.name}</Text>
                <Text style={styles.orderDetailText}>Municipio: {order.buyer.municipality}</Text>
                <Text style={styles.orderDetailText}>Estado: {order.status || 'Confirmado'}</Text>
                <Text style={styles.orderDetailTitle}>Historial de estados</Text>
                {(order.statusHistory || [{ status: order.status || 'Confirmado', createdAt: order.createdAt }]).map((event, index) => (
                  <Text key={`${order.id}-${event.status}-${index}`} style={styles.orderDetailText}>
                    {new Date(event.createdAt).toLocaleString('es-CO')} · {event.status}
                  </Text>
                ))}
                {order.items.map((item) => (
                  <Text key={`${order.id}-${item.id}`} style={styles.orderDetailText}>
                    {item.name}{item.variantName ? ` · ${item.variantName}` : ''} x {item.qty} · {money(item.price)}
                  </Text>
                ))}
                <Text style={styles.orderDetailText}>Subtotal: {money(order.subtotal)}</Text>
                <Text style={styles.orderDetailText}>Envío: {order.shipping === 0 ? 'Gratis' : money(order.shipping)}</Text>
                <Text style={styles.orderDetailText}>
                  Cupón: {order.couponCode || (order.couponDiscount > 0 ? COUPON_CODE : 'No aplicado')}
                </Text>
                <Text style={styles.orderDetailText}>
                  Descuento (10%): -{money(order.couponDiscount || 0)}
                </Text>
                <Text style={styles.orderDetailText}>Total final: {money(order.total)}</Text>
                <Pressable
                  onPress={() => advanceOrder(order.id)}
                  style={styles.secondaryButton}
                  disabled={['Entregado', 'Cancelado'].includes(order.status)}
                >
                  <Text style={styles.secondaryButtonText}>Simular avance de entrega</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const status = order.status || 'Confirmado';
                    if (status === 'Cancelado') {
                      showNotice('El pedido ya está cancelado; no se duplicarán reintegros.');
                      return;
                    }
                    if (['En camino', 'Entregado'].includes(status)) {
                      showNotice(
                        status === 'Entregado'
                          ? 'No se puede cancelar: el pedido ya fue entregado.'
                          : 'No se puede cancelar: el pedido ya está en camino.'
                      );
                      return;
                    }
                    if (cancelConfirmId !== order.id) {
                      setCancelConfirmId(order.id);
                      showNotice('Confirma nuevamente la cancelación para restituir el stock.');
                      return;
                    }
                    setCancelConfirmId(null);
                    cancelOrder(order.id);
                  }}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>
                    {cancelConfirmId === order.id ? 'Confirmar cancelación' : 'Cancelar compra'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setSupportDraft((previous) => ({ ...previous, orderId: order.id }));
                    setScreen('support');
                  }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Solicitar ayuda</Text>
                </Pressable>
                {order.status === 'Entregado' && !returnRequests.some((item) => item.orderId === order.id) && (
                  <Pressable
                    onPress={() => {
                      setReturnRequests((previous) => [
                        ...previous,
                        { id: `DEV-${Date.now()}`, orderId: order.id, status: 'Solicitada', createdAt: new Date().toISOString() },
                      ]);
                      showNotice('Devolución simulada solicitada.');
                    }}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Solicitar devolución simulada</Text>
                  </Pressable>
                )}
                {order.status !== 'Entregado' && (
                  <Text style={styles.emptyText}>La devolución se habilita solo cuando el pedido está Entregado.</Text>
                )}
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No hay pedidos registrados</Text>
          <Text style={styles.emptyText}>Cuando confirmes una compra, aparecerá aquí.</Text>
          <Pressable onPress={() => setScreen('catalog')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Ir al catálogo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderSellerScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Panel del vendedor</Text>

      <TextInput
        value={sellerForm.id}
        onChangeText={(value) => setSellerForm((previous) => ({ ...previous, id: value }))}
        placeholder="ID del producto"
        style={styles.input}
      />
      <TextInput
        value={sellerForm.name}
        onChangeText={(value) => setSellerForm((previous) => ({ ...previous, name: value }))}
        placeholder="Nombre del producto"
        style={styles.input}
      />
      <TextInput
        value={sellerForm.category}
        onChangeText={(value) => setSellerForm((previous) => ({ ...previous, category: value }))}
        placeholder="Categoría"
        style={styles.input}
      />
      <TextInput
        value={sellerForm.price}
        onChangeText={(value) => setSellerForm((previous) => ({ ...previous, price: value }))}
        placeholder="Precio en COP"
        style={styles.input}
      />
      <TextInput
        value={sellerForm.stock}
        onChangeText={(value) => setSellerForm((previous) => ({ ...previous, stock: value }))}
        placeholder="Stock"
        style={styles.input}
      />
      <TextInput
        value={sellerForm.description}
        onChangeText={(value) => setSellerForm((previous) => ({ ...previous, description: value }))}
        placeholder="Descripción"
        multiline
        style={[styles.input, styles.textArea]}
      />

      <Pressable onPress={handleSellerSubmit} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Guardar producto</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Editar producto existente</Text>
      {products.map((product) => (
        <Pressable
          key={product.id}
          onPress={() =>
            setSellerForm({
              id: product.id,
              name: product.name,
              category: product.category,
              price: String(product.price),
              stock: String(product.stock),
              description: product.description,
            })
          }
          style={styles.historyCard}
        >
          <Text style={styles.cartItemName}>{product.name}</Text>
          <Text style={styles.cartItemMeta}>{product.category} · {money(product.price)} · Stock: {product.stock}</Text>
          <Text style={styles.linkButtonText}>Editar en el formulario</Text>
        </Pressable>
      ))}
    </View>
  );

  const saveAddress = () => {
    const alias = addressDraft.alias.trim();
    const municipality = addressDraft.municipality.trim();
    const reference = addressDraft.reference.trim();
    if (!alias || !municipality || !reference) {
      showNotice('Completa alias, municipio y referencia de entrega.');
      return;
    }
    if (!SHIPPING_RATES[municipality]) {
      showNotice('Municipio no compatible. Usa Mosquera, Funza o Madrid.');
      return;
    }
    setAddresses((previous) => {
      if (addressDraft.id) {
        return previous.map((address) =>
          address.id === addressDraft.id
            ? { ...address, alias, municipality, reference }
            : address
        );
      }
      const id = `DIR-${Date.now()}`;
      const isPrimary = previous.length === 0;
      if (isPrimary) setSelectedAddressId(id);
      return [...previous, { id, alias, municipality, reference, isPrimary }];
    });
    setAddressDraft({ id: '', alias: '', municipality: '', reference: '' });
    showNotice('Dirección ficticia guardada correctamente.');
  };

  const renderAddressesScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Mis direcciones</Text>
      <TextInput
        value={addressDraft.alias}
        onChangeText={(value) => setAddressDraft((previous) => ({ ...previous, alias: value }))}
        placeholder="Alias, ejemplo: Casa ficticia"
        style={styles.input}
      />
      <TextInput
        value={addressDraft.municipality}
        onChangeText={(value) => setAddressDraft((previous) => ({ ...previous, municipality: value }))}
        placeholder="Mosquera, Funza o Madrid"
        style={styles.input}
      />
      <TextInput
        value={addressDraft.reference}
        onChangeText={(value) => setAddressDraft((previous) => ({ ...previous, reference: value }))}
        placeholder="Referencia de entrega ficticia"
        style={[styles.input, styles.textArea]}
        multiline
      />
      <Pressable onPress={saveAddress} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>{addressDraft.id ? 'Guardar cambios' : 'Agregar dirección'}</Text>
      </Pressable>

      {addresses.map((address) => (
        <View key={address.id} style={styles.historyCard}>
          <Text style={styles.cartItemName}>{address.alias} {address.isPrimary ? '· Principal' : ''}</Text>
          <Text style={styles.cartItemMeta}>{address.municipality} · {address.reference}</Text>
          <View style={styles.sortOptions}>
            <Pressable
              onPress={() => {
                setAddresses((previous) =>
                  previous.map((item) => ({ ...item, isPrimary: item.id === address.id }))
                );
                setSelectedAddressId(address.id);
                showNotice('Dirección principal actualizada.');
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Usar como principal</Text>
            </Pressable>
            <Pressable
              onPress={() => setAddressDraft({
                id: address.id,
                alias: address.alias,
                municipality: address.municipality,
                reference: address.reference,
              })}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Editar</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );

  const advanceOrder = (orderId) => {
    const order = history.find((item) => item.id === orderId);
    if (!order) return;
    const status = order.status || 'Confirmado';
    if (status === 'En camino') {
      const nextStatus = 'Entregado';
      setHistory((previous) => previous.map((item) =>
        item.id === orderId
          ? {
              ...item,
              status: nextStatus,
              statusHistory: [
                ...(item.statusHistory || []),
                { status: nextStatus, createdAt: new Date().toISOString() },
              ],
            }
          : item
      ));
      addNotification(`order-${orderId}-${nextStatus}`, `Pedido ${orderId}: nuevo estado Entregado.`);
      showNotice('Pedido entregado.');
      return;
    }
    if (!['Confirmado', 'Preparando'].includes(status)) {
      showNotice('El pedido no admite nuevas transiciones.');
      return;
    }
    const nextStatus = status === 'Confirmado' ? 'Preparando' : 'En camino';
    setHistory((previous) => previous.map((item) =>
      item.id === orderId
        ? {
            ...item,
            status: nextStatus,
            statusHistory: [
              ...(item.statusHistory || []),
              { status: nextStatus, createdAt: new Date().toISOString() },
            ],
          }
        : item
    ));
    addNotification(`order-${orderId}-${nextStatus}`, `Pedido ${orderId}: nuevo estado ${nextStatus}.`);
    showNotice(`Pedido ${orderId} avanzado a ${nextStatus}.`);
  };

  const cancelOrder = (orderId) => {
    const order = history.find((item) => item.id === orderId);
    if (!order) return;
    const status = order.status || 'Confirmado';
    if (status === 'Cancelado' || order.cancellationProcessed) {
      showNotice('El pedido ya está cancelado; no se duplicarán reintegros.');
      return;
    }
    if (!['Confirmado', 'Preparando'].includes(status)) {
      showNotice(
        status === 'Entregado'
          ? 'No se puede cancelar: el pedido ya fue entregado.'
          : status === 'En camino'
            ? 'No se puede cancelar: el pedido ya está en camino.'
            : 'El estado actual no permite cancelar la compra.'
      );
      return;
    }

    setProducts((previous) => previous.map((product) => {
      const orderItems = (order.items || []).filter((item) => item.id === product.id);
      if (!orderItems.length) return product;
      if (getProductVariants(product)) {
        const variants = getProductVariants(product).map((variant) => {
          const quantity = orderItems
            .filter((item) => item.variantId === variant.id)
            .reduce((sum, item) => sum + item.qty, 0);
          return { ...variant, stock: variant.stock + quantity };
        });
        return { ...product, variants, stock: variants.reduce((sum, variant) => sum + variant.stock, 0) };
      }
      const quantity = orderItems.reduce((sum, item) => sum + item.qty, 0);
      return { ...product, stock: product.stock + quantity };
    }));
    setHistory((previous) => previous.map((item) =>
      item.id === orderId
        ? {
            ...item,
            status: 'Cancelado',
              cancellationProcessed: true,
            statusHistory: [
              ...(item.statusHistory || []),
              { status: 'Cancelado', createdAt: new Date().toISOString() },
            ],
          }
        : item
    ));
    addNotification(`order-${orderId}-Cancelado`, `Pedido ${orderId}: nuevo estado Cancelado.`);
    showNotice('Compra cancelada y unidades restituidas.');
  };

  const renderNotificationsScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Notificaciones</Text>
      {notifications.length ? notifications.map((notification) => (
        <Pressable
          key={notification.id}
          onPress={() => setNotifications((previous) =>
            previous.map((item) =>
              item.id === notification.id ? { ...item, read: true } : item
            )
          )}
          style={[
            styles.historyCard,
            notification.read ? styles.notificationRead : styles.notificationUnread,
          ]}
        >
          <Text style={styles.cartItemName}>{notification.message}</Text>
          <Text style={styles.cartItemMeta}>
            {new Date(notification.createdAt).toLocaleString('es-CO')} · {notification.read ? 'Leído' : 'Sin leer'}
          </Text>
        </Pressable>
      )) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
          <Text style={styles.emptyText}>Los cambios de pedidos y reposiciones aparecerán aquí.</Text>
        </View>
      )}
    </View>
  );

  const renderRestockScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Demostración de reposición</Text>
      <Text style={styles.emptyText}>Acción ficticia para practicar: no modifica órdenes reales ni inventario real.</Text>
      {stockSubscriptions.map((subscription) => {
        const product = products.find((item) => item.id === subscription.productId);
        if (!subscription.active || !product) return null;
        const variant = subscription.variantId
          ? getProductVariants(product)?.find((item) => item.id === subscription.variantId)
          : null;
        return (
          <View key={subscription.id} style={styles.historyCard}>
            <Text style={styles.cartItemName}>
              {product.name}{variant ? ` · ${variant.label}` : ''}
            </Text>
            <Text style={styles.cartItemMeta}>Suscripción activa</Text>
            <View style={styles.sortOptions}>
              <Pressable
                onPress={() => {
                  setProducts((previous) => previous.map((item) => {
                    if (item.id !== product.id) return item;
                    if (subscription.variantId && getProductVariants(item)) {
                      const variants = getProductVariants(item).map((entry) =>
                        entry.id === subscription.variantId
                          ? { ...entry, stock: entry.stock + 5 }
                          : entry
                      );
                      return { ...item, variants, stock: variants.reduce((sum, entry) => sum + entry.stock, 0) };
                    }
                    return { ...item, stock: item.stock + 5 };
                  }));
                  setStockSubscriptions((previous) =>
                    previous.map((item) =>
                      item.id === subscription.id ? { ...item, active: false } : item
                    )
                  );
                  addNotification(
                    `restock-${subscription.id}-${Date.now()}`,
                    `Reposición simulada: ${product.name}${variant ? ` · ${variant.label}` : ''} vuelve a estar disponible.`
                  );
                  showNotice('Reposición simulada completada.');
                }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Simular reposición</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setStockSubscriptions((previous) =>
                    previous.map((item) =>
                      item.id === subscription.id ? { ...item, active: false } : item
                    )
                  );
                  showNotice('Suscripción cancelada.');
                }}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Cancelar aviso</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      {!stockSubscriptions.some((subscription) => subscription.active) && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin suscripciones activas</Text>
          <Text style={styles.emptyText}>Solicita Avisarme desde un artículo agotado.</Text>
        </View>
      )}
    </View>
  );

  const createSupportCase = () => {
    if (!supportDraft.orderId) {
      showNotice('Selecciona un pedido antes de enviar la solicitud.');
      return;
    }
    if (!supportDraft.description.trim() || supportDraft.description.trim().length < 15) {
      showNotice('La descripción debe tener al menos 15 caracteres.');
      return;
    }
    const caseNumber = `CAS-${String(supportCases.length + 1).padStart(4, '0')}-${supportDraft.orderId.slice(-4)}`;
    setSupportCases((previous) => [
      {
        id: caseNumber,
        orderId: supportDraft.orderId,
        reason: supportDraft.reason,
        description: supportDraft.description.trim(),
        status: 'Abierto',
        createdAt: new Date().toISOString(),
      },
      ...previous,
    ]);
    setSupportDraft({ orderId: '', reason: 'Entrega', description: '' });
    showNotice(`Solicitud creada: ${caseNumber}`);
  };

  const renderSupportScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Centro de ayuda</Text>
      <Text style={styles.label}>Pedido</Text>
      {history.length ? history.map((order) => (
        <Pressable
          key={order.id}
          onPress={() => setSupportDraft((previous) => ({ ...previous, orderId: order.id }))}
          style={[
            styles.addressOption,
            supportDraft.orderId === order.id && styles.addressOptionActive,
          ]}
        >
          <Text style={styles.cartItemName}>{order.id}</Text>
          <Text style={styles.cartItemMeta}>{order.status || 'Confirmado'} · {money(order.total)}</Text>
        </Pressable>
      )) : (
        <Text style={styles.emptyText}>No hay pedidos en el historial.</Text>
      )}
      <Text style={styles.label}>Motivo</Text>
      <View style={styles.sortOptions}>
        {['Entrega', 'Producto', 'Otro'].map((reason) => (
          <Pressable
            key={reason}
            onPress={() => setSupportDraft((previous) => ({ ...previous, reason }))}
            style={[
              styles.sortButton,
              supportDraft.reason === reason && styles.sortButtonActive,
            ]}
          >
            <Text style={styles.sortButtonText}>{reason}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={supportDraft.description}
        onChangeText={(value) => setSupportDraft((previous) => ({ ...previous, description: value }))}
        placeholder="Describe la solicitud con al menos 15 caracteres"
        multiline
        style={[styles.input, styles.textArea]}
      />
      <Pressable onPress={createSupportCase} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Enviar solicitud</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Mis casos</Text>
      {supportCases.map((supportCase) => (
        <View key={supportCase.id} style={styles.historyCard}>
          <Text style={styles.historyCode}>{supportCase.id}</Text>
          <Text style={styles.cartItemMeta}>
            Pedido: {supportCase.orderId} · {supportCase.reason} · {supportCase.status}
          </Text>
          <Text style={styles.orderDetailText}>{supportCase.description}</Text>
          {supportCase.status === 'Respondido' && (
            <Text style={styles.orderDetailText}>Respuesta ficticia: {supportCase.answer}</Text>
          )}
          {supportCase.status === 'Abierto' && (
            <Pressable
              onPress={() => setSupportCases((previous) =>
                previous.map((item) =>
                  item.id === supportCase.id
                    ? {
                        ...item,
                        status: 'Respondido',
                        answer: 'Respuesta de prueba registrada por el centro de demostración.',
                      }
                    : item
                )
              )}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Simular respuesta</Text>
            </Pressable>
          )}
        </View>
      ))}
      {!supportCases.length && (
        <Text style={styles.emptyText}>Todavía no hay solicitudes registradas.</Text>
      )}
    </View>
  );

  const renderSettingsScreen = () => (
    <View style={styles.screenBlock}>
      <Text style={styles.sectionTitle}>Accesibilidad</Text>
      <Pressable
        onPress={() => setDarkMode((previous) => !previous)}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>{darkMode ? 'Desactivar modo oscuro' : 'Activar modo oscuro'}</Text>
      </Pressable>
      <Pressable
        onPress={() => setLargeText((previous) => !previous)}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>{largeText ? 'Usar tamaño normal' : 'Aumentar tamaño de letra'}</Text>
      </Pressable>
    </View>
  );

  const renderScreen = () => {
    if (screen === 'catalog') return renderCatalogScreen();
    if (screen === 'detail') return renderDetailScreen();
    if (screen === 'favorites') return renderFavoritesScreen();
    if (screen === 'cart') return renderCartScreen();
    if (screen === 'checkout') return renderCheckoutScreen();
    if (screen === 'history') return renderHistoryScreen();
    if (screen === 'seller') return renderSellerScreen();
    if (screen === 'addresses') return renderAddressesScreen();
    if (screen === 'notifications') return renderNotificationsScreen();
    if (screen === 'restock') return renderRestockScreen();
    if (screen === 'support') return renderSupportScreen();
    if (screen === 'settings') return renderSettingsScreen();
    return renderCatalogScreen();
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        darkMode && { backgroundColor: '#0f172a' },
        largeText && { paddingHorizontal: 2 },
      ]}
    >
      <StatusBar style="light" />

      <View style={styles.topBar}>
        <Text style={styles.brandName}>{BRAND.name}</Text>
        <Text style={styles.brandSlogan}>{BRAND.slogan}</Text>
      </View>

      <View style={styles.navBar}>
        {[
          { key: 'catalog', label: 'Catálogo' },
          { key: 'favorites', label: 'Favoritos' },
          { key: 'cart', label: 'Carrito' },
          { key: 'history', label: 'Historial' },
          { key: 'seller', label: 'Vendedor' },
          { key: 'addresses', label: 'Direcciones' },
          { key: 'notifications', label: 'Avisos' },
          { key: 'restock', label: 'Reposición' },
          { key: 'support', label: 'Ayuda' },
          { key: 'settings', label: 'Accesibilidad' },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setScreen(item.key)}
            style={[styles.navItem, screen === item.key && styles.navItemActive]}
          >
            <Text style={[styles.navText, screen === item.key && styles.navTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {notice ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {renderScreen()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSlogan: {
    color: '#dbeafe',
    marginTop: 4,
    fontSize: 13,
  },
  navBar: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#edf2ff',
    minWidth: 84,
    alignItems: 'center',
  },
  navItemActive: {
    backgroundColor: BRAND.primary,
  },
  navText: {
    color: BRAND.primary,
    fontWeight: '700',
  },
  navTextActive: {
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  screenBlock: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: BRAND.dark,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: BRAND.dark,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chipScroll: {
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: BRAND.primary,
  },
  categoryChipText: {
    color: BRAND.dark,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  label: {
    fontWeight: '700',
    color: BRAND.dark,
    marginTop: 2,
  },
  sortRow: {
    gap: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortButtonActive: {
    backgroundColor: BRAND.accent,
  },
  sortButtonText: {
    color: BRAND.dark,
    fontWeight: '700',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productVisual: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualText: {
    color: BRAND.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  productContent: {
    flex: 1,
    justifyContent: 'center',
  },
  productHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND.dark,
    flex: 1,
    marginRight: 10,
  },
  favoriteText: {
    fontSize: 22,
    color: BRAND.accent,
  },
  productMeta: {
    color: BRAND.muted,
    marginTop: 4,
    fontSize: 13,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: BRAND.primary,
    marginTop: 6,
  },
  ratingText: {
    marginTop: 4,
    color: '#f59e0b',
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BRAND.dark,
  },
  emptyText: {
    color: BRAND.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkButtonText: {
    color: BRAND.primary,
    fontWeight: '700',
  },
  detailVisual: {
    backgroundColor: '#dbeafe',
    borderRadius: 22,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualLarge: {
    color: BRAND.primary,
    fontSize: 50,
    fontWeight: '900',
  },
  detailCategory: {
    color: BRAND.accent,
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: BRAND.dark,
  },
  detailPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: BRAND.primary,
  },
  detailMeta: {
    color: BRAND.muted,
    fontWeight: '600',
  },
  detailRating: {
    color: '#f59e0b',
    fontWeight: '700',
  },
  detailDescription: {
    color: BRAND.dark,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: BRAND.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  star: {
    fontSize: 28,
    color: '#d1d5db',
  },
  starActive: {
    color: '#fbbf24',
  },
  cartItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  cartItemInfo: {
    gap: 4,
  },
  cartItemName: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND.dark,
  },
  cartItemMeta: {
    color: BRAND.muted,
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    color: BRAND.dark,
    fontSize: 22,
    fontWeight: '800',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND.dark,
    minWidth: 24,
    textAlign: 'center',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    color: BRAND.danger,
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BRAND.dark,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
  },
  summaryLabel: {
    color: BRAND.muted,
    fontWeight: '600',
  },
  summaryLabelStrong: {
    color: BRAND.dark,
    fontWeight: '800',
  },
  summaryValue: {
    color: BRAND.dark,
    fontWeight: '700',
  },
  summaryValueStrong: {
    color: BRAND.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  couponBox: {
    gap: 8,
  },
  noticeBox: {
    backgroundColor: BRAND.primary,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  noticeText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 10,
  },
  historyCode: {
    fontWeight: '800',
    fontSize: 18,
    color: BRAND.primary,
  },
  historyDate: {
    color: BRAND.muted,
  },
  historyTotal: {
    color: BRAND.dark,
    fontWeight: '800',
    marginTop: 6,
  },
  orderDetailBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    gap: 3,
  },
  orderDetailTitle: {
    fontWeight: '800',
    color: BRAND.dark,
  },
  orderDetailText: {
    color: BRAND.dark,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compareChip: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  compareChipActive: {
    backgroundColor: BRAND.accent,
  },
  compareChipText: {
    color: BRAND.primary,
    fontWeight: '800',
    fontSize: 11,
  },
  filterBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  filterPriceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterInput: {
    flex: 1,
  },
  filterActions: {
    gap: 8,
  },
  compareBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  compareColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compareColumn: {
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  compareName: {
    color: BRAND.dark,
    fontWeight: '800',
  },
  variantBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  variantOption: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
  },
  variantOptionActive: {
    borderColor: BRAND.primary,
    backgroundColor: '#dbeafe',
  },
  variantOptionDisabled: {
    opacity: 0.55,
  },
  variantName: {
    color: BRAND.dark,
    fontWeight: '800',
  },
  variantStock: {
    color: BRAND.muted,
  },
  variantQuantityRow: {
    gap: 6,
  },
  quantityInput: {
    width: 110,
  },
  addressOption: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  addressOptionActive: {
    borderColor: BRAND.primary,
    backgroundColor: '#dbeafe',
  },
  notificationUnread: {
    borderColor: BRAND.accent,
  },
  notificationRead: {
    opacity: 0.75,
  },
});
