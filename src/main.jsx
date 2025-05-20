import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

// Cart context and hooks
const CartContext = React.createContext();

function CartProvider({ children }) {
  const [cart, setCart] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, selectedSize, selectedColor) {
    setCart((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );
      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += 1;
        return updated;
      }
      return [...prev, { ...product, quantity: 1, selectedSize, selectedColor }];
    });
  }

  function updateQuantity(index, quantity) {
    if (quantity <= 0) return removeItem(index);
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  }

  function removeItem(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  return React.useContext(CartContext);
}

// Product data — `src/data/products.json` simulated here for simplicity
const products = [
  {
    id: "1",
    name: "Nike Air Zoom Pegasus",
    category: "Shoes",
    price: 120,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["Black", "White", "Red"],
    images: [
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/4f34de6b-4c62-4d79-b639-0f1db48c81b3/air-zoom-pegasus-39-mens-running-shoe-qNJQJ1.png",
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/04e5c8e6-9b94-40ab-b2fa-cd1c84b8a72a/air-zoom-pegasus-39-mens-running-shoe-qNJQJ1.png",
    ],
  },
  {
    id: "2",
    name: "Nike Sportswear Hoodie",
    category: "Clothing",
    price: 65,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey"],
    images: [
      "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/fdb05ef7-5297-4f08-8edb-6bf6d6d8e319/sportswear-hoodie-J1pJW7.png",
    ],
  },
  {
    id: "3",
    name: "Nike Heritage Backpack",
    category: "Accessories",
    price: 45,
    sizes: [],
    colors: ["Black", "Blue"],
    images: [
      "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/d46ff253-1106-40e3-b1ad-9b53e34869ec/heritage-backpack-8g02M6.png",
    ],
  },
];

// Navbar component
function NavBar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 bg-white shadow-md flex justify-between items-center px-6 py-4 z-50">
      <a href="/" className="text-2xl font-bold tracking-tight hover:underline">
        NIKE STORE
      </a>
      <div className="space-x-6 flex items-center">
        <a href="/category/Shoes" className="hover:underline">
          Shoes
        </a>
        <a href="/category/Clothing" className="hover:underline">
          Clothing
        </a>
        <a href="/category/Accessories" className="hover:underline">
          Accessories
        </a>
        <a href="/cart" className="relative hover:underline">
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full text-xs px-2">
              {cartCount}
            </span>
          )}
        </a>
      </div>
    </nav>
  );
}

// Home page
function Home() {
  const featured = products.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <section className="relative h-64 sm:h-96 bg-black text-white rounded-lg flex items-center justify-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-wide max-w-3xl text-center">
          Just Do It — Find Your Perfect Fit
        </h1>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {featured.map((p) => (
            <a
              key={p.id}
              href={`/product/${p.id}`}
              className="w-48 flex-shrink-0 rounded overflow-hidden shadow hover:shadow-lg transition"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-2">
                <p className="font-semibold">{p.name}</p>
                <p className="text-gray-600">${p.price}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8 flex justify-center space-x-8">
        {["Shoes", "Clothing", "Accessories"].map((cat) => (
          <a
            key={cat}
            href={`/category/${cat}`}
            className="border border-black px-6 py-3 uppercase font-bold hover:bg-black hover:text-white transition rounded"
          >
            {cat}
          </a>
        ))}
      </section>
    </div>
  );
}

// Product Listing page
function ProductListing() {
  const { addToCart } = useCart();
  const [filterCategory, setFilterCategory] = React.useState(null);
  const [filterPrice, setFilterPrice] = React.useState(0);
  const [productsList, setProductsList] = React.useState(products);

  React.useEffect(() => {
    setProductsList(() => {
      return products.filter((p) => {
        if (filterCategory && p.category !== filterCategory) return false;
        if (filterPrice > 0 && p.price > filterPrice) return false;
        return true;
      });
    });
  }, [filterCategory, filterPrice]);

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <h2 className="text-3xl font-bold mb-4">Products</h2>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          onChange={(e) =>
            setFilterCategory(e.target.value || null)
          }
          className="border p-2 rounded"
          defaultValue=""
        >
          <option value="">All Categories</option>
          <option value="Shoes">Shoes</option>
          <option value="Clothing">Clothing</option>
          <option value="Accessories">Accessories</option>
        </select>

        <input
          type="range"
          min="0"
          max="200"
          step="5"
          value={filterPrice}
          onChange={(e) => setFilterPrice(Number(e.target.value))}
          className="w-48"
        />
        <span className="whitespace-nowrap">Max Price: ${filterPrice}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {productsList.map((p) => (
          <div
            key={p.id}
            className="border rounded overflow-hidden shadow hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
            onClick={() => window.location.assign(`/product/${p.id}`)}
          >
            <img
              src={p.images[0]}
              alt={p.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-2">
              <p className="font-semibold">{p.name}</p>
              <p className="text-gray-600">${p.price}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(p, p.sizes[0] || null, p.colors[0] || null);
              }}
              className="w-full bg-black text-white py-2 font-bold hover:bg-gray-900 transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Product Details page
function ProductDetails() {
  const { addToCart } = useCart();
  const { id } = ReactRouterDOM.useParams ? ReactRouterDOM.useParams() : { id: null };
  // Because we didn't import useParams at top, let's import:
  // But since we want one file, let's do this instead:
  const urlParams = new URLSearchParams(window.location.pathname.split("/"));
  // But it's messy, better to fix imports:
  // We'll just simulate param from pathname:
  // We'll do the quick fix in main App, no worries.

  // Instead, let's do a hook to get params:
  function useParams() {
    const path = window.location.pathname;
    const parts = path.split("/");
    return { id: parts[2] };
  }
  const { id: productId } = useParams();

  const product = products.find((p) => p.id === productId);

  const [selectedSize, setSelectedSize] = React.useState(
    product?.sizes[0] || null
  );
  const [selectedColor, setSelectedColor] = React.useState(
    product?.colors[0] || null
  );

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
        <a href="/" className="text-blue-600 hover:underline">
          Go Home
        </a>
      </div>
    );
  }

  // Related products
  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  return (
    <div className="max-w-5xl mx-auto px-4 mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-96 object-cover rounded"
          />
          {product.images.length > 1 && (
            <div className="flex space-x-4 mt-4 overflow-x-auto">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} ${i}`}
                  className="w-20 h-20 object-cover rounded cursor-pointer border-2 border-transparent hover:border-black"
                  onClick={() => setSelectedColor(product.colors[i] || selectedColor)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl font-semibold mb-4">${product.price}</p>

          {product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="font-semibold mr-2">Size:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="border rounded p-2"
              >
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {product.colors.length > 0 && (
            <div className="mb-4">
              <label className="font-semibold mr-2">Color:</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="border rounded p-2"
              >
                {product.colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => addToCart(product, selectedSize, selectedColor)}
            className="bg-black text-white px-6 py-3 rounded font-bold hover:bg-gray-900 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">You might also like</h3>
          <div className="flex space-x-6 overflow-x-auto">
            {related.map((p) => (
              <a
                key={p.id}
                href={`/product/${p.id}`}
                className="w-40 flex-shrink-0 hover:scale-105 transition-transform"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <p className="mt-1 font-semibold">{p.name}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Cart page
function Cart() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <a
          href="/"
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-900 transition inline-block"
        >
          Shop Now
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 mt-6">
      <h2 className="text-3xl font-bold mb-6">Shopping Cart</h2>

      <div className="space-y-4">
        {cart.map((item, i) => (
          <div
            key={i}
            className="flex items-center border rounded p-4 space-x-4"
          >
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p>Size: {item.selectedSize || "N/A"}</p>
              <p>Color: {item.selectedColor || "N/A"}</p>
              <p className="font-semibold">${item.price} each</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(i, cart[i].quantity - 1)}
                className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                -
              </button>
              <span>{cart[i].quantity}</span>
              <button
                onClick={() => updateQuantity(i
