/* ==========================================================================
   GALAXY DECOR - PRODUCTS, CATEGORIES, & REVIEWS DATABASE
   ========================================================================== */

window.GALAXY_DECOR_DB = {
  // 1. Store Details
  store: {
    name: "GALAXY DECOR",
    phone: "8608738393",
    email: "galaxydecorind@gmail.com",
    address: "4/642, Post Office Building, Sakthi Nagar, Opposite Viswanathan Hospital, Vijayamangalam, Perundurai, Erode - 638056.",
    tagline: "Transform Your Space with Premium Imported Furniture",
    about: "GALAXY DECOR specializes in premium imported furniture and complete interior solutions for residential and commercial spaces. We import high-quality furniture from China, Indonesia, and other leading Asian countries, offering elegant, durable, and modern collections for homes, offices, restaurants, hotels, cafés, showrooms, and commercial interiors."
  },

  // 2. Featured Categories
  categories: [
    {
      id: "living-room",
      name: "Living Room Furniture",
      desc: "Sofas, luxury loungers, and recliners designed for elegance and ultimate relaxation.",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "bedroom",
      name: "Bedroom Collection",
      desc: "Premium beds, luxury dressers, and wardrobes imported from leading Asian creators.",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "office",
      name: "Office Furniture",
      desc: "Executive desks, ergonomic chairs, and modern commercial workstation arrangements.",
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "dining",
      name: "Dining & Restaurant Furniture",
      desc: "Stunning marble and solid-wood dining sets tailored for homes and cafes.",
      image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "center-tables",
      name: "Center Tables",
      desc: "Luxury focal points featuring glass, marble, and brushed metal structures.",
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "tea-poys",
      name: "Tea Poys",
      desc: "Minimalist side tables and functional companion stands.",
      image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "gift-items",
      name: "Gift Items",
      desc: "Exquisite collectibles, metallic desk details, and premium gifts.",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "showpieces",
      name: "Showpieces",
      desc: "Handcrafted designer statuettes and abstract modern room highlights.",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "fountains",
      name: "Decorative Fountains",
      desc: "Relaxing indoor and outdoor water features with integrated ambient LED glow.",
      image: "https://images.unsplash.com/photo-1588694926280-3ae414d06ccb?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "vases",
      name: "Flower Vases",
      desc: "Fine ceramic, luxury crystal, and metal-inlay statement vases.",
      image: "https://images.unsplash.com/photo-1581781870027-04212e231e96?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "decor-accessories",
      name: "Home Décor Accessories",
      desc: "Bespoke cushions, rugs, and details to tie your room's style together.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "home-furniture",
      name: "Home Furniture",
      desc: "A curation of daily utility, storage, and accent furniture for residential setups.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "commercial-furniture",
      name: "Commercial Furniture",
      desc: "Heavy-duty lounge seating, cafe chairs, and modular lobby solutions.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
    }
  ],

  // 3. Complete Interior Solutions Packages
  interiorSolutions: [
    {
      id: "bedroom-setup",
      title: "Complete Bedroom Setup",
      subtitle: "Residential Luxury",
      desc: "Get an end-to-end master bedroom configuration including imported king size bed frame, orthopaedic mattress, bedside tables, custom wardrobe panelling, light controls, and window drapes.",
      price: "₹1,49,999",
      image: "/assets/solution_bedroom.jpg",
      features: ["Imported King Bed", "2 Bedside Tables", "Modular 4-Door Wardrobe", "Accent Bed Wall Panelling"]
    },
    {
      id: "office-setup",
      title: "Complete Office Setup",
      subtitle: "Commercial & Corporate",
      desc: "Professional layout including an executive table with integrated cord routing, ergonomic high-back posture chairs, storage file consoles, and dynamic lighting solutions.",
      price: "₹2,19,999",
      image: "/assets/solution_office.jpg",
      features: ["Executive Desk", "Premium Ergonomic Chair", "File Cabinet System", "Meeting Table with 4 Chairs"]
    },
    {
      id: "restaurant-setup",
      title: "Complete Restaurant Setup",
      subtitle: "Commercial Cafe & Hospitality",
      desc: "Cohesive aesthetic layouts for cafes and dining outlets. Includes heavy-duty marble tables, custom designer seating options, counter spaces, and weather-proof outdoor tables.",
      price: "₹4,89,999",
      image: "/assets/solution_restaurant.jpg",
      features: ["10 Dining Tables", "40 Café Chairs", "1 Reception counter", "Custom Wall Shelves"]
    },
    {
      id: "custom-projects",
      title: "Customized Interior Projects",
      subtitle: "Bespoke Design Consultancy",
      desc: "Full-scale custom site execution. From site measurements and architectural CAD space layouts to custom material selection and site installation overseen by lead designers.",
      price: "On Estimation",
      image: "placeholder_solution_custom",
      features: ["Architectural 3D Visuals", "Material Curation", "On-site Turnkey Supervision", "1-Year Warranty"]
    },
    {
      id: "imported-furniture-solutions",
      title: "Imported Furniture Solutions",
      subtitle: "Direct Sourcing Service",
      desc: "Direct procurement assistance from premium manufacturers in China and Indonesia. We handle inspection, global shipping, port clearance, and local transportation to your doorstep.",
      price: "Custom Sourcing Quote",
      image: "placeholder_solution_imported",
      features: ["Factory-Direct Procurement", "Quality Control Check", "Hassle-Free Import Clearance", "Safe Showroom Transport"]
    }
  ],

  // 4. Client Testimonials
  reviews: [
    {
      id: "rev1",
      author: "Adithya Vardhan",
      title: "Homeowner, Erode",
      rating: 5,
      text: "We bought our entire living room sofa set and marble dining table from Galaxy Decor. The import quality is top-notch, and the gold metal detailing matches our luxury theme perfectly. Highly recommended!"
    },
    {
      id: "rev2",
      author: "Deepika Rangaraj",
      title: "Founder, Zenith Café",
      rating: 5,
      text: "Galaxy Decor handled our cafe interiors. The imported dining chairs and outdoor café tables look clean, minimal, and are extremely durable. Their price was very competitive compared to Chennai showroom quotes."
    },
    {
      id: "rev3",
      author: "Dr. Karthik Sundaram",
      title: "Sundaram Clinic, Perundurai",
      rating: 5,
      text: "The executive office desk and waiting lounge chairs from Galaxy Decor are exceptional. It instantly gave our hospital lobby a premium and comfortable look. Great customer support during installation."
    },
    {
      id: "rev4",
      author: "Meera Krishnakumar",
      title: "Interior Designer",
      rating: 5,
      text: "As a professional interior designer, I trust Galaxy Decor for premium imported items. Their catalog of decorative fountains and flower vases contains pieces that are unique and not found elsewhere in the local market."
    },
    {
      id: "rev5",
      author: "Rajesh Sekhar",
      title: "Residential Customer",
      rating: 4,
      text: "Smooth delivery of our king-size bed set. Sourced directly from Asia. The finish is excellent and assembly was done on-site in a day. Will purchase showpieces next."
    }
  ],

  // 5. Default Luxury Product Catalog
  // This will be used as a fallback if the sync utility is not run yet.
  products: [
    {
      id: "f1",
      name: "Ganesha Lotus Tabletop Water Fountain",
      category: "fountains",
      shortDesc: "Exquisite tabletop Ganesha water fountain with multi-stage flowing lotus bowls.",
      desc: "Add soothing soundscapes and elegant detail to your room with this tabletop Ganesha fountain. Designed with a premium polyresin bronze-inlay finish, integrated quiet water pump, and USB powered LED light. Includes decorative river pebbles.",
      price: 12500,
      offerPrice: 9999,
      image: "fountain_ganesha_1.jpg",
      gallery: ["fountain_ganesha_1.jpg", "fountain_ganesha_1_details.jpg", "fountain_power_details.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "39.5cm Height x 27cm Length x 21cm Depth",
        "Material": "Premium Polyresin, Bronze Finish",
        "Power": "USB Powered LED light, Separate Water Pump",
        "Pebbles": "Includes decorative river pebbles"
      }
    },
    {
      id: "f2",
      name: "Ganesha 5-Step Cascade Tabletop Fountain",
      category: "fountains",
      shortDesc: "Elegant 5-stage cascading water fountain featuring Ganesha statue holding a holy bowl.",
      desc: "A stunning spiritual centerpiece. Features 5 stages of water flow, a spinning crystal glass sphere floating on the water jet, and multi-color shifting integrated LED lights. Complete with quiet water pump system.",
      price: 15000,
      offerPrice: 12499,
      image: "fountain_ganesha_2.jpg",
      gallery: ["fountain_ganesha_2.jpg", "fountain_ganesha_2_features.jpg", "fountain_ganesha_2_lifestyle.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "53cm Height x 34cm Width x 27cm Depth",
        "Material": "Heavy-duty Premium Polyresin",
        "Power": "Integrated Submersible Water Pump",
        "Features": "Spinning LED Crystal Glass Sphere"
      }
    },
    {
      id: "f3",
      name: "Saint Patrick Tabletop LED Fountain",
      category: "fountains",
      shortDesc: "Peaceful religious tabletop water fountain showcasing Saint Patrick.",
      desc: "Create a serene, luxurious atmosphere in your lobby or room. Features Saint Patrick statue inside a large circular halo LED glow ring and a gentle rock-cascade water flow.",
      price: 9500,
      offerPrice: 7999,
      image: "fountain_jesus.jpg",
      gallery: ["fountain_jesus.jpg", "fountain_jesus_details.jpg", "fountain_jesus_features.jpg", "fountain_power_details.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "30cm Height",
        "Material": "Resin & Brushed Stone Polish",
        "Power": "USB Halo LED Ring, Quiet Water Pump"
      }
    },
    {
      id: "f4",
      name: "Virgin Mary Embossed Tabletop Fountain",
      category: "fountains",
      shortDesc: "Stunning embossed golden and grey themed tabletop water fountain featuring the Virgin Mary.",
      desc: "A bespoke holy showpiece fountain. Highlighted with a large circular halo LED light, premium gold-embossed finish, and a quiet water pump system.",
      price: 11000,
      offerPrice: 8999,
      image: "fountain_mary.jpg",
      gallery: ["fountain_mary.jpg", "fountain_mary_details.jpg", "fountain_mary_features.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "35cm Height",
        "Material": "Gold-Embossed Resin & Black Slate",
        "Power": "Circular Halo LED Light, Submersible Pump"
      }
    },
    {
      id: "f5",
      name: "Ganesha Tabletop Fountain - Lifestyle Edition",
      category: "fountains",
      shortDesc: "Deluxe indoor Ganesha water feature shown in a premium checkered lounge room setup.",
      desc: "Add weight, character, and soothing soundscapes to luxury living rooms, lobbies, and commercial reception areas. This lifestyle edition features the bronze Ganesha in a premium environment-ready design.",
      price: 13500,
      offerPrice: 10999,
      image: "fountain_ganesha_lifestyle.jpg",
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "39.5cm Height x 27cm Length x 21cm Depth",
        "Material": "Solid Resin, Bronze Plated Ganesha",
        "Power": "Separate Water Pump, USB LED light"
      }
    },
    {
      id: "f6",
      name: "Lotus Leaf Tabletop LED Halo Fountain",
      category: "fountains",
      shortDesc: "Modern metallic golden lotus leaves tabletop water fountain.",
      desc: "An ultra-modern art-deco tabletop fountain. Features delicate gold-finished metal lotus leaves and stems inside an elegant circular LED halo glow ring, resting on a textured blue speckled pot base.",
      price: 8500,
      offerPrice: 6999,
      image: "fountain_lotus_led.jpg",
      gallery: ["fountain_lotus_led.jpg", "fountain_lotus_led_details.jpg", "fountain_lotus_led_lifestyle.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "37cm Height x 25cm Width x 17cm Depth",
        "Material": "Metallic Gold-Finished Stems, Ceramic Base",
        "Power": "USB LED Ring Light, Silent Submersible Pump"
      }
    },
    {
      id: "w1",
      name: "Abstract Blue & Gold Metallic Disk Wall Art",
      category: "showpieces",
      shortDesc: "Luxurious handcrafted metal wall art featuring abstract circular disks in gold and teal blue.",
      desc: "An absolute statement piece. Features handcrafted metallic disks in embossed gold and textured teal blue finishes, arranged in a beautiful overlapping layout. Perfect size to hang over a living room sofa.",
      price: 18500,
      offerPrice: 14999,
      image: "wall_art_disk.jpg",
      gallery: ["wall_art_disk.jpg", "wall_art_disk_details.jpg", "wall_art_disk_features.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "170cm Length x 90cm Height",
        "Material": "Carbon Steel & Anti-Rust Coating",
        "Finish": "Hand-painted Gold & Teal Glaze"
      }
    },
    {
      id: "w2",
      name: "Golden Metallic Tree of Life Wall Art",
      category: "showpieces",
      shortDesc: "Stunning embossed golden themed metal art representing the Tree of Life.",
      desc: "Give a luxurious look to your walls with this gorgeous Tree of Life metal wall sculpture. Sourced from high-grade creators, it features handcrafted golden branches and detailed leaves.",
      price: 14000,
      offerPrice: 11499,
      image: "wall_art_tree_clean.jpg",
      gallery: ["wall_art_tree_clean.jpg", "wall_art_tree.jpg", "wall_art_tree_lifestyle.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "130cm Length x 80cm Height",
        "Material": "High-grade Galvanized Iron",
        "Finish": "Electroplated Textured Gold"
      }
    },
    {
      id: "w3",
      name: "Luxury Golden Flora Metal Wall Art - Set of 2",
      category: "showpieces",
      shortDesc: "Elegant pair of twin golden floral branches for symmetrical wall designs.",
      desc: "Create a cohesive, high-end look in your lobby or room. This set includes two matching golden floral branch wall hangings with detailed leaves and blossoming metal flowers.",
      price: 16500,
      offerPrice: 13499,
      image: "wall_art_flora.jpg",
      gallery: ["wall_art_flora.jpg", "wall_art_flora_features.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "110cm Total Length x 95cm Height (Set of 2)",
        "Material": "Premium Forged Iron, Gold Finished",
        "Quantity": "Set of 2 Branches"
      }
    },
    {
      id: "w4",
      name: "Teal & Gold Metallic Circle Mirror Wall Art",
      category: "showpieces",
      shortDesc: "Handcrafted metal wall sculpture featuring colored disks and integrated mirrors.",
      desc: "An art-deco masterpiece. Features overlapping embossed gold, teal, and brown metal disks with two double-polished circular mirrors. Adds elegant reflection to hallways, lobbies, and lounges.",
      price: 17500,
      offerPrice: 13999,
      image: "wall_art_mirror.jpg",
      gallery: ["wall_art_mirror.jpg", "wall_art_mirror_details.jpg", "wall_art_mirror_lifestyle.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "135cm Length x 70cm Height",
        "Material": "Forged Iron, Double-Polished Mirrors",
        "Features": "Teal, Gold, & Bronze color disks"
      }
    },
    {
      id: "w5",
      name: "Golden Floral Blooms & Infinity Ring Wall Art",
      category: "showpieces",
      shortDesc: "Stunning horizontal metal wall art featuring golden flowers layered over overlapping rings.",
      desc: "A gorgeous luxury wall centerpiece. Showcases layered metallic golden blossoms, leaves, and stems overlapping twin infinity metal loops. Perfect for modern dining rooms or executive cabins.",
      price: 15500,
      offerPrice: 12999,
      image: "wall_art_blooms_clean.jpg",
      gallery: ["wall_art_blooms_clean.jpg", "wall_art_blooms.jpg", "wall_art_blooms_features.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "140cm Length x 75cm Height",
        "Material": "High-grade Forged Steel, Gold Lacquer"
      }
    },
    {
      id: "w6",
      name: "Royal Peacock Metal Wall Clock - 72cm Edition",
      category: "showpieces",
      shortDesc: "Luxurious royal-themed metallic wall clock with colorful peacock head and golden feather dial.",
      desc: "An absolute masterwork of wall decoration. Features a beautifully detailed polyresin peacock head beneath a gorgeous golden sweep-second dial, surrounded by electroplated wire metal peacock feathers with blue gem highlights. Features a silent sweep quartz movement.",
      price: 12500,
      offerPrice: 9499,
      image: "peacock_clock_clean.jpg",
      gallery: ["peacock_clock_clean.jpg", "peacock_clock_72_features.jpg", "peacock_clock_lifestyle.jpg", "peacock_clock_72_lifestyle_table.jpg", "peacock_clock_72_lifestyle_hallway.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "72cm Height x 72cm Width",
        "Material": "Metallic Wire Clock Frame, Polyresin Peacock",
        "Movement": "High-grade Quartz Silent Sweep"
      }
    },
    {
      id: "w7",
      name: "Classic Peacock Metal Wall Clock - 50cm Edition",
      category: "showpieces",
      shortDesc: "Sleek and compact peacock wall clock, perfect for smaller rooms or bedrooms.",
      desc: "Sleek and compact edition of our royal peacock wall clock, perfect for smaller rooms or bedrooms. Features high-quality metal wire feathers and a silent sweep quartz movement.",
      price: 9000,
      offerPrice: 6999,
      image: "peacock_clock_50_clean.jpg",
      gallery: ["peacock_clock_50_clean.jpg", "peacock_clock_50_features.jpg", "peacock_clock_50_lifestyle.jpg", "peacock_clock_50_lifestyle_table.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "50cm Height x 50cm Width",
        "Material": "Metal Clock Frame, Polyresin Peacock Head",
        "Movement": "High-grade Quartz Silent Sweep"
      }
    },
    {
      id: "w8",
      name: "Twin Peacock Lovers Metal Wall Clock - 72cm",
      category: "showpieces",
      shortDesc: "Bespoke double-peacock wall clock representing love and unity.",
      desc: "Bespoke double-peacock wall clock representing love and unity. Features two detailed polyresin peacocks shaping a heart motif at the base, surrounded by a radiant halo of golden wire feathers with blue gems.",
      price: 15500,
      offerPrice: 11999,
      image: "peacock_clock_twin_clean.jpg",
      gallery: ["peacock_clock_twin_clean.jpg", "peacock_clock_twin_features.jpg", "peacock_clock_twin_lifestyle.jpg"],
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "72cm Height x 72cm Width",
        "Material": "Double Peacock Polyresin Base, Metallic Frame",
        "Movement": "High-grade Quartz Silent Sweep"
      }
    },
    {
      id: "p1",
      name: "Bespoke Gold-Inlay Velvet Sofa",
      category: "living-room",
      shortDesc: "Luxury three-seater velvet sofa with detailed hand-brushed gold metal frame details.",
      desc: "Add instant sophistication to your home showroom with our flagship sofa. Featuring high-density foam filling, gold titanium steel legs, and premium stain-resistant velvet fabric sourced from premium designers in China.",
      price: 95000,
      offerPrice: 84999,
      image: "default_sofa_1.jpg",
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "220cm x 90cm x 85cm",
        "Material": "Titanium Steel, Premium Velvet",
        "Foam": "HD Recast Comfort Foam",
        "Country of Origin": "China"
      }
    },
    {
      id: "p2",
      name: "Carrara Marble Dining Table",
      category: "dining",
      shortDesc: "Elegant polished Italian marble dining table with modern black steel geometric stand.",
      desc: "A centerpiece for any modern dining area. Features a heavy, heat-proof polished natural Carrara marble slab top supported by structural architectural steel legs with gold highlights.",
      price: 110000,
      offerPrice: 89999,
      image: "default_dining_table.jpg",
      isNew: false,
      inStock: true,
      specs: {
        "Dimensions": "180cm x 90cm x 75cm",
        "Material": "Natural Italian Marble, Carbon Steel",
        "Capacity": "6-8 Seater",
        "Country of Origin": "Indonesia"
      }
    },
    {
      id: "p3",
      name: "Monarch Executive Walnut Desk",
      category: "office",
      shortDesc: "Premium walnut veneer office desk with integrated electrical wire routing drawers.",
      desc: "Designed for premium leadership offices. Premium Walnut veneer coating, leatherette desk mat insertion, silent closing drawer sliders, and hidden power conduits.",
      price: 75000,
      offerPrice: 62500,
      image: "default_office_desk.jpg",
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "160cm x 80cm x 76cm",
        "Material": "Walnut Veneer, Medium-Density Board",
        "Drawers": "3 Soft-close units",
        "Country of Origin": "China"
      }
    },
    {
      id: "p4",
      name: "Crystalline Cascade LED Water Fountain",
      category: "fountains",
      shortDesc: "Stunning tiered indoor water fountain with warm yellow ambient LED strips.",
      desc: "Bring peace and serene nature indoors. Cascading water plates made of composite polymer rock texture, complete with a silent recycling water pump and integrated warm glow illumination.",
      price: 25000,
      offerPrice: 19999,
      image: "default_fountain_1.jpg",
      isNew: true,
      inStock: true,
      specs: {
        "Height": "110cm",
        "Material": "Polyester Resin & Fiberglass",
        "Pump": "S1-Submersible Eco Pump",
        "Power Usage": "12W LED, 8W Pump"
      }
    },
    {
      id: "p5",
      name: "Imperial Tufted Wingback Bed Frame",
      category: "bedroom",
      shortDesc: "Opulent king size tufted headboard bed frame upholstered in premium linen.",
      desc: "Transform your bedroom into a high-end luxury resort room. Tall hand-tufted headboard wing structure, sturdy structural solid wood pine core frame, and gold corner support tips.",
      price: 85000,
      offerPrice: 72999,
      image: "default_bed_1.jpg",
      isNew: false,
      inStock: true,
      specs: {
        "Dimensions": "King Size (72\" x 78\" mattress fit)",
        "Material": "Russian Pine wood, Premium Linen",
        "Headboard Height": "140cm",
        "Country of Origin": "China"
      }
    },
    {
      id: "p6",
      name: "Duchess Gold-Lined Center Table Set",
      category: "center-tables",
      shortDesc: "Circular nesting coffee tables with marble tops and gold plating steel bands.",
      desc: "Nesting table duo that offers flexibility and luxury spacing. Includes a larger high table and a lower offset drawer unit with golden ring base plates.",
      price: 34000,
      offerPrice: 28500,
      image: "default_center_table.jpg",
      isNew: true,
      inStock: true,
      specs: {
        "Large Table": "80cm Diameter, 45cm Height",
        "Small Table": "60cm Diameter, 38cm Height",
        "Material": "Tempered Sintered Stone, Stainless Steel"
      }
    },
    {
      id: "p7",
      name: "Aura Brushed Brass Tea Poy",
      category: "tea-poys",
      shortDesc: "Geometric golden steel side table with smoked black tempered glass top.",
      desc: "The perfect companion next to lounge recliners. An elegant statement side stand with modern wireframe styling, completed with matching gold joints.",
      price: 18000,
      offerPrice: 14499,
      image: "default_teapoy.jpg",
      isNew: false,
      inStock: true,
      specs: {
        "Dimensions": "45cm x 45cm x 55cm",
        "Material": "Tempered Smoked Glass, 201 Stainless Steel"
      }
    },
    {
      id: "p8",
      name: "Golden Ginkgo Leaf Metal Sculpture",
      category: "showpieces",
      shortDesc: "Artistic metallic ginkgo leaf sculpture mounted on a black marble stand.",
      desc: "Bespoke metallic artwork representing success and longevity. Plated in highly polished gold luster, supported by a heavy rectangular black solid marble block.",
      price: 8500,
      offerPrice: 6200,
      image: "default_showpiece_1.jpg",
      isNew: false,
      inStock: true,
      specs: {
        "Dimensions": "30cm x 12cm x 45cm",
        "Material": "Electroplated Iron Alloy, Solid Marble"
      }
    },
    {
      id: "p9",
      name: "Gilded Ceramic Ribbed Vase",
      category: "vases",
      shortDesc: "Beautiful vertical ribbed white ceramic flower vase with gold accent rim.",
      desc: "Perfect for long-stemmed floral decor arrangements or display in commercial showroom shelves. Elegant handmade clay structure with a distinct electro-gold collar.",
      price: 6000,
      offerPrice: 4499,
      image: "default_vase_1.jpg",
      isNew: true,
      inStock: true,
      specs: {
        "Height": "40cm",
        "Material": "Ribbed Ceramic, Gold rim electroplating"
      }
    },
    {
      id: "p10",
      name: "Nordic Minimalist Lounge Armchair",
      category: "living-room",
      shortDesc: "Sleek low-profile lounge armchair with comfortable textured boucle fabric.",
      desc: "High end designer single chair. Curved cocoon-like comfort structure upholstered in luxurious white boucle textile. Elegant profile for premium lobbies or living room corners.",
      price: 42000,
      offerPrice: 35000,
      image: "default_chair_1.jpg",
      isNew: true,
      inStock: true,
      specs: {
        "Dimensions": "85cm x 80cm x 75cm",
        "Material": "Boucle Fabric, Solid Oak Interior Frame",
        "Country of Origin": "Indonesia"
      }
    }
  ]
};
