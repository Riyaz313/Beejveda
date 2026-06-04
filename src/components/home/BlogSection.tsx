import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import FreshMilkyMushrooms from "@/assets/products/FreshMilkyMushrooms.png";


const blogPosts = [
  // {
  //   id: "1",
  //   title: "7-Day Microgreens = 30 Days of Vegetables: The Science",
  //   excerpt: "Discover why microgreens are considered one of the most nutrient-dense foods on the planet and how they can transform your health.",
  //   image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=250&fit=crop",
  //   category: "Nutrition",
  //   date: "Dec 28, 2024",
  //   readTime: "5 min read",
  //   slug: "microgreens-nutrition-science",
  // },
  {
    id: "1",
    title: "Medicinal Mushrooms: Ancient Wisdom Meets Modern Science",
    excerpt: "From immunity to brain health, explore how medicinal mushrooms are revolutionizing wellness practices worldwide.",
    // image: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=250&fit=crop",
    image: FreshMilkyMushrooms,
    category: "Wellness",
    date: "Dec 25, 2024",
    readTime: "7 min read",
    slug: "medicinal-mushrooms-guide",
  },
  {
    id: "2",
    title: "The Ayurvedic Morning Ritual: Start Your Day Right",
    excerpt: "Learn how to incorporate traditional Ayurvedic practices with modern superfoods for optimal health and energy.",
    image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=250&fit=crop",
    category: "Ayurveda",
    date: "Dec 20, 2024",
    readTime: "6 min read",
    slug: "ayurvedic-morning-ritual",
  },
    {
    id: "3",
    title: "The Benefits of Herbal Teas: A Complete Guide",
    excerpt: "Explore the healing properties of different herbal teas and how to incorporate them into your daily routine.",
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=400&fit=crop",
    category: "Wellness",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    slug: "herbal-teas-guide",
  },
];

export function BlogSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-leaf font-medium text-sm uppercase tracking-wider">
              Wellness Insights
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
              From Our Blog
            </h2>
          </div>
          <Link to="/blog" className="hidden sm:block">
            <Button variant="outline" className="group">
              View All Articles
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm card-hover animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Category */}
                <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full mb-3">
                  {post.category}
                </span>

                {/* Title */}
                <h3 className="font-display font-semibold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link to="/blog">
            <Button variant="outline" className="group">
              View All Articles
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
