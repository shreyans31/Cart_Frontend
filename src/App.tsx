import { useMemo, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";

// ----------------------------------------------
// API Integration
// ----------------------------------------------
const API_BASE_URL = 'http://localhost:3001/api';

// Fetch products from backend
const fetchProducts = async () => {
  try {
    console.log('Fetching from:', `${API_BASE_URL}/products`);
    const response = await fetch(`${API_BASE_URL}/products`);
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Calculate price for selected components
const calculatePrice = async (productId, selectedComponents) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedComponents })
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error calculating price:', error);
    return null;
  }
};

// Get EMI options for a product
const getEMIOptions = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/emi-options`);
    const data = await response.json();
    return data.success ? data.data.emiOptions : null;
  } catch (error) {
    console.error('Error fetching EMI options:', error);
    return null;
  }
};

// Calculate EMI
const calculateEMI = async (productId, totalAmount, tenure) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/emi-calculation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalAmount, tenure })
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error calculating EMI:', error);
    return null;
  }
};

// ----------------------------------------------
// Shared theme + utilities
// ----------------------------------------------
const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function StyleTag() {
  return (
    <style>{`
:root { --tg-bg:#f6f7fb; --tg-card:#fff; --tg-text:#0f1222; --tg-dim:#6b7280; --tg-border:#e6e3ef; --tg-shadow:0 6px 24px rgba(33,21,81,.08); --tg-purple-50:#f4f1ff; --tg-purple-100:#ebe5ff; --tg-purple-200:#d7ccff; --tg-purple-300:#b8a1ff; --tg-purple-400:#9a7aff; --tg-purple-500:#7c53ff; --tg-purple-600:#6b46ff; --tg-purple-700:#5b3ae6; --tg-purple-800:#4b2fcc; --tg-purple-900:#3925a6; }
*{box-sizing:border-box} 
html,body,#root{height:100%;margin:0;padding:0;width:100%} 
body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; background:var(--tg-bg);color:var(--tg-text)}
.tg-root{min-height:100vh;width:100%;display:flex;flex-direction:column}
/* FULL-WIDTH CONTAINER */
.tg-container{width:100%;max-width:1400px;margin:0 auto;padding:0 16px}
@media(min-width:768px){.tg-container{padding:0 24px}}
@media(min-width:1200px){.tg-container{padding:0 32px}}
.tg-header{position:sticky;top:0;z-index:20;backdrop-filter:blur(8px);background:rgba(255,255,255,.8);border-bottom:1px solid var(--tg-border)}
.tg-header-row{display:flex;align-items:center;justify-content:space-between;height:64px}
.tg-brand{display:flex;align-items:center;gap:10px}
.tg-logo{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:var(--tg-purple-700);color:#fff;font-weight:800;box-shadow:0 4px 14px rgba(91,58,230,.35)}
.tg-brand-title{font-size:15px;font-weight:700}
.tg-brand-sub{font-size:12px;color:var(--tg-dim)}
.tg-nav{display:none;gap:24px}
.tg-nav a, .tg-nav a:visited{color:#374151;text-decoration:none;font-size:14px}
.tg-nav a:hover{color:var(--tg-purple-700)}
@media(min-width:768px){.tg-nav{display:flex}}
.tg-main{flex:1;padding:32px 0 24px;width:100%}
.tg-grid{display:grid;grid-template-columns:1fr;gap:24px;width:100%}
@media(min-width:1200px){.tg-grid{grid-template-columns:2fr 1fr}}
.tg-card{background:var(--tg-card);border:1px solid var(--tg-border);border-radius:18px;box-shadow:var(--tg-shadow);padding:20px}
.tg-h1{font-size:28px;font-weight:800;margin:0 0 4px;letter-spacing:-.01em}
.tg-h2{font-size:20px;font-weight:700;margin:0 0 12px}
.tg-h3{font-size:18px;font-weight:700;margin:0}
.tg-h4{font-size:14px;font-weight:700;margin:0 0 8px;color:#111827}
.tg-subtitle{color:var(--tg-dim);margin:0 0 14px}
.tg-body{line-height:1.7;color:#374151;margin:0}
.tg-strong{font-weight:700}
.tg-dim{color:var(--tg-dim)}
.tg-chiprow{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 10px}
.tg-chip{font-size:12px;padding:6px 10px;border-radius:999px;background:var(--tg-purple-50);color:var(--tg-purple-900);border:1px solid var(--tg-purple-200)}
.tg-meta{font-size:13px;color:#5b6170;margin:6px 0}
.tg-right{position:relative}
.tg-sticky{position:sticky;top:90px;display:flex;flex-direction:column;gap:16px}
.tg-field{margin-top:14px}
.tg-label{font-size:12px;font-weight:700;color:#3b3f50;text-transform:uppercase;letter-spacing:.06em}
.tg-help{font-size:11px;color:var(--tg-dim);margin-top:6px}
.tg-help.center{text-align:center}
.tg-stepper{margin-top:8px;display:flex;align-items:center;gap:10px}
.tg-stepper-sm{gap:6px}
.tg-stepper-value{min-width:36px;text-align:center;font-weight:800;font-size:18px}
.tg-btn{appearance:none;border:1px solid var(--tg-border);background:#fff;color:#1f2937;border-radius:12px;padding:8px 12px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(17,17,26,.04);transition:transform .06s ease,box-shadow .2s ease,background .2s ease,color .2s ease}
.tg-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(17,17,26,.08)}
.tg-btn:active{transform:translateY(0)}
.tg-btn-ghost{background:#fff}
.tg-btn-primary{background:linear-gradient(180deg,var(--tg-purple-600),var(--tg-purple-700));color:#fff;border:none}
.tg-btn-primary:hover{filter:brightness(1.03)}
.tg-btn-primary:active{filter:brightness(.98)}
.tg-btn-block{width:100%;padding:12px 16px;font-size:14px}
.tg-btn-disabled,.tg-btn:disabled{opacity:.6;cursor:not-allowed;box-shadow:none;transform:none}
.tg-toggle{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;border:1px solid var(--tg-border);border-radius:14px;padding:12px;transition:border .2s ease,background .2s ease}
.tg-toggle:hover{background:#faf9ff;border-color:var(--tg-purple-200)}
.tg-toggle-text{display:flex;flex-direction:column;gap:2px}
.tg-toggle-title{font-size:14px;font-weight:600;color:#1f2533}
.tg-toggle-sub{font-size:12px;color:var(--tg-dim)}
.tg-toggle-input{display:none}
.tg-toggle-switch{position:relative;width:46px;height:26px;border-radius:999px;background:#e5e7eb;border:1px solid #d1d5db;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(0,0,0,.03)}
.tg-toggle-input + .tg-toggle-switch::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.12);transition:left .18s ease,background .2s ease}
.tg-toggle-input:checked + .tg-toggle-switch{background:var(--tg-purple-600);border-color:var(--tg-purple-700)}
.tg-toggle-input:checked + .tg-toggle-switch::after{left:24px}
.tg-box{margin-top:8px;border:1px dashed var(--tg-purple-300);background:#fbfaff;border-radius:12px;padding:10px 12px}
.tg-box-row{display:flex;align-items:center;justify-content:space-between;font-size:14px}
.tg-alert{margin-top:12px;border:1px solid #f5d48c;background:#fff9eb;color:#7c3f00;border-radius:12px;padding:10px 12px}
.tg-alert-title{font-weight:800;margin:0 0 4px;font-size:13px}
.tg-list{margin:6px 0 0 18px;padding:0}
.tg-summary{margin-top:14px;background:#f8f7ff;border:1px solid var(--tg-purple-200);border-radius:14px;padding:12px}
.tg-summary-list{list-style:none;margin:8px 0;padding:0;display:flex;flex-direction:column;gap:6px}
.tg-line{display:flex;align-items:center;justify-content:space-between;font-size:14px}
.tg-total{display:flex;align-items:center;justify-content:space-between;border-top:1px dashed #d9d6ef;padding-top:10px;margin-top:8px;font-weight:800;font-size:16px}
.tg-total-value{font-size:20px;color:var(--tg-purple-900)}
.tg-gallery{padding:0;overflow:hidden}
.tg-media{aspect-ratio:16 / 9;width:100%}
.tg-media img{width:100%;height:100%;object-fit:cover;display:block}
.tg-thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px}
.tg-thumb{border:1px solid var(--tg-border);border-radius:12px;overflow:hidden;padding:0;cursor:pointer;background:#fff;transition:border .2s ease,box-shadow .2s ease}
.tg-thumb img{width:100%;height:96px;object-fit:cover;display:block}
.tg-thumb.active{outline:2px solid var(--tg-purple-600);border-color:var(--tg-purple-300);box-shadow:0 0 0 4px rgba(123,83,255,.08)}
.tg-footer{margin-top:28px;border-top:1px solid var(--tg-border);background:rgba(255,255,255,.8)}
.tg-center{text-align:center;padding:16px 0;color:var(--tg-dim);font-size:12px}
/* spacing utilities */
.tg-stack-sm{display:flex;flex-direction:column;gap:12px}
.tg-left{display:flex;flex-direction:column;gap:24px}
/* give space from summary to button */
.tg-summary + .tg-btn{margin-top:16px}
/* add space below banner card on home */
.tg-home-banner{margin-bottom:32px;background:linear-gradient(135deg,var(--tg-purple-600),var(--tg-purple-800));color:white;text-align:center;padding:48px 32px}
.tg-home-banner .tg-h1{color:white;font-size:3rem;margin-bottom:16px}
.tg-home-banner .tg-subtitle{color:rgba(255,255,255,0.9);font-size:1.25rem}
`}</style>
  );
}

function Header() {
  return (
    <header className="tg-header">
      <div className="tg-container tg-header-row">
        <div className="tg-brand">
          <span className="tg-logo">TG</span>
          <div className="tg-brand-text">
            <div className="tg-brand-title">TravelGenie</div>
            <div className="tg-brand-sub">Tailor your trips</div>
          </div>
        </div>
        <nav className="tg-nav">
          <Link to="/">Home</Link>
          <a href="#">Destinations</a>
          <a href="#">Contact</a>
        </nav>
      </div>
    </header>
  );
}

function Footer(){return(<footer className="tg-footer"><div className="tg-container tg-center">© {new Date().getFullYear()} TravelGenie. Demo UI.</div></footer>)}
function Card({children, className}){return <div className={`tg-card ${className||""}`}>{children}</div>}
function LineItem({label,value}){return(<li className="tg-line"><span className="tg-dim">{label}</span><span className="tg-strong">{currency(value)}</span></li>)}

// ----------------------------------------------
// Sports Event Packages
// TODO: Replace with official event images from:
// - Singapore GP: https://singaporegp.sg/en/fanzone/media/photos/
// - Roland Garros: https://www.rolandgarros.com/en-us/photo-gallery/
// - Anfield Stadium: Contact Liverpool FC or use Flickr Creative Commons
// ----------------------------------------------
const TOURS = [
  {
    slug: "singapore-f1-grand-prix",
    title: "Singapore F1 Grand Prix",
    subtitle: "Experience the thrill of Formula 1 racing under the lights at Marina Bay Circuit",
    basePricePerPerson: 25000,
    nights: 2,
    hero: "/images/SGP1.jpeg",
    images: [
      "/images/SGP1.jpeg",
      "/images/SGP2.webp",
      "/images/SGP3.jpeg",
    ],
    highlights: ["F1 Race Tickets","Return Flights","Luxury Hotel Stay","Event Date: 2024-09-15","Marina Bay Circuit, Singapore"],
  },
  {
    slug: "liverpool-vs-manchester-united",
    title: "Liverpool vs Manchester United",
    subtitle: "Witness the biggest rivalry in English football at Anfield Stadium",
    basePricePerPerson: 20000,
    nights: 3,
    hero: "/images/SGP2.webp",
    images: [
      "/images/SGP2.webp",
      "/images/SGP1.jpeg",
      "/images/SGP3.jpeg",
    ],
    highlights: ["Match Tickets","Return Flights","Hotel Accommodation","Event Date: 2024-10-20","Anfield Stadium, Liverpool"]
  },
  {
    slug: "french-open-tennis-championship",
    title: "French Open Tennis Championship",
    subtitle: "Experience the clay court magic at Roland Garros",
    basePricePerPerson: 30000,
    nights: 4,
    hero: "/images/SGP3.jpeg",
    images: [
      "/images/SGP3.jpeg",
      "/images/SGP1.jpeg",
      "/images/SGP2.webp",
    ],
    highlights: ["Tennis Tournament Tickets","Return Flights","Paris Hotel Stay","Event Date: 2024-05-26","Roland Garros, Paris"]
  }
];

// ----------------------------------------------
// Home Page (fetches data from backend)
// ----------------------------------------------
function HomePage(){
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTours = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/products');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform backend products to frontend format
          const transformedTours = data.data.map((product) => ({
            id: product.id,
            slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            title: product.name,
            subtitle: product.description,
            basePricePerPerson: product.components.matchTickets.price,
            nights: parseInt(product.duration.split('/')[1].trim().split(' ')[0]),
            hero: product.imageUrl,
            images: [product.imageUrl, product.imageUrl, product.imageUrl],
            highlights: [
              product.components.matchTickets.name,
              product.components.flights ? product.components.flights.name : null,
              product.components.hotel ? product.components.hotel.name : null,
              `Event Date: ${product.eventDate}`,
              product.location
            ].filter(Boolean),
            product: product
          }));
          setTours(transformedTours);
        } else {
          console.error('Failed to fetch products:', data);
          setTours([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTours();
  }, []);

  if (loading) {
    return (
      <div className="tg-root">
        <StyleTag/>
        <Header/>
        <main className="tg-main">
          <div className="tg-container">
            <Card className="tg-home-banner">
              <h1 className="tg-h1">Loading Tours...</h1>
              <p className="tg-subtitle">Fetching tour data from backend</p>
            </Card>
          </div>
        </main>
        <Footer/>
      </div>
    );
  }

  return (
    <div className="tg-root">
      <StyleTag/>
      <Header/>
      <main className="tg-main">
        <div className="tg-container">
          <Card className="tg-home-banner">
            <h1 className="tg-h1">Find your next sports experience</h1>
            <p className="tg-subtitle">Premium sports events with flexible add‑ons. Pick a package to customize.</p>
          </Card>

          <div className="tg-grid" style={{gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", marginTop: "32px"}}>
            {tours.map(t => <TourCard key={t.slug} tour={t} />)}
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}

function TourCard({tour}){
  return (
    <div className="tg-card" style={{padding:0, overflow:'hidden'}}>
      <Link to={`/package/${tour.slug}`} style={{textDecoration:'none', color:'inherit'}}>
        <div className="tg-media" style={{aspectRatio:'16/10'}}>
          <img src={tour.hero} alt={tour.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
        </div>
        <div style={{padding:16}}>
          <div className="tg-h3" style={{marginBottom:6}}>{tour.title}</div>
          <div className="tg-dim" style={{fontSize:14, marginBottom:10}}>{tour.subtitle}</div>
          <div className="tg-chip">From {currency(tour.basePricePerPerson)} / person</div>
        </div>
      </Link>
    </div>
  );
}

// ----------------------------------------------
// Package Page (fetches data from backend)
// ----------------------------------------------
function TravelPackagePage(){
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for user selections
  const [travelers, setTravelers] = useState(2);
  const [includeFlight, setIncludeFlight] = useState(false);
  const [includeHotel, setIncludeHotel] = useState(false);
  const [includeInsurance, setIncludeInsurance] = useState(false);

  // Room calculation based on your requirements
  const rooms = useMemo(() => {
    if (travelers % 2 === 0) {
      return travelers / 2; // Even number: guests/2
    } else {
      return Math.floor(travelers / 2) + 1; // Odd number: guests/2 + 1
    }
  }, [travelers]);

  useEffect(() => {
    const loadPackage = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/products');
        const data = await response.json();
        
        if (data.success && data.data) {
          const product = data.data.find((p) => {
            const productSlug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return productSlug === slug;
          });
          
          if (product) {
            const transformedPkg = {
              id: product.id,
              slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              title: product.name,
              subtitle: product.description,
              basePricePerPerson: product.components.matchTickets.price,
              nights: parseInt(product.duration.split('/')[1].trim().split(' ')[0]),
              hero: product.imageUrl,
              images: [product.imageUrl, product.imageUrl, product.imageUrl],
              highlights: [
                product.components.matchTickets.name,
                product.components.flights ? product.components.flights.name : null,
                product.components.hotel ? product.components.hotel.name : null,
                `Event Date: ${product.eventDate}`,
                product.location
              ].filter(Boolean),
              product: product
            };
            setPkg(transformedPkg);
          } else {
            navigate("/", { replace: true });
            return;
          }
        } else {
          console.error('Failed to fetch products:', data);
          navigate("/", { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate("/", { replace: true });
        return;
      } finally {
        setLoading(false);
      }
    };
    
    loadPackage();
  }, [slug, navigate]);

  const breakdown = useMemo(() => {
    if (!pkg?.product) {
      return { base: 0, flights: 0, hotel: 0, insurance: 0, total: 0 };
    }
    
    // Base price contains only match tickets as per requirements
    const base = pkg.product.components.matchTickets.price * travelers;
    
    // Flights cost as per products.json
    const flights = includeFlight ? pkg.product.components.flights.price * travelers : 0;
    
    // Hotel cost as per products.json (per room)
    const hotel = includeHotel ? pkg.product.components.hotel.price * rooms : 0;
    
    // Insurance cost (per guest)
    const insurance = includeInsurance ? 400 * travelers : 0; // Fixed rate for insurance
    
    const total = base + flights + hotel + insurance;
    return { base, flights, hotel, insurance, total };
  }, [travelers, rooms, includeFlight, includeHotel, includeInsurance, pkg]);

  if (loading) {
    return (
      <div className="tg-root">
        <StyleTag/>
        <Header/>
        <main className="tg-main">
          <div className="tg-container">
            <Card className="tg-home-banner">
              <h1 className="tg-h1">Loading Package...</h1>
              <p className="tg-subtitle">Fetching package details from backend</p>
            </Card>
          </div>
        </main>
        <Footer/>
      </div>
    );
  }

  if (!pkg) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="tg-root">
      <StyleTag/>
      <Header/>
      <main className="tg-main">
        <div className="tg-container">
          <div className="tg-grid">
            <section className="tg-left">
              <Gallery images={pkg.images}/>
              <Card>
                <h1 className="tg-h1">{pkg.title}</h1>
                <p className="tg-subtitle">{pkg.subtitle}</p>
                <div className="tg-chiprow">
                  {pkg.highlights.map((h)=> <span key={h} className="tg-chip">{h}</span>)}
                </div>
                <div className="tg-box" style={{marginTop: "16px"}}>
                  <div className="tg-box-row">
                    <span>Event Date</span>
                    <span className="tg-strong">{pkg?.product?.eventDate || 'TBD'}</span>
                  </div>
                  <div className="tg-box-row">
                    <span>Location</span>
                    <span className="tg-strong">{pkg?.product?.location || 'TBD'}</span>
                  </div>
                  <div className="tg-box-row">
                    <span>Duration</span>
                    <span className="tg-strong">{pkg?.product?.duration || 'TBD'}</span>
                  </div>
                </div>
                <p className="tg-meta">Base price: <span className="tg-strong">{currency(pkg.product.components.matchTickets.price)} / person</span></p>
                <p className="tg-meta">Package duration: {pkg.nights+1} days / {pkg.nights} nights</p>
              </Card>
              <Card>
                <h2 className="tg-h2">About this experience</h2>
                <p className="tg-body">Customize your trip with flights, hotel upgrade options and curated day trips. All pricing updates live as you toggle add‑ons.</p>
              </Card>
            </section>

            <aside className="tg-right">
              <div className="tg-sticky">
                <Card>
                  <h3 className="tg-h3">Customize your package</h3>
                  <div className="tg-field">
                    <label className="tg-label">Travelers</label>
                    <div className="tg-stepper">
                      <button className="tg-btn tg-btn-ghost" onClick={()=>setTravelers(t=>Math.max(1,t-1))}>−</button>
                      <span className="tg-stepper-value">{travelers}</span>
                      <button className="tg-btn tg-btn-ghost" onClick={()=>setTravelers(t=>Math.min(8,t+1))}>+</button>
                    </div>
                    <p className="tg-help">Max 8 per booking</p>
                  </div>

                  <div className="tg-field">
                    <label className="tg-label">Rooms Required</label>
                    <div className="tg-box">
                      <div className="tg-box-row">
                        <span>Rooms (max 2 guests per room)</span>
                        <span className="tg-strong">{rooms}</span>
                      </div>
                      <p className="tg-help">Auto-calculated: {travelers % 2 === 0 ? `${travelers}/2` : `${Math.floor(travelers/2)}+1`} = {rooms} rooms</p>
                    </div>
                  </div>

                  <div className="tg-stack-sm">
                    <ToggleRow 
                      checked={includeFlight} 
                      onChange={setIncludeFlight} 
                      title={`Add Return Flights`} 
                      subtitle={`${currency(pkg.product.components.flights.price)} × ${travelers} travelers = ${currency(pkg.product.components.flights.price * travelers)}`} 
                    />
                    <ToggleRow 
                      checked={includeHotel} 
                      onChange={setIncludeHotel} 
                      title={`Add Hotel Stay`} 
                      subtitle={`${currency(pkg.product.components.hotel.price)} × ${rooms} rooms = ${currency(pkg.product.components.hotel.price * rooms)}`} 
                    />
                    <ToggleRow 
                      checked={includeInsurance} 
                      onChange={setIncludeInsurance} 
                      title={`Add Travel Insurance`} 
                      subtitle={`${currency(400)} × ${travelers} travelers = ${currency(400 * travelers)}`} 
                    />
                  </div>

                  <div className="tg-summary">
                    <h4 className="tg-h4">Price breakdown</h4>
                    <ul className="tg-summary-list">
                      <LineItem label={`${pkg.product.components.matchTickets.name} (${travelers} × ${currency(pkg.product.components.matchTickets.price)})`} value={breakdown.base} />
                      {includeFlight && (<LineItem label={`Flights (${travelers} × ${currency(pkg.product.components.flights.price)})`} value={breakdown.flights} />)}
                      {includeHotel && (<LineItem label={`Hotel (${rooms} rooms × ${currency(pkg.product.components.hotel.price)})`} value={breakdown.hotel} />)}
                      {includeInsurance && (<LineItem label={`Insurance (${travelers} × ${currency(400)})`} value={breakdown.insurance} />)}
                    </ul>
                    <div className="tg-total"><span>Total</span><span className="tg-total-value">{currency(breakdown.total)}</span></div>
                  </div>

                  <button className="tg-btn tg-btn-primary tg-btn-block" onClick={()=>alert(`Booking ${pkg.title} for ${travelers} travelers → Total ${currency(breakdown.total)}`)}>
                    Book now
                  </button>
                  <p className="tg-help center">* Demo UI. Wire this to your checkout when ready.</p>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}

function ToggleRow({checked,onChange,title,subtitle}){
  return (
    <label className="tg-toggle">
      <div className="tg-toggle-text">
        <div className="tg-toggle-title">{title}</div>
        {subtitle && <div className="tg-toggle-sub">{subtitle}</div>}
      </div>
      <input type="checkbox" className="tg-toggle-input" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
      <span className="tg-toggle-switch" aria-hidden />
    </label>
  );
}

function Gallery({images}){
  const [active,setActive]=useState(0);
  return (
    <div className="tg-gallery tg-card">
      <div className="tg-media">
        <img src={images[active]} alt="Package" loading="lazy" />
      </div>
      <div className="tg-thumbs">
        {images.map((src,i)=> (
          <button key={src} onClick={()=>setActive(i)} className={`tg-thumb ${active===i?"active":""}`} title={`Photo ${i+1}`}>
            <img src={src} alt={`thumb ${i+1}`} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------
// App (Router)
// ----------------------------------------------
export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/package/:slug" element={<TravelPackagePage/>} />
      </Routes>
    </BrowserRouter>
  );
}
