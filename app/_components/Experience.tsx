"use client";

import { useEffect, useRef } from "react";

export function Experience() {
  const progress = useRef<HTMLSpanElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    const revealables = Array.from(document.querySelectorAll<HTMLElement>(
      "main h2, main figure, .body-copy, .editorial-intro div > p, .booking-option, .feature-rail > div, .legal-document > *, .contact-form, .contact-details, .gallery-hero > p, .contact-hero > p"
    )).filter((item) => !item.closest(".home-hero, .page-hero, .booking-hero"));

    revealables.forEach((item, index) => {
      item.classList.add("reveal-target");
      item.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealables.forEach((item) => observer.observe(item));

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? window.scrollY / max : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${value})`;
      root.style.setProperty("--scroll-y", `${window.scrollY}px`);
    };

    const onPointer = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      root.style.setProperty("--pointer-x", `${x * 100}%`);
      root.style.setProperty("--pointer-y", `${y * 100}%`);
      root.style.setProperty("--pointer-shift-x", `${(x - .5) * 22}px`);
      root.style.setProperty("--pointer-shift-y", `${(y - .5) * 16}px`);

      if (cursor.current) {
        cursor.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        cursor.current.classList.toggle("cursor-active", Boolean((event.target as HTMLElement).closest("a, button, summary")));
      }
    };

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.protocol === "mailto:" || anchor.origin !== location.origin || anchor.hash) return;
      if (anchor.pathname === location.pathname) return;

      event.preventDefault();
      if (curtain.current) {
        curtain.current.style.animation = "none";
        curtain.current.style.transform = "translateY(100%)";
        void curtain.current.offsetWidth;
      }
      root.classList.add("page-leaving");
      window.setTimeout(() => { window.location.href = anchor.href; }, 560);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("click", onClick);
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("click", onClick);
      root.classList.remove("motion-ready", "page-leaving");
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true"><span ref={progress} /></div>
      <div className="cursor-aura" ref={cursor} aria-hidden="true" />
      <div className="page-curtain" ref={curtain} aria-hidden="true"><span>CK</span></div>
      <a className="floating-book" href="/kontakt"><span>Termin</span><b>↗</b></a>
    </>
  );
}
