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
const VALID_CATEGORIES = ['Tecnología', 'Hogar', 'Deporte', 'Mascotas', 'Moda'];
const DEFAULT_BUYER = { name: '', phone: '', municipality: '', address: '' };

const initialProducts = [
  {
    id: 'PROD-001',
    name: 'Audífonos inalámbricos',
    category: 'Tecnología',
    price: 189000,
    stock: 14,
    description: 'Audio envolvente con cancelación de ruido y batería de larga duración para estudiar o trabajar sin distracciones.',
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }, { rating: 5 }],
  },
  {
    id: 'PROD-002',
    name: 'Reloj inteligente',
    category: 'Tecnología',
    price: 245000,
    stock: 8,
    description: 'Reloj inteligente con seguimiento de sueño, pasos y notificaciones para una vida activa y conectada.',
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 4 }],
  },
  {
    id: 'PROD-003',
    name: 'Cámara compacta',
    category: 'Tecnología',
    price: 329000,
    stock: 5,
    description: 'Captura video y fotos nítidas para viajes, reuniones y contenido rápido en redes sociales.',
    reviews: [{ rating: 5 }, { rating: 5 }],
  },
  {
    id: 'PROD-004',
    name: 'Lámpara de escritorio',
    category: 'Hogar',
    price: 89000,
    stock: 11,
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
    category: 'Deporte',
    price: 129000,
    stock: 9,
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
  const hasLoadedState = useRef(false);

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

        const restoredProducts = validProducts.length ? validProducts : initialProducts;
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
            if (!product || product.stock <= 0 || !Number.isInteger(qty) || qty <= 0) return;

            const existing = restoredCart.find((item) => item.id === entry.id);
            if (existing) {
              existing.qty = Math.min(existing.qty + qty, product.stock);
            } else {
              restoredCart.push({ id: entry.id, qty: Math.min(qty, product.stock) });
            }
          });
        }
        setCart(restoredCart);
        setHistory(Array.isArray(parsed.history) ? parsed.history : []);
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
          })
        );
      } catch (error) {
        console.log('Error saving store:', error);
      }
    };

    saveState();
  }, [products, favorites, cart, history]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const matchesSearch =
        !search.trim() || product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (sortMode === 'asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    }
    if (sortMode === 'desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, search, categoryFilter, sortMode]);

  const favoriteProducts = products.filter((product) => favorites.includes(product.id));

  const cartItems = cart
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      if (!product) return null;
      return { ...entry, product };
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.product.price, 0);
  const shipping = cartItems.length === 0 ? 0 : subtotal < 150000 ? 8000 : 0;
  const couponDiscount = couponApplied && cartItems.length > 0 ? subtotal * 0.1 : 0;
  const total = Math.max(subtotal + shipping - couponDiscount, 0);

  const showNotice = (message) => {
    setNotice(message);
    if (message) {
      setTimeout(() => setNotice(''), 2600);
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
  };

  const addToCart = (product) => {
    if (!product || product.stock <= 0) {
      showNotice('Este producto está agotado.');
      return;
    }

    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);
      if (existing) {
        const nextQty = existing.qty + 1;
        if (nextQty > product.stock) {
          showNotice('No hay suficiente stock para esa cantidad.');
          return previous;
        }

        return previous.map((item) =>
          item.id === product.id ? { ...item, qty: nextQty } : item
        );
      }

      return [...previous, { id: product.id, qty: 1 }];
    });
  };

  const changeCartQty = (productId, delta) => {
    setCart((previous) => {
      const item = previous.find((entry) => entry.id === productId);
      if (!item) return previous;

      const nextQty = item.qty + delta;
      const product = products.find((entry) => entry.id === productId);
      if (!product) return previous;

      if (nextQty <= 0) {
        return previous.filter((entry) => entry.id !== productId);
      }

      if (nextQty > product.stock) {
        showNotice('La cantidad supera el stock disponible.');
        return previous;
      }

      return previous.map((entry) =>
        entry.id === productId ? { ...entry, qty: nextQty } : entry
      );
    });
  };

  const removeFromCart = (productId) => {
    setCart((previous) => previous.filter((item) => item.id !== productId));
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponApplied(false);
      showNotice('Ingresa un código válido para aplicar descuento.');
      return;
    }

    if (code === 'BIENVENIDO10') {
      setCouponApplied(true);
      showNotice('Cupón BIENVENIDO10 aplicado.');
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

    const cleanBuyer = {
      name: buyer.name.trim(),
      phone: buyer.phone.trim(),
      municipality: buyer.municipality.trim(),
      address: buyer.address.trim(),
    };

    if (!cleanBuyer.name || !cleanBuyer.phone || !cleanBuyer.municipality || !cleanBuyer.address) {
      showNotice('Completa todos los campos obligatorios de compra.');
      return;
    }

    for (const item of cartItems) {
      if (item.qty > item.product.stock) {
        showNotice(`No hay stock suficiente para ${item.product.name}.`);
        return;
      }
    }

    const order = {
      id: generateOrderCode(),
      createdAt: new Date().toISOString(),
      buyer: cleanBuyer,
      items: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
        qty: item.qty,
        price: item.product.price,
      })),
      subtotal,
      shipping,
      couponDiscount,
      total,
    };

    setProducts((previous) =>
      previous.map((product) => {
        const selectedItem = cartItems.find((entry) => entry.id === product.id);
        if (!selectedItem) return product;
        return { ...product, stock: Math.max(0, product.stock - selectedItem.qty) };
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

    if (!productId || !productName || !productCategory || !productDescription) {
      showNotice('Completa todos los campos del producto.');
      return;
    }

    if (!VALID_CATEGORIES.includes(productCategory)) {
      showNotice(`La categoría debe ser una de: ${VALID_CATEGORIES.join(', ')}.`);
      return;
    }

    if (productDescription.length < 15) {
      showNotice('La descripción debe tener al menos 15 caracteres.');
      return;
    }

    if (!Number.isInteger(productPrice) || productPrice <= 0) {
      showNotice('El precio debe ser un número entero positivo.');
      return;
    }

    if (!Number.isInteger(productStock) || productStock < 0) {
      showNotice('El stock debe ser un número entero no negativo.');
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
          <Pressable onPress={() => toggleFavorite(product.id)}>
            <Text style={styles.favoriteText}>{favorites.includes(product.id) ? '♥' : '♡'}</Text>
          </Pressable>
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

      {filteredProducts.length ? (
        filteredProducts.map(renderProductCard)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No encontramos productos</Text>
          <Text style={styles.emptyText}>Prueba con otra palabra o cambia el filtro.</Text>
        </View>
      )}
    </View>
  );

  const renderDetailScreen = () => {
    if (!selectedProduct) return null;

    const productRating = averageRating(selectedProduct.reviews);

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

        <View style={styles.detailVisual}>
          <Text style={styles.visualLarge}>{selectedProduct.name.slice(0, 2).toUpperCase()}</Text>
        </View>

        <Text style={styles.detailCategory}>{selectedProduct.category}</Text>
        <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
        <Text style={styles.detailPrice}>{money(selectedProduct.price)}</Text>
        <Text style={styles.detailMeta}>Disponibilidad: {selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades` : 'Agotado'}</Text>
        <Text style={styles.detailRating}>{productRating.toFixed(1)} ★ · {selectedProduct.reviews?.length || 0} valoraciones</Text>
        <Text style={styles.detailDescription}>{selectedProduct.description}</Text>

        <Pressable
          onPress={() => addToCart(selectedProduct)}
          style={[styles.primaryButton, selectedProduct.stock <= 0 && styles.buttonDisabled]}
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
                <Text style={styles.cartItemMeta}>{money(item.product.price)} c/u</Text>
              </View>

              <View style={styles.cartControls}>
                <Pressable onPress={() => changeCartQty(item.id, -1)} style={styles.qtyButton}>
                  <Text style={styles.qtyButtonText}>-</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{item.qty}</Text>
                <Pressable onPress={() => changeCartQty(item.id, 1)} style={styles.qtyButton}>
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => removeFromCart(item.id)} style={styles.deleteButton}>
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
              <Text style={styles.summaryLabel}>Descuento</Text>
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
          <Text style={styles.summaryLabel}>Descuento</Text>
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
                {order.items.map((item) => (
                  <Text key={`${order.id}-${item.id}`} style={styles.orderDetailText}>
                    {item.name} x {item.qty} · {money(item.price)}
                  </Text>
                ))}
                <Text style={styles.orderDetailText}>Envío: {order.shipping === 0 ? 'Gratis' : money(order.shipping)}</Text>
                <Text style={styles.orderDetailText}>Descuento: {money(order.couponDiscount || 0)}</Text>
                <Text style={styles.orderDetailText}>Total final: {money(order.total)}</Text>
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
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={sellerForm.stock}
        onChangeText={(value) => setSellerForm((previous) => ({ ...previous, stock: value }))}
        placeholder="Stock"
        keyboardType="numeric"
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

  const renderScreen = () => {
    if (screen === 'catalog') return renderCatalogScreen();
    if (screen === 'detail') return renderDetailScreen();
    if (screen === 'favorites') return renderFavoritesScreen();
    if (screen === 'cart') return renderCartScreen();
    if (screen === 'checkout') return renderCheckoutScreen();
    if (screen === 'history') return renderHistoryScreen();
    if (screen === 'seller') return renderSellerScreen();
    return renderCatalogScreen();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
});
