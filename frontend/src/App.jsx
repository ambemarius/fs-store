import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Loader2, RefreshCw, ImageOff } from 'lucide-react';
import { getProducts, createProduct, toggleAvailability } from './api';

// 👉 IMPORTANT: replace this with the shop owner's real WhatsApp number,
// in international format with no "+", spaces or dashes (e.g. Cameroon: 2376XXXXXXXX).
const VENDOR_WHATSAPP = '674003320';

const CATEGORIES = ['Sneakers', 'Formal', 'Boots', 'Ladies Wear', 'Sandals'];

// Format a number as XAF currency, e.g. 25000 -> "25,000 XAF".
const formatPrice = (value) =>
  `${Number(value).toLocaleString('en-US')} XAF`;

// Build a prefilled WhatsApp order link for a given shoe.
function whatsappOrderLink(product) {
  const message =
    `Hello! 👋 I would like to order this shoe from MarketShoe:\n\n` +
    `*${product.name}*\n` +
    `Price: ${formatPrice(product.price)}\n` +
    `Available sizes: ${product.sizes.join(', ')}\n\n` +
    `Is it still available?`;
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
function Storefront() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProducts(category ? { category } : {})
      .then((data) => {
        if (active) setProducts(data);
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

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            category === '' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === c ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading shoes…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No shoes in this category yet. Check back soon! 👟
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p._id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <ProductImage urls={p.imageUrls} alt={p.name} />
            <div className="p-3 flex flex-col flex-1">
              <span className="text-xs text-slate-400 uppercase tracking-wide">{p.category}</span>
              <h3 className="font-semibold text-slate-800 leading-tight mt-0.5">{p.name}</h3>
              <p className="text-blue-600 font-bold mt-1">{formatPrice(p.price)}</p>
              <p className="text-xs text-slate-500 mt-1">Sizes: {p.sizes.join(', ')}</p>
              <a
                href={whatsappOrderLink(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Order on WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Dashboard — what the shop owner uses to manage inventory
// ----------------------------------------------------------------------------
function Dashboard() {
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
                <button
                  onClick={() => handleToggle(p._id)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.isAvailable ? 'Available' : 'Sold Out'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
export default function App() {
  const [view, setView] = useState('storefront'); // 'storefront' or 'dashboard'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center text-sm shadow-md">
        <h1 className="font-bold text-lg tracking-wide">👟 MarketShoe SmartCatalog</h1>
        <button
          onClick={() => setView(view === 'storefront' ? 'dashboard' : 'storefront')}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-medium transition-all"
        >
          {view === 'storefront' ? 'Go to Admin Dashboard' : 'View Customer Catalog'}
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 md:max-w-5xl">
        {view === 'storefront' ? <Storefront /> : <Dashboard />}
      </main>
    </div>
  );
}
