
import * as React from "react"

// Update the mobile breakpoint to match common standards
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Set the initial value based on window width if we're on the client side
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    // Default to false if we're server-side rendering
    return false;
  });

  React.useEffect(() => {
    // Use more efficient resize observer
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Call once to ensure correct initial state
    handleResize();
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
