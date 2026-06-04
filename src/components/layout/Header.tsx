import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSearch } from "@/contexts/SearchContext";
import { ProductCard } from "@/components/ProductCard";
import Logo from "@/assets/Logo.png";

const navigation = [
  // { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  {
    name: "Categories",
    href: "/categories",
    children: [
      { name: "Herbal Teas", href: "/category/herbal-teas" },
      // { name: "Dried Fruits", href: "/category/dried-fruits" },
      { name: "Dried Vegetables & Powders", href: "/category/dried-vegetables-powders" },
      { name: "Mushrooms", href: "/category/mushrooms" },
      // { name: "Microgreens", href: "/category/microgreens" },
    ],
  },
  // { name: "Mushrooms & Microgreens", href: "/mushrooms-microgreens" },
  { name: "About Us", href: "/about" },
  { name: "Why BeejVeda", href: "/why-beejveda" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { query, results, search, clearSearch } = useSearch();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    clearSearch();
  }, [location]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    search(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
      setIsSearchOpen(false);
      clearSearch();
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        <p>🌿 Free Shipping on orders above ₹999 | Use code WELLNESS10 for 10% off</p>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-card/95 backdrop-blur-md shadow-md"
            : "bg-card"
        )}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">

              {/* <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center"> */}
              {/* <span className="text-primary-foreground font-display font-bold text-lg">B</span> */}
              {/* </div> */}

              <img
                src={Logo}
                alt="BeejVeda Naturals"
                className="h-20 w-auto object-contain"
              />

              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-xl text-primary leading-tight">
                  BeejVeda<span className="text-leaf">Naturals</span>
                </h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Pure Nutrition from Nature</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      location.pathname === item.href
                        ? "text-primary bg-secondary"
                        : "text-foreground/80 hover:text-primary hover:bg-secondary/50"
                    )}
                  >
                    {item.name}
                    {item.children && <ChevronDown className="w-4 h-4" />}
                  </Link>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 pt-2 animate-fade-in">
                      <div className="bg-card rounded-lg shadow-lg border border-border p-2 min-w-[200px]">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className="block px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:block relative">
                {isSearchOpen ? (
                  <div className="animate-fade-in">
                    <form onSubmit={handleSearchSubmit}>
                      <Input
                        type="search"
                        placeholder="Search products..."
                        className="w-64 pr-10 h-10"
                        value={searchInput}
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </form>

                    {/* Search Results Dropdown */}
                    {results.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-lg border border-border max-h-[400px] overflow-y-auto z-50">
                        {results.slice(0, 5).map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.slug}`}
                            className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors"
                            onClick={() => {
                              setIsSearchOpen(false);
                              clearSearch();
                            }}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                            </div>
                            <span className="font-semibold text-sm">₹{product.price}</span>
                          </Link>
                        ))}
                        {results.length > 5 && (
                          <Link
                            to={`/shop?search=${encodeURIComponent(searchInput)}`}
                            className="block p-3 text-center text-sm text-primary hover:bg-secondary font-medium"
                            onClick={() => {
                              setIsSearchOpen(false);
                              clearSearch();
                            }}
                          >
                            View all {results.length} results
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <Link to="/wishlist" className="relative hidden sm:flex">
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/account">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border animate-slide-in-right">
            <div className="container py-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative mb-4">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pr-10"
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </form>

              <nav className="space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        location.pathname === item.href
                          ? "text-primary bg-secondary"
                          : "hover:bg-secondary/50"
                      )}
                    >
                      {item.name}
                      {item.children && <ChevronDown className="w-4 h-4" />}
                    </Link>
                    {item.children && (
                      <div className="pl-4 space-y-1 mt-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Search Overlay for closing */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsSearchOpen(false);
            clearSearch();
          }}
        />
      )}
    </>
  );
}
