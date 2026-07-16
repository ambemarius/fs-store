import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Loader2, RefreshCw, ImageOff, LogIn, LogOut, UserCircle2, PackageCheck, Search, Menu, MapPin, ChevronRight, X, Trash2 } from 'lucide-react';
import {
  getProducts,
  createProduct,
  toggleAvailability,
  deleteProduct,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} from './api';

// 👉 IMPORTANT: replace this with the shop owner's real WhatsApp number,
// in international format with no "+", spaces or dashes (e.g. Cameroon: 2376XXXXXXXX).
const VENDOR_WHATSAPP = '674003320';

const CATEGORIES = ['Sneakers', 'Formal', 'Boots', 'Ladies Wear', 'Sandals'];

// Format a number as XAF currency, e.g. 25000 -> "25,000 XAF".
const formatPrice = (value) =>
  `${Number(value).toLocaleString('en-US')} XAF`;

// Build one prefilled WhatsApp message for the full cart.
function whatsappOrderLink(cart, user) {
  const lines = cart.map((item, index) => (
    `${index + 1}. ${item.productName} | Qty: ${item.quantity} | Size: ${item.size} | Color: ${item.color || 'Default'} | Unit: ${formatPrice(item.price)}`
  ));

  const total = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const customerName = user?.name || 'Customer';

  const message =
    `Hello! I would like to place this order from Shore Store.\n\n` +
    `Customer: ${customerName}\n` +
    `Items:\n${lines.join('\n')}\n\n` +
    `Total: ${formatPrice(total)}\n` +
    `Please confirm availability.`;

  return `https://wa.me/${VENDOR_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function ProductImage({ urls, alt }) {
  const src = Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
  if (!src) {
    return (
      <div className="aspect-square w-full bg-slate-100 flex items-center justify-center text-slate-400">
        <ImageOff className="w-8 h-8" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="aspect-square w-full object-cover bg-slate-100"
    />
  );
}

// ----------------------------------------------------------------------------
// Storefront — what customers see
// ----------------------------------------------------------------------------
function Storefront({ user, onAuthRequired, onOrderCreated }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedQty, setSelectedQty] = useState({});
  const [selectedColor, setSelectedColor] = useState({});
  const [orderMessage, setOrderMessage] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProducts(category ? { category } : {})
      .then((data) => {
        if (active) {
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setError('Could not load shoes. Invalid server response format.');
          }
        }
      })
      .catch(() => {
        if (active) setError('Could not load shoes. Is the backend running?');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category]);

  const addToCart = (product) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const sizeValue = selectedSizes[product._id] || product.sizes[0];
    const qtyValue = Number(selectedQty[product._id] || 1);
    const colorValue = selectedColor[product._id] || 'Default';

    setCart((current) => {
      const existing = current.find((item) => item.productId === product._id && item.size === sizeValue && item.color === colorValue);
      if (existing) {
        return current.map((item) =>
          item.productId === product._id && item.size === sizeValue && item.color === colorValue
            ? { ...item, quantity: item.quantity + qtyValue }
            : item
        );
      }
      return [...current, {
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: qtyValue,
        size: sizeValue,
        color: colorValue,
        imageUrl: product.imageUrls?.[0] || ''
      }];
    });
    setOrderMessage(`${product.name} added to cart.`);
  };

  const removeFromCart = (indexToRemove) => {
    setCart((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const submitOrder = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (cart.length === 0) {
      setOrderMessage('Please add at least one shoe to your cart.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      await createOrder({ items: cart, notes: 'Ordered from storefront' });
      setCart([]);
      setOrderMessage('Order submitted successfully.');
      onOrderCreated();
    } catch (error) {
      setOrderMessage(error?.response?.data?.message || 'Could not submit order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const orderOnWhatsApp = () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (cart.length === 0) {
      setOrderMessage('Please add at least one shoe to your cart.');
      return;
    }

    window.open(whatsappOrderLink(cart, user), '_blank', 'noopener,noreferrer');
  };

  const filteredProducts = products.filter((product) => {
    if (!searchText.trim()) {
      return true;
    }
    const query = searchText.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {orderMessage && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{orderMessage}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-sky-100 via-blue-100 to-amber-100 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Shore Store</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Shop Like a Big Marketplace, Built for Shoes</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-700">Browse all styles instantly. Sign in only when you want to select sizes, add quantities, and place your order.</p>
        <div className="mt-4 flex max-w-2xl items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-3 py-2 text-sm outline-none"
            placeholder="Search shoes, categories, colors..."
          />
          <button className="bg-amber-300 px-4 py-2 text-slate-900">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Menu className="h-4 w-4" /> Departments
        </div>
        <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            category === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              category === c ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading shoes…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">{error}</div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No shoes in this category yet. Check back soon! 👟
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((p) => (
          <div key={p._id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
            <ProductImage urls={p.imageUrls} alt={p.name} />
            <div className="p-3">
              <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{p.category}</span>
              <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold text-slate-800">{p.name}</h3>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatPrice(p.price)}</p>
              <p className="mt-1 text-xs text-slate-500">Sizes: {p.sizes.join(', ')}</p>
              <div className="mt-3 space-y-2">
                {user?.role === 'admin' ? (
                  <div className="bg-slate-50 p-3 mt-4 text-center rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Admin View</p>
                  </div>
                ) : (
                  <>
                    <label className="block text-xs text-slate-500">Size</label>
                    <select
                      value={selectedSizes[p._id] || p.sizes[0]}
                      onChange={(e) => setSelectedSizes((current) => ({ ...current, [p._id]: Number(e.target.value) }))}
                      disabled={!user}
                      className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                    >
                      {p.sizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <label className="block text-xs text-slate-500">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedQty[p._id] || 1}
                      onChange={(e) => setSelectedQty((current) => ({ ...current, [p._id]: e.target.value }))}
                      disabled={!user}
                      className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                    />
                    <label className="block text-xs text-slate-500">Color</label>
                    <input
                      type="text"
                      value={selectedColor[p._id] || ''}
                      onChange={(e) => setSelectedColor((current) => ({ ...current, [p._id]: e.target.value }))}
                      disabled={!user}
                      className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                      placeholder="e.g. White"
                    />
                    <button
                      onClick={() => addToCart(p)}
                      disabled={!user}
                      className="w-full rounded-md bg-amber-300 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {user ? 'Add to cart' : 'Sign in to select'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {user?.role !== 'admin' && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Cart</h2>
            <span className="text-sm text-slate-500">{cart.length} item(s)</span>
          </div>
          {cart.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">Your cart is empty.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {cart.map((item, index) => (
                <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{item.productName}</p>
                    <p className="text-slate-500">Qty {item.quantity} · Size {item.size} · {item.color}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-700">{formatPrice(item.price * item.quantity)}</p>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove from cart"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={submitOrder}
                disabled={isSubmittingOrder}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-yellow-400 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-yellow-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmittingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmittingOrder ? 'Submitting...' : 'Submit Online'}
              </button>
              <button
                onClick={orderOnWhatsApp}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                <ShoppingBag className="w-4 h-4" /> Order on WhatsApp
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Dashboard — what the shop owner uses to manage inventory
// ----------------------------------------------------------------------------
function Dashboard({ orders, loadingOrders, onStatusChange }) {
  const emptyForm = { name: '', price: '', category: CATEGORIES[0], sizes: '' };
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setMessage({ type: 'error', text: 'Could not load existing products.' }))
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one image.' });
      return;
    }

    const data = new FormData();
    data.append('name', form.name);
    data.append('price', form.price);
    data.append('category', form.category);
    data.append('sizes', form.sizes); // backend splits this comma string into numbers
    for (const file of files) data.append('images', file);

    try {
      setSubmitting(true);
      await createProduct(data);
      setMessage({ type: 'success', text: `"${form.name}" added to the catalog! ✅` });
      setForm(emptyForm);
      setFiles([]);
      e.target.reset();
      loadProducts();
    } catch (err) {
      const text = err?.response?.data?.message || 'Failed to add product.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAvailability(id);
      loadProducts();
    } catch {
      setMessage({ type: 'error', text: 'Could not update availability.' });
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"? This will also delete its images from Cloudinary.`)) {
      try {
        await deleteProduct(id);
        setMessage({ type: 'success', text: `"${name}" was successfully deleted.` });
        loadProducts();
      } catch (err) {
        const text = err?.response?.data?.message || 'Failed to delete product.';
        setMessage({ type: 'error', text });
      }
    }
  };

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Add product form */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add a new shoe
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Shoe name</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="e.g. Nike Air Max" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Price (XAF)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className={inputClass} placeholder="e.g. 25000" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Sizes (comma separated)</label>
            <input name="sizes" value={form.sizes} onChange={handleChange} required className={inputClass} placeholder="e.g. 41, 42, 43" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Images (up to 4)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 4))}
              className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {files.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">{files.length} image(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {submitting ? 'Uploading…' : 'Add shoe'}
          </button>
        </form>
      </div>

      {/* Existing inventory */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Current inventory</h2>
          <button onClick={loadProducts} className="text-slate-500 hover:text-slate-800" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center text-slate-500 py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        ) : products.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">No shoes added yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {products.map((p) => (
              <li key={p._id} className="flex items-center gap-3 py-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <ProductImage urls={p.imageUrls} alt={p.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category} · {formatPrice(p.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(p._id)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      p.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {p.isAvailable ? 'Available' : 'Sold Out'}
                  </button>
                  <button
                    onClick={() => handleDelete(p._id, p.name)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Admin Orders Section */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PackageCheck className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-800">Customer Orders</h2>
        </div>
        {loadingOrders ? (
          <div className="flex items-center text-slate-500 py-4"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading orders…</div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No customer orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <p className="font-semibold text-slate-800">{order.user?.name || 'Customer'} <span className="font-normal text-slate-500">({order.user?.email || 'N/A'})</span></p>
                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                    <p className={`text-xs font-bold uppercase tracking-wide mt-1 ${order.status === 'confirmed' ? 'text-green-600' : order.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'}`}>{order.status}</p>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-slate-700 mb-3">
                  {order.items.map((item, index) => (
                    <li key={`${item.productName}-${index}`} className="flex justify-between">
                      <span>{item.quantity}x {item.productName} ({item.color || 'Default'}, Size {item.sizes?.join(', ') || item.size})</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 bg-slate-50 p-2 rounded-lg">
                  <span className="text-xs font-semibold text-slate-500 mr-2 self-center uppercase">Update Status:</span>
                  {['pending', 'confirmed', 'cancelled'].map((status) => (
                    <button key={status} onClick={() => onStatusChange(order._id, status)} className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${order.status === status ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
export default function App() {
  const [view, setView] = useState('storefront');
  const [authView, setAuthView] = useState('login');
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.user);
      if (data.user.role === 'admin') setView('dashboard');
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage('');
    setAuthSubmitting(true);
    try {
      const data = authView === 'register'
        ? await registerUser(authForm)
        : await loginUser(authForm);
      setUser(data.user);
      if (data.user.role === 'admin') setView('dashboard');
      setAuthForm({ name: '', email: '', password: '' });
      setAuthMessage(authView === 'register' ? 'Account created successfully.' : 'Signed in successfully.');
      setShowAuthPanel(false);
    } catch (error) {
      if (error?.code === 'ECONNABORTED') {
        setAuthMessage('Request timed out. Please confirm backend is running and try again.');
      } else {
        setAuthMessage(error?.response?.data?.message || 'Authentication failed.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setAuthMessage('Signed out successfully.');
    } catch {
      setAuthMessage('Could not sign out.');
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoadingOrders(true);
      const data = user.role === 'admin' ? await getAllOrders() : await getMyOrders();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const handleOrderStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      loadOrders();
    } catch {
      setAuthMessage('Could not update order status.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="text-white shadow-md">
        <div className="bg-slate-950 px-4 py-3">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-wide">Sarkozy Wholesale Shoes Supply <span className="text-amber-300">store</span></h1>
              <div className="hidden items-center gap-2 text-xs text-slate-300 md:flex">
                <MapPin className="h-4 w-4" />
                Delivering to All Region of Cameroon
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1.5">
              <UserCircle2 className="h-4 w-4" />
              <span>{user.name} ({user.role})</span>
            </div>
          ) : null}
          {user?.role === 'admin' ? (
            <button
              onClick={() => setView(view === 'storefront' ? 'dashboard' : 'storefront')}
              className="rounded-md bg-slate-700 px-3 py-2 text-xs font-medium transition-all hover:bg-slate-600"
            >
              {view === 'storefront' ? 'Go to Admin Dashboard' : 'View Customer Catalog'}
            </button>
          ) : null}
          {user ? (
            <button onClick={handleLogout} className="rounded-md bg-slate-700 px-3 py-2 text-xs font-medium hover:bg-slate-600">
              <LogOut className="mr-1 inline h-4 w-4" /> Logout
            </button>
          ) : (
            <button
              onClick={() => setShowAuthPanel((current) => !current)}
              className="rounded-md bg-amber-300 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-200"
            >
              <LogIn className="mr-1 inline h-4 w-4" /> Sign in
            </button>
          )}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 px-4 py-2 text-sm">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-5 text-slate-100">
            <span className="inline-flex items-center gap-1"><Menu className="h-4 w-4" /> All</span>
            <span>Deals</span>
            <span>New Arrivals</span>
            <span>Top Brands</span>
            <span className="inline-flex items-center gap-1">Customer Orders <ChevronRight className="h-3.5 w-3.5" /></span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {!user && showAuthPanel ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex gap-2">
              <button onClick={() => setAuthView('login')} className={`rounded-full px-3 py-1.5 text-sm ${authView === 'login' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Sign in</button>
              <button onClick={() => setAuthView('register')} className={`rounded-full px-3 py-1.5 text-sm ${authView === 'register' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Create account</button>
            </div>
            {authMessage ? <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{authMessage}</div> : null}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authView === 'register' ? (
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Full name</label>
                  <input name="name" value={authForm.name} onChange={handleAuthChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </div>
              ) : null}
              <div>
                <label className="mb-1 block text-sm text-slate-600">Email</label>
                <input name="email" type="email" value={authForm.email} onChange={handleAuthChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Password</label>
                <input name="password" type="password" value={authForm.password} onChange={handleAuthChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <button type="submit" disabled={authSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 font-medium text-white disabled:opacity-60">
                {authSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} {authSubmitting ? (authView === 'register' ? 'Creating account...' : 'Signing in...') : (authView === 'register' ? 'Create account' : 'Sign in')}
              </button>
            </form>
          </div>
        ) : null}

        <div className="space-y-6">
          {view === 'storefront' ? (
            <Storefront
              user={user}
              onAuthRequired={() => {
                setAuthMessage('Please sign in to select shoes and place an order.');
                setShowAuthPanel(true);
              }}
              onOrderCreated={loadOrders}
            />
          ) : user && user.role === 'admin' ? (
            <Dashboard orders={orders} loadingOrders={loadingOrders} onStatusChange={handleOrderStatusChange} />
          ) : (
            <div className="rounded-xl bg-white p-6 text-center text-slate-600 shadow-sm">
              Sign in as an admin to access the dashboard.
            </div>
          )}

          {user && (view === 'storefront' || user.role !== 'admin') ? (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-800">My orders</h2>
              </div>
              {loadingOrders ? (
                <div className="mt-4 flex items-center text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading orders…</div>
              ) : orders.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No orders yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {orders.map((order) => (
                    <div key={order._id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-800">Order placed</p>
                          <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-700">{formatPrice(order.totalAmount)}</p>
                          <p className="text-xs uppercase tracking-wide text-slate-500">{order.status}</p>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {order.items.map((item, index) => (
                          <li key={`${item.productName}-${index}`}>
                            {item.productName} · Qty {item.quantity} · Size {item.sizes?.join(', ') || item.size} · {item.color || 'Default'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
