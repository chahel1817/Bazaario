export const getProductFallbackImage = (product) => {
  if (!product) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80";
  
  const name = (product.name || "").toLowerCase();
  
  // Electronics
  if (name.includes("headphones")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("watch")) {
    return "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("charger")) {
    return "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("laptop") || name.includes("macbook")) {
    return "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("monitor") || name.includes("screen")) {
    return "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("tablet") || name.includes("ipad")) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80";
  }
  
  // Fashion
  if (name.includes("shoes") || name.includes("sneakers")) {
    return "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("jacket")) {
    return "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("handbag")) {
    return "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("dress")) {
    return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("coat") || name.includes("trench")) {
    return "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("skirt")) {
    return "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("blazer") || name.includes("suit")) {
    return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("tee") || name.includes("shirt")) {
    return "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("sweater") || name.includes("knit")) {
    return "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=80";
  }

  // Beauty
  if (name.includes("brush")) {
    return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("serum") || name.includes("dropper")) {
    return "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("oil")) {
    return "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("moisturizer") || name.includes("cream")) {
    return "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("mask")) {
    return "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("balm") || name.includes("lip")) {
    return "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80";
  }

  // Home & Living
  if (name.includes("sofa") || name.includes("cushion")) {
    return "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("table")) {
    return "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("blanket") || name.includes("bed")) {
    return "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("organizer") || name.includes("desk")) {
    return "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("frame") || name.includes("wall")) {
    return "https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("chair")) {
    return "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("lamp")) {
    return "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("mirror")) {
    return "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("candle")) {
    return "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=80";
  }

  // Sports
  if (name.includes("dumbbells") || name.includes("dumbbell")) {
    return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("water") || name.includes("bottle")) {
    return "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("yoga") || name.includes("mat")) {
    return "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("rope")) {
    return "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("bands")) {
    return "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("bag")) {
    return "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80";
  }

  // Gaming
  if (name.includes("keycap") || name.includes("keyboard")) {
    return "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("controller") || name.includes("joystick")) {
    return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("dock") || name.includes("console")) {
    return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("headset")) {
    return "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("mouse")) {
    return "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("vr")) {
    return "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("pad")) {
    return "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80";
  }

  // Fallbacks by category name if available
  const cat = (product.category?.name || "").toLowerCase();
  if (cat.includes("electronics")) return "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&auto=format&fit=crop&q=80";
  if (cat.includes("fashion")) return "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80";
  if (cat.includes("beauty")) return "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80";
  if (cat.includes("home")) return "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80";
  if (cat.includes("sports")) return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80";
  if (cat.includes("gaming")) return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80";

  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80";
};
