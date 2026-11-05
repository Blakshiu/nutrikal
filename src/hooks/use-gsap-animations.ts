import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export interface GSAPContext {
  ctx: gsap.Context;
  killAll: () => void;
}

/**
 * Custom hook for GSAP animations with automatic cleanup
 * Works with TanStack Router and React lifecycle
 */
export function useGSAP(
  callback: (ctx: gsap.Context) => void,
  dependencies: React.DependencyList = [],
): GSAPContext {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // Create a new GSAP context for automatic cleanup
    // Handle both GSAP 3.12+ (context as first arg) and older (context as `this`)
    const context = gsap.context(function (this: gsap.Context, ctx: gsap.Context) {
      // GSAP 3.12+ passes context as first arg, older versions use `this`
      const gsapCtx = ctx || this;
      callback(gsapCtx);
    }, document.body);
    ctxRef.current = context;

    // Return cleanup function
    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, dependencies);

  const killAll = () => {
    ctxRef.current?.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.killTweensOf("*");
  };

  return {
    ctx: ctxRef.current!,
    killAll,
  };
}

/**
 * Hook for entrance animations (on mount)
 */
export function useEntranceAnimation(
  selector: string,
  options: {
    y?: number;
    x?: number;
    opacity?: number;
    scale?: number;
    rotation?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
    ease?: string;
  } = {},
) {
  const {
    y = 50,
    x = 0,
    opacity = 0,
    scale = 1,
    rotation = 0,
    duration = 0.8,
    delay = 0,
    stagger = 0,
    ease = "expo.out",
  } = options;

  return useGSAP((ctx) => {
    const elements = ctx.selector(selector);
    // Guard: only animate if elements exist
    if (!elements || elements.length === 0) return;

    gsap.fromTo(
      elements,
      { y, x, opacity, scale, rotation, force3D: true },
      {
        y: 0,
        x: 0,
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration,
        delay,
        stagger,
        ease,
        force3D: true,
      },
    );
  }, []);
}

/**
 * Hook for scroll-triggered reveal animations
 */
export function useScrollReveal(
  selector: string,
  options: {
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: number | boolean;
    y?: number;
    x?: number;
    opacity?: number;
    scale?: number;
    rotation?: number;
    duration?: number;
    ease?: string;
    stagger?: number;
    pin?: boolean;
    pinSpacing?: boolean;
  } = {},
) {
  const {
    trigger,
    start = "top 80%",
    end = "bottom 20%",
    scrub = false,
    y = 50,
    x = 0,
    opacity = 0,
    scale = 1,
    rotation = 0,
    duration = 0.8,
    ease = "expo.out",
    stagger = 0,
    pin = false,
    pinSpacing = true,
  } = options;

  return useGSAP((ctx) => {
    const elements = ctx.selector(selector);
    // Guard: only animate if elements exist
    if (!elements || elements.length === 0) return;

    const triggerEl = trigger ? ctx.selector(trigger) : elements;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start,
        end,
        scrub,
        pin,
        pinSpacing,
      },
    });

    tl.fromTo(
      elements,
      { y, x, opacity, scale, rotation, force3D: true },
      { y: 0, x: 0, opacity: 1, scale: 1, rotation: 0, duration, ease, stagger, force3D: true },
    );
  }, []);
}

/**
 * Hook for parallax animations
 */
export function useParallax(
  selector: string,
  options: {
    trigger?: string;
    start?: string;
    end?: string;
    yPercent?: number;
    xPercent?: number;
    scrub?: number | boolean;
  } = {},
) {
  const {
    trigger,
    start = "top bottom",
    end = "bottom top",
    yPercent = 50,
    xPercent = 0,
    scrub = 1,
  } = options;

  return useGSAP((ctx) => {
    const elements = ctx.selector(selector);
    // Guard: only animate if elements exist
    if (!elements || elements.length === 0) return;

    const triggerEl = trigger ? ctx.selector(trigger) : elements;

    gsap.to(elements, {
      yPercent,
      xPercent,
      ease: "none",
      scrollTrigger: {
        trigger: triggerEl,
        start,
        end,
        scrub,
      },
    });
  }, []);
}

/**
 * Hook for SplitText text animations
 */
export function useSplitText(
  selector: string,
  options: {
    type?: "chars" | "words" | "lines";
    y?: number;
    opacity?: number;
    duration?: number;
    stagger?: number;
    ease?: string;
    delay?: number;
    trigger?: string;
    start?: string;
  } = {},
) {
  const {
    type = "lines",
    y = 30,
    opacity = 0,
    duration = 0.8,
    stagger = 0.1,
    ease = "expo.out",
    delay = 0,
    trigger,
    start = "top 85%",
  } = options;

  return useGSAP((ctx) => {
    const elements = ctx.selector(selector);
    // Guard: only animate if elements exist
    if (!elements || elements.length === 0) return;

    const triggerEl = trigger ? ctx.selector(trigger) : elements;

    elements.forEach((element: Element) => {
      const split = new SplitText(element, { type });
      const targets = type === "chars" ? split.chars : type === "words" ? split.words : split.lines;

      gsap.fromTo(
        targets,
        { y, opacity, force3D: true },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          ease,
          delay,
          force3D: true,
          scrollTrigger: {
            trigger: triggerEl,
            start,
            toggleActions: "play none none reverse",
          },
        },
      );
    });
  }, []);
}

/**
 * Hook for counter animations
 */
export function useCounter(
  selector: string,
  targetValue: number,
  options: {
    duration?: number;
    ease?: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    trigger?: string;
    start?: string;
  } = {},
) {
  const {
    duration = 1.6,
    ease = "circ.out",
    decimals = 0,
    prefix = "",
    suffix = "",
    trigger,
    start = "top 85%",
  } = options;

  return useGSAP((ctx) => {
    const elements = ctx.selector(selector);
    // Guard: only animate if elements exist
    if (!elements || elements.length === 0) return;

    const triggerEl = trigger ? ctx.selector(trigger) : elements;

    elements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      const obj = { value: 0 };

      gsap.to(obj, {
        value: targetValue,
        duration,
        ease,
        scrollTrigger: {
          trigger: triggerEl,
          start,
          toggleActions: "play none none reverse",
        },
        onUpdate: () => {
          const value = obj.value;
          const formatted = value.toFixed(decimals);
          htmlElement.textContent = `${prefix}${formatted}${suffix}`;
        },
      });
    });
  }, []);
}

/**
 * Hook for floating animations (particles, decorative elements)
 */
export function useFloat(
  selector: string,
  options: {
    y?: number;
    x?: number;
    rotation?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
    ease?: string;
    yoyo?: boolean;
    repeat?: number;
  } = {},
) {
  const {
    y = 20,
    x = 0,
    rotation = 0,
    duration = 3,
    delay = 0,
    stagger = 0.2,
    ease = "sine.inOut",
    yoyo = true,
    repeat = -1,
  } = options;

  return useGSAP((ctx) => {
    const elements = ctx.selector(selector);
    // Guard: only animate if elements exist
    if (!elements || elements.length === 0) return;

    gsap.to(elements, {
      y: `+=${y}`,
      x: `+=${x}`,
      rotation: `+=${rotation}`,
      duration,
      delay,
      stagger,
      ease,
      yoyo,
      repeat,
      force3D: true,
    });
  }, []);
}

/**
 * Hook for magnetic hover effect
 */
export function useMagnetic(
  selector: string,
  options: {
    strength?: number;
    radius?: number;
    ease?: string;
  } = {},
) {
  const { strength = 0.3, radius = 100, ease = "power2.out" } = options;

  return useGSAP((ctx) => {
    const elements = ctx.selector(selector);
    // Guard: only animate if elements exist
    if (!elements || elements.length === 0) return;

    elements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      let isHovering = false;

      const handleMouseMove = (e: MouseEvent) => {
        if (!isHovering) return;

        const rect = htmlElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        if (distance <= radius) {
          gsap.to(htmlElement, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease,
            force3D: true,
          });
        }
      };

      const handleMouseEnter = () => {
        isHovering = true;
        document.addEventListener("mousemove", handleMouseMove);
      };

      const handleMouseLeave = () => {
        isHovering = false;
        document.removeEventListener("mousemove", handleMouseMove);
        gsap.to(htmlElement, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
          force3D: true,
        });
      };

      htmlElement.addEventListener("mouseenter", handleMouseEnter);
      htmlElement.addEventListener("mouseleave", handleMouseLeave);

      // Cleanup
      ctx.add(() => {
        htmlElement.removeEventListener("mouseenter", handleMouseEnter);
        htmlElement.removeEventListener("mouseleave", handleMouseLeave);
        document.removeEventListener("mousemove", handleMouseMove);
      });
    });
  }, []);
}

/**
 * Hook for pinning sections during scroll
 */
export function usePin(
  selector: string,
  options: {
    start?: string;
    end?: string;
    pinSpacing?: boolean;
  } = {},
) {
  const { start = "top top", end = "+=100%", pinSpacing = true } = options;

  return useGSAP((ctx) => {
    const elements = ctx.selector(selector);
    // Guard: only animate if elements exist
    if (!elements || elements.length === 0) return;

    elements.forEach((element: Element) => {
      ScrollTrigger.create({
        trigger: element,
        start,
        end,
        pin: true,
        pinSpacing,
      });
    });
  }, []);
}

export { gsap, ScrollTrigger, SplitText };
