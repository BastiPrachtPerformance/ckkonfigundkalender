"use client";

import { useEffect, useRef } from "react";

export function Experience() {
  const progress = useRef<HTMLSpanElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const atmosphere = useRef<HTMLCanvasElement>(null);

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

    const parallaxImages = Array.from(document.querySelectorAll<HTMLElement>(
      ".home-gallery figure img, .image-composition figure img, .split-story > img, .gallery-masonry figure img"
    ));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibleParallax = new Set<HTMLElement>();
    const parallaxObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const image = entry.target as HTMLElement;
        if (entry.isIntersecting) visibleParallax.add(image);
        else visibleParallax.delete(image);
      });
    }, { rootMargin: "150px 0px" });
    parallaxImages.forEach((image) => parallaxObserver.observe(image));

    const magneticItems = Array.from(document.querySelectorAll<HTMLElement>(
      ".solid-button, .line-button, .nav-cta"
    ));

    const onMagneticMove = (event: PointerEvent) => {
      const item = event.currentTarget as HTMLElement;
      const rect = item.getBoundingClientRect();
      item.style.setProperty("--mag-x", `${(event.clientX - rect.left - rect.width / 2) * .14}px`);
      item.style.setProperty("--mag-y", `${(event.clientY - rect.top - rect.height / 2) * .2}px`);
    };

    const onMagneticLeave = (event: PointerEvent) => {
      const item = event.currentTarget as HTMLElement;
      item.style.setProperty("--mag-x", "0px");
      item.style.setProperty("--mag-y", "0px");
    };

    magneticItems.forEach((item) => {
      item.addEventListener("pointermove", onMagneticMove);
      item.addEventListener("pointerleave", onMagneticLeave);
    });

    let scrollFrame = 0;
    const updateScroll = () => {
      scrollFrame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? window.scrollY / max : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${value})`;

      const updates = Array.from(visibleParallax, (image) => {
        const rect = image.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const shift = Math.max(-28, Math.min(28, (center - window.innerHeight / 2) * -.045));
        return { image, shift };
      });
      updates.forEach(({ image, shift }) => image.style.setProperty("--image-shift", `${shift}px`));
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
    };

    const onPointer = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      root.style.setProperty("--pointer-x", `${x * 100}%`);
      root.style.setProperty("--pointer-y", `${y * 100}%`);
      root.style.setProperty("--pointer-shift-x", `${(x - .5) * 22}px`);
      root.style.setProperty("--pointer-shift-y", `${(y - .5) * 16}px`);

      const portal = (event.target as HTMLElement).closest<HTMLElement>(".portal");
      if (portal) {
        const rect = portal.getBoundingClientRect();
        portal.style.setProperty("--portal-x", `${((event.clientX - rect.left) / rect.width - .5) * -22}px`);
        portal.style.setProperty("--portal-y", `${((event.clientY - rect.top) / rect.height - .5) * -16}px`);
      }

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

    const canvas = atmosphere.current;
    const atmosphereEnabled = !reduceMotion;
    const context = atmosphereEnabled ? canvas?.getContext("2d") : null;
    let animationFrame = 0;
    let particles: Array<{ x: number; y: number; size: number; speed: number; drift: number; phase: number }> = [];

    const resizeCanvas = () => {
      if (!canvas || !context) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: window.innerWidth < 720 ? 20 : 42 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: .4 + Math.random() * 1.5,
        speed: .08 + Math.random() * .22,
        drift: .05 + Math.random() * .12,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const drawAtmosphere = (time: number) => {
      if (!canvas || !context) return;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = "rgb(231, 205, 157)";
      context.strokeStyle = "rgb(255, 239, 208)";
      context.lineWidth = .5;
      particles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += Math.sin(time * .00035 + particle.phase) * particle.drift;
        if (particle.y < -8) { particle.y = window.innerHeight + 8; particle.x = Math.random() * window.innerWidth; }
        const pulse = .18 + (Math.sin(time * .0014 + particle.phase) + 1) * .13;
        context.globalAlpha = pulse;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
        if (particle.size > 1.45) {
          context.globalAlpha = pulse * .55;
          context.beginPath();
          context.moveTo(particle.x - 4, particle.y);
          context.lineTo(particle.x + 4, particle.y);
          context.moveTo(particle.x, particle.y - 4);
          context.lineTo(particle.x, particle.y + 4);
          context.stroke();
        }
      });
      context.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(drawAtmosphere);
    };

    if (atmosphereEnabled) {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      animationFrame = window.requestAnimationFrame(drawAtmosphere);
    }

    return () => {
      observer.disconnect();
      parallaxObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(animationFrame);
      magneticItems.forEach((item) => {
        item.removeEventListener("pointermove", onMagneticMove);
        item.removeEventListener("pointerleave", onMagneticLeave);
      });
      root.classList.remove("motion-ready", "page-leaving");
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true"><span ref={progress} /></div>
      <canvas className="atmosphere-canvas" ref={atmosphere} aria-hidden="true" />
      <div className="cursor-aura" ref={cursor} aria-hidden="true" />
      <div className="page-curtain" ref={curtain} aria-hidden="true"><span>CK</span></div>
      <a className="floating-book" href="/buchung"><span>Buchen</span><b>↗</b></a>
    </>
  );
}
