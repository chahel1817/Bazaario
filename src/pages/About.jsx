import React from 'react';
import { Target, Award, ShieldCheck, Users, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const brandValues = [
    {
      icon: <Target className="text-bazaario-primary w-6 h-6" />,
      title: "Our Mission",
      description: "To deliver the ultimate e-commerce experience by connecting customers with high-quality products, unmatched convenience, and premium service."
    },
    {
      icon: <Award className="text-bazaario-primary w-6 h-6" />,
      title: "Quality First",
      description: "Every item in our 1,000+ catalog is meticulously vetted to guarantee durability, excellence, and authentic design craftsmanship."
    },
    {
      icon: <ShieldCheck className="text-bazaario-primary w-6 h-6" />,
      title: "Secure & Trusted",
      description: "Your trust is our greatest asset. We utilize industry-standard encryption and security protocols to keep your data and transactions completely safe."
    },
    {
      icon: <Users className="text-bazaario-primary w-6 h-6" />,
      title: "Customer Centric",
      description: "Our support agents work 24/7 to solve your problems, handle easy returns, and ensure you are 100% satisfied with your purchases."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "The Genesis",
      description: "Bazaario was founded with a simple idea: to make premium shopping accessible from anywhere, starting with a small catalog of tech accessories."
    },
    {
      year: "2025",
      title: "Catalog Expansion",
      description: "Expanded our catalog to 1,000+ high-quality products across 6 major categories, welcoming over 100k active members to our platform."
    },
    {
      year: "2026",
      title: "Global Distribution",
      description: "Opened three new logistics hubs to support fast, free shipping on all orders over $50, minimizing delivery times to under 48 hours."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Hero Header Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-bazaario-dark to-[#1E1E26] border border-bazaario-border p-8 md:p-16 text-center space-y-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.1),transparent_50%)]"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bazaario-primary/10 border border-bazaario-primary/20 text-bazaario-primary text-xs font-semibold">
          <Sparkles size={12} /> Discover Bazaario
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Redefining the Future of <span className="text-bazaario-primary">Premium E-Commerce</span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
          We bring you a curated collection of a thousand top-tier products across Electronics, Fashion, Beauty, Home, Sports, and Gaming—all under one seamless platform.
        </p>
        <div className="pt-4">
          <Link
            to="/shop"
            className="inline-block bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold px-8 py-3 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-105"
          >
            Start Shopping
          </Link>
        </div>
      </div>

      {/* Brand Values Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">What Defines Us</h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">Our principles ensure we maintain the highest standards of luxury and consumer satisfaction.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brandValues.map((value, idx) => (
            <div
              key={idx}
              className="bg-bazaario-card border border-bazaario-border p-6 rounded-2xl hover:border-bazaario-primary/50 transition-all duration-300 flex flex-col gap-4 group"
            >
              <div className="p-3 bg-bazaario-primary/10 rounded-xl w-fit group-hover:scale-110 transition-transform">
                {value.icon}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-bazaario-primary transition-colors">{value.title}</h3>
              <p className="text-gray-450 text-xs leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Timeline */}
      <div className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Our Journey</h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">Tracing the key milestones that helped us shape Bazaario into what it is today.</p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical timeline spine */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-bazaario-border hidden md:block"></div>

          <div className="space-y-12">
            {milestones.map((m, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row items-center justify-between gap-8 ${
                idx % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}>
                {/* Text Block */}
                <div className="w-full md:w-[45%] bg-bazaario-card border border-bazaario-border p-6 rounded-2xl space-y-3 relative">
                  <span className="text-xs text-bazaario-primary font-bold tracking-widest uppercase">Milestone {idx + 1}</span>
                  <h3 className="text-xl font-extrabold text-white">{m.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{m.description}</p>
                </div>

                {/* Badge (Center node) */}
                <div className="z-10 bg-bazaario-dark border-2 border-bazaario-primary text-bazaario-primary font-extrabold w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                  {m.year}
                </div>

                {/* Empty spacer for alignment */}
                <div className="hidden md:block w-[45%]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-level Descriptive CTA */}
      <div className="bg-bazaario-card border border-bazaario-border rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center lg:text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Join Our Shopping Club</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Create an account today to get early access to our seasonal product releases, personalized dashboard metrics, wishlist tracking, and a 10% coupon on your first order.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/register"
            className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold px-8 py-3 rounded-full text-center transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)]"
          >
            Create Account
          </Link>
          <Link
            to="/shop"
            className="border border-bazaario-border hover:border-white text-white font-extrabold px-8 py-3 rounded-full text-center transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
