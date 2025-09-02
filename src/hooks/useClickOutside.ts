import { useEffect } from 'react';
import type { RefObject } from 'react';

interface UseClickOutsideOptions {
  /**
   * Callback function to execute when clicking outside
   */
  onClickOutside: () => void;
  /**
   * Array of refs to exclude from the click outside detection
   */
  excludeRefs?: RefObject<HTMLElement | null>[];
  /**
   * Whether to only trigger on mobile devices (screen width <= 768px)
   */
  mobileOnly?: boolean;
  /**
   * Whether the hook is currently active
   */
  enabled?: boolean;
}

/**
 * Hook to detect clicks outside of specified elements
 * 
 * @param ref - Reference to the element to monitor
 * @param options - Configuration options for the hook
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const ref = useRef<HTMLDivElement>(null);
 *   const buttonRef = useRef<HTMLButtonElement>(null);
 *   
 *   useClickOutside(ref, {
 *     onClickOutside: () => setIsOpen(false),
 *     excludeRefs: [buttonRef], // Don't close when clicking button
 *     mobileOnly: true, // Only close on mobile
 *     enabled: isOpen // Only active when open
 *   });
 *   
 *   return (
 *     <div>
 *       <button ref={buttonRef}>Toggle</button>
 *       {isOpen && <div ref={ref}>Content</div>}
 *     </div>
 *   );
 * };
 * ```
 */
export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  options: UseClickOutsideOptions
) => {
  const { onClickOutside, excludeRefs = [], mobileOnly = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't trigger if clicking on excluded elements
      for (const excludeRef of excludeRefs) {
        if (excludeRef.current && excludeRef.current.contains(target)) {
          return;
        }
      }
      
      // Don't trigger if clicking on the main element
      if (ref.current && ref.current.contains(target)) {
        return;
      }
      
      // If mobileOnly is true, only trigger on mobile devices
      if (mobileOnly && window.innerWidth > 768) {
        return;
      }
      
      // Execute the callback
      onClickOutside();
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onClickOutside, excludeRefs, mobileOnly, enabled]);
};
