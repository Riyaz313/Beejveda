import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  {
    name: "Categories",
    href: "/categories",
    children: [
      { name: "Herbal Teas", href: "/category/herbal-teas" },
      { name: "Dried Fruits", href: "/category/dried-fruits" },
      { name: "Dried Vegetables & Powders", href: "/category/dried-vegetables-powders" },
      { name: "Mushrooms", href: "/category/mushrooms" },
      { name: "Microgreens", href: "/category/microgreens" },
    ],
  },
  { name: "Mushrooms & Microgreens", href: "/mushrooms-microgreens" },
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
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
              <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">B</span>
              </div>
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
              <div className={cn(
                "hidden md:flex items-center transition-all duration-300",
                isSearchOpen ? "w-64" : "w-10"
              )}>
                {isSearchOpen ? (
                  <div className="relative w-full animate-fade-in">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pr-10 h-10"
                      autoFocus
                      onBlur={() => setIsSearchOpen(false)}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="w-5 h-5" />
              </Button>

              <Link to="/account">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    0
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
              <div className="relative mb-4">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>

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
    </>
  );
}
