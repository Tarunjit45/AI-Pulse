
import { Article } from '../types';

const MOCK_DATA: Article[] = [
  {
    title: "Quantum Leap: Google Announces First 'Error-Corrected' Qubit",
    date: "October 27, 2025",
    body: "In a breakthrough that could redefine computing, researchers have demonstrated the first logical qubit that effectively corrects its own errors—a holy grail for quantum mechanics. Unlike standard bits, qubits are notoriously unstable, often collapsing due to environmental noise. This new architecture uses a 'honeycomb' array of physical qubits to protect a single logical unit.\n\nThe implications are staggering. Error-corrected quantum computers could solve problems in seconds that would take supercomputers millennia, from modeling new pharmaceutical drugs to optimizing global logistics networks. While a commercial machine is still years away, this milestone proves the physics is sound.",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1024&q=80",
    fallbackImageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1024&q=80",
    sources: ["https://nature.com", "https://blog.google"],
    category: "Tech",
    analysis: {
      hypeScore: 90,
      impactScore: 100,
      prediction: "Major surge in VC funding for quantum hardware startups in Q4.",
      technicalTerm: "Quantum Error Correction",
      simpleDefinition: "A method to fix the fragility of quantum data by spreading it across many physical particles."
    }
  },
  {
    title: "India's 'Green Corridor' Highway Project Hits 50% Completion",
    date: "October 26, 2025",
    body: "The ambitious Delhi-Mumbai Expressway, billed as India's first 'Green Corridor', has officially crossed the halfway mark. The project features dedicated lanes for electric vehicles (EVs) that charge cars wirelessly as they drive, alongside a massive reforestation belt planting 2 million trees along the route.\n\nTransport Minister Nitin Gadkari hailed the progress as a blueprint for sustainable infrastructure in the Global South. The corridor is expected to cut logistics costs in India by 15%, boosting the manufacturing sector significantly. However, challenges remain regarding land acquisition for the final leg in Maharashtra.",
    imageUrl: "https://images.unsplash.com/photo-1565514020176-db769b00da76?auto=format&fit=crop&w=1024&q=80",
    fallbackImageUrl: "https://images.unsplash.com/photo-1565514020176-db769b00da76?auto=format&fit=crop&w=1024&q=80",
    sources: ["https://timesofindia.indiatimes.com", "https://pib.gov.in"],
    category: "Business",
    analysis: {
      hypeScore: 65,
      impactScore: 85,
      prediction: "Rise in domestic EV sales in North India anticipated over the next 12 months.",
      technicalTerm: "Inductive Charging",
      simpleDefinition: "Wireless charging for cars using magnetic fields buried in the road, like a giant phone charger."
    }
  },
  {
    title: "SpaceX Starship Successfully Orbits Earth, Lands in Indian Ocean",
    date: "October 14, 2025",
    body: "In a historic milestone for space exploration, SpaceX's Starship—the largest rocket ever built—has successfully completed its first full orbital flight and precision landing in the Indian Ocean. The massive vehicle lifted off from Starbase, Texas, clearing the launch tower with all 33 Raptor engines firing in perfect synchronization.\n\nThe mission profile required the ship to coast in space for 40 minutes before executing a complex re-entry maneuver. This success clears the path for NASA's Artemis III mission, which relies on Starship to land astronauts on the Moon. Competitors are now scrambling to accelerate their own heavy-lift programs.",
    imageUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1024&q=80",
    fallbackImageUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1024&q=80",
    sources: ["https://spacex.com", "https://nasa.gov"],
    category: "Tech",
    analysis: {
      hypeScore: 95,
      impactScore: 90,
      prediction: "Accelerated timeline for Mars cargo missions within 24 months.",
      technicalTerm: "Aerodynamic Control Surfaces",
      simpleDefinition: "The flaps on the rocket that move to steer it through the atmosphere like a skydiver."
    }
  },
  {
    title: "Global Markets Rally as Inflation Hits 2-Year Low",
    date: "October 25, 2025",
    body: "Major stock indices across New York, London, and Tokyo surged today as new data indicated global inflation has cooled to its lowest level in two years. Central banks signaled a potential pause in rate hikes, triggering a wave of optimism among investors who had been bracing for a recession.\n\nThe tech sector led the rally, with AI and semiconductor stocks seeing double-digit gains. Economists warn, however, that while consumer prices are stabilizing, housing markets remain volatile in major metropolitan areas.",
    imageUrl: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&w=1024&q=80",
    fallbackImageUrl: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&w=1024&q=80",
    sources: ["https://bloomberg.com", "https://ft.com"],
    category: "Business",
    analysis: {
      hypeScore: 60,
      impactScore: 80,
      prediction: "Central banks likely to cut interest rates by Q1 2026.",
      technicalTerm: "Soft Landing",
      simpleDefinition: "When an economy slows down enough to stop inflation without crashing into a recession."
    }
  },
  {
    title: "Manchester City Secures Treble with Last-Minute Winner",
    date: "May 28, 2025",
    body: "In a dramatic finale at Wembley, Manchester City has secured a historic treble, defeating their rivals with a stunning 94th-minute goal. The match was deadlocked at 1-1 until the final moments, when a counter-attack caught the defense sleeping.\n\nThe victory cements their status as one of the greatest club sides in modern football history. Fans erupted across Manchester as the final whistle blew, marking the end of a dominant season across the Premier League, FA Cup, and Champions League.",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1024&q=80",
    fallbackImageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1024&q=80",
    sources: ["https://skysports.com", "https://bbc.com/sport"],
    category: "Sports",
    analysis: {
      hypeScore: 98,
      impactScore: 40,
      prediction: "Transfer market values for City players expected to skyrocket.",
      technicalTerm: "Treble",
      simpleDefinition: "Winning the three most important trophies in a single season (League, Cup, European Cup)."
    }
  }
];

export const getRandomMockArticle = (category: string): Article => {
    // Filter by category if possible, else return any
    let pool = category === 'All' ? MOCK_DATA : MOCK_DATA.filter(a => a.category === category || (category === 'India' && a.body.includes('India')));
    
    if (pool.length === 0) pool = MOCK_DATA;
    
    const randomArticle = pool[Math.floor(Math.random() * pool.length)];
    
    // Return a copy to avoid mutating the original if we ever modify it
    return {
        ...randomArticle,
        // Mark date as Archived to indicate this isn't live API data
        date: `${randomArticle.date} (Archived)` 
    };
};
