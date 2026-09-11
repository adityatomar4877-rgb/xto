import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Hook for smooth staggered entrance animations on child elements
 * @param selector CSS selector for target child elements inside container
 * @param deps Dependency array to re-trigger animation
 * @param stagger Delay between each item
 */
export function useStaggerEntrance(
  selector: string = ".gsap-card",
  deps: any[] = [],
  stagger: number = 0.06
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll(selector);
    if (!elements.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 18,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger,
          ease: "power2.out",
          clearProps: "transform",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, deps);

  return containerRef;
}

/**
 * Hook for smooth animated counter numbers (e.g. 0 -> 72%)
 */
export function useCounterAnimation(
  targetValue: number,
  duration: number = 1.2,
  decimals: number = 0
) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: targetValue,
        duration,
        ease: "power3.out",
        onUpdate: () => {
          if (node) {
            node.innerText = obj.val.toFixed(decimals);
          }
        },
      });
    });

    return () => ctx.revert();
  }, [targetValue, duration, decimals]);

  return nodeRef;
}

/**
 * Micro-interaction helper for hover lift and scale
 */
export function attachHoverMicroInteraction(element: HTMLElement | null) {
  if (!element) return () => {};

  const onEnter = () => {
    gsap.to(element, {
      y: -2,
      scale: 1.012,
      duration: 0.2,
      ease: "power1.out",
    });
  };

  const onLeave = () => {
    gsap.to(element, {
      y: 0,
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  element.addEventListener("mouseenter", onEnter);
  element.addEventListener("mouseleave", onLeave);

  return () => {
    element.removeEventListener("mouseenter", onEnter);
    element.removeEventListener("mouseleave", onLeave);
  };
}
