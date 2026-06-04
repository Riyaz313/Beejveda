import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const blogPosts = [
  // {
  //   id: "1",
  //   title: "7-Day Microgreens = 30 Days of Vegetables: The Science",
  //   excerpt: "Discover why microgreens are considered one of the most nutrient-dense foods on the planet and how they can transform your health.",
  //   image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&h=400&fit=crop",
  //   category: "Nutrition",
  //   date: "Dec 28, 2024",
  //   readTime: "5 min read",
  //   slug: "microgreens-nutrition-science",
  // },
  {
    id: "1",
    title: "Medicinal Mushrooms: Ancient Wisdom Meets Modern Science",
    excerpt: "From immunity to brain health, explore how medicinal mushrooms are revolutionizing wellness practices worldwide.",
    image: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=600&h=400&fit=crop",
    category: "Wellness",
    date: "Dec 25, 2024",
    readTime: "7 min read",
    slug: "medicinal-mushrooms-guide",
  },
  {
    id: "2",
    title: "The Ayurvedic Morning Ritual: Start Your Day Right",
    excerpt: "Learn how to incorporate traditional Ayurvedic practices with modern superfoods for optimal health and energy.",
    image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=600&h=400&fit=crop",
    category: "Ayurveda",
    date: "Dec 20, 2024",
    readTime: "6 min read",
    slug: "ayurvedic-morning-ritual",
  },
  // {
  //   id: "4",
  //   title: "Growing Your Own Microgreens at Home",
  //   excerpt: "A beginner's guide to growing nutrient-packed microgreens in your kitchen with minimal equipment.",
  //   image: "https://images.unsplash.com/photo-1595868203439-a84d51c6740d?w=600&h=400&fit=crop",
  //   category: "DIY",
  //   date: "Dec 15, 2024",
  //   readTime: "8 min read",
  //   slug: "growing-microgreens-home",
  // },
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
  // {
  //   id: "6",
  //   title: "Superfoods for Immunity: What Science Says",
  //   excerpt: "Evidence-based insights into which superfoods actually boost your immune system and how to use them.",
  //   image: "https://images.unsplash.com/photo-1610415946601-7e66f74a47d1?w=600&h=400&fit=crop",
  //   category: "Nutrition",
  //   date: "Dec 5, 2024",
  //   readTime: "7 min read",
  //   slug: "superfoods-immunity",
  // },
];

export default function Blog() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Wellness Insights
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Expert articles on nutrition, Ayurveda, and organic living to help you on your wellness journey.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group bg-card rounded-2xl overflow-hidden shadow-sm card-hover animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full mb-3">
                    {post.category}
                  </span>
                  <h2 className="font-display font-semibold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
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
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
