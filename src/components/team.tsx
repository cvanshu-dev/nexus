import { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";

// --- Member Data (Unchanged) ---
const members = [
  { id: 1, name: "Shivanshu Mishra", role: "Team Lead", image: "/img/logo.webp" },
  { id: 2, name: "Rishabh Shukla", role: "Developer", image: "/img/logo.webp" },
  { id: 3, name: "Rishabh Chaurasiya", role: "Designer", image: "/img/logo.webp" },
  { id: 4, name: "Shaurya Shrivastava", role: "Content Head", image: "/img/logo.webp" },
  { id: 5, name: "Samradh Vikram Shrivastava", role: "Marketing", image: "/img/logo.webp" },
  { id: 6, name: "Tanya Trivedi", role: "Marketing", image: "/img/logo.webp" },
];

const GAP = 24; // space between cards
const DURATION = 500; // transition duration in ms

// Target: The index of the member ID 1 ("Shivanshu Mishra, Team Lead")
const JUMP_INDEX = members.findIndex((m) => m.id === 1); // Index 0

export const Team = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null); // New ref for the track element
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true); 

  // --- Utility Functions ---

  const getCardWidth = useCallback(() => {
    if (containerWidth >= 1024) return 280; 
    if (containerWidth >= 768) return containerWidth / 2 - GAP; 
    return containerWidth * 0.7; 
  }, [containerWidth]);

  const calculateTranslateX = useCallback((index: number, width: number) => {
    const cardWidth = getCardWidth();
    const distanceToCardStart = index * (cardWidth + GAP);
    return distanceToCardStart - width / 2 + cardWidth / 2;
  }, [getCardWidth]);

  // --- Core Jump Fix ---
  const jumpToSpecificIndex = useCallback((index: number) => {
    if (!trackRef.current) return;

    // 1. Immediately turn off the transition in state
    setIsTransitioning(false); 

    // 2. Set the new logical state
    const newTranslate = calculateTranslateX(index, containerWidth);
    setTranslateX(newTranslate);
    setCurrentIndex(index);
    
    // 3. ⭐️ Force Browser Repaint ⭐️
    // Reading an element's offset property forces the browser to calculate 
    // its current layout, ensuring the translateX update is applied instantly 
    // before the next steps. This is the fix for the visual glitch.
    void trackRef.current.offsetWidth; 

    // 4. Re-enable transition for the next smooth move
    // We use requestAnimationFrame for slightly better timing reliability than setTimeout(0)
    requestAnimationFrame(() => {
      setIsTransitioning(true);
    });

  }, [containerWidth, calculateTranslateX]);

  // --- Setup and Resize Handling ---

  const measureAndSetInitialState = useCallback(() => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.offsetWidth;
    setContainerWidth(width);

    const initialTranslate = calculateTranslateX(JUMP_INDEX, width);
    setTranslateX(initialTranslate);
    setCurrentIndex(JUMP_INDEX);
    setIsTransitioning(true); 
  }, [calculateTranslateX]);

  useLayoutEffect(() => {
    measureAndSetInitialState();
  }, [measureAndSetInitialState]);

  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        const newWidth = carouselRef.current.offsetWidth;
        setContainerWidth(newWidth);
        setTranslateX(calculateTranslateX(currentIndex, newWidth));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex, calculateTranslateX]);


  // --- Navigation Logic ---

  const next = () => {
    if (currentIndex === members.length - 1) {
      // Jump from last member (ID 6) back to ID 1 (JUMP_INDEX=0)
      jumpToSpecificIndex(JUMP_INDEX); 
    } else {
      // Normal sequential smooth move
      const nextIndex = currentIndex + 1;
      const newTranslate = calculateTranslateX(nextIndex, containerWidth);
      setIsTransitioning(true); 
      setCurrentIndex(nextIndex);
      setTranslateX(newTranslate);
    }
  };

  const prev = () => {
    if (currentIndex === 0) {
      // Jump from first member (ID 1) back to the last member (ID 6)
      const lastIndex = members.length - 1;
      jumpToSpecificIndex(lastIndex); 
    } else {
      // Normal sequential smooth move
      const prevIndex = currentIndex - 1;
      const newTranslate = calculateTranslateX(prevIndex, containerWidth);
      setIsTransitioning(true);
      setCurrentIndex(prevIndex);
      setTranslateX(newTranslate);
    }
  };


  // --- Render ---

  return (
    <section id="team" className="w-full bg-black text-white px-4 py-8">
      <h2 className="text-3xl font-bold text-violet-400 uppercase tracking-wide mt-0 mb-6 text-center">
        Our Team 🚀
      </h2>
      
      {/* Center dot indicator */}
      <div className="text-center mb-4">
        {members.map((_, index) => (
          <span
            key={index}
            className={`inline-block w-2.5 h-2.5 mx-1 rounded-full transition-colors ${
              currentIndex === index ? "bg-violet-500" : "bg-neutral-600"
            }`}
          />
        ))}
      </div>
      
      <div
        ref={carouselRef}
        className="relative w-full max-w-5xl mx-auto overflow-hidden"
      >
        <div
          ref={trackRef} // 👈 Added ref to the track for forcing repaint
          // The conditional class controls the transition for the visual fix
          className={`flex gap-6 ${isTransitioning ? `transition-transform duration-${DURATION}` : ''}`} 
          style={{ transform: `translateX(-${translateX}px)` }}
        >
          {members.map((member, idx) => (
            <div
              key={member.id} 
              className={`bg-neutral-900/80 border ${
                currentIndex === idx ? "border-violet-500 scale-105 opacity-100" : "border-violet-500/30 opacity-70"
              } rounded-2xl shadow-xl p-4 flex flex-col items-center transition-all flex-shrink-0`}
              style={{ 
                width: getCardWidth(), 
                height: 320, 
              }}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 object-cover rounded-full border-2 border-violet-500 mb-4"
              />
              <h3 className="text-lg font-semibold text-center">{member.name}</h3>
              <p className="text-sm text-violet-300 text-center">{member.role}</p>
              <div className="mt-auto text-xs text-gray-400 border-t border-gray-700 w-full text-center pt-2">
                ID: #{member.id.toString().padStart(3, "0")}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="absolute top-1/2 transform -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
          <button
            onClick={prev}
            className="pointer-events-auto bg-white/10 hover:bg-white/20 p-2 rounded-full text-2xl"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="pointer-events-auto bg-white/10 hover:bg-white/20 p-2 rounded-full text-2xl"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};