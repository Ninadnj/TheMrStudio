import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);

    // Use MotionValues for performance
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Add smooth spring physics
    const springConfig = { damping: 25, stiffness: 400 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX - 16);
            mouseY.set(e.clientY - 16);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if hovering over clickable elements
            if (
                target.tagName === "BUTTON" ||
                target.tagName === "A" ||
                target.closest("button") ||
                target.closest("a") ||
                target.classList.contains("cursor-pointer") ||
                target.classList.contains("hover-lift")
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    // Only render on desktop
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        // Check if device supports hover
        if (window.matchMedia("(hover: hover)").matches) {
            setIsDesktop(true);
            document.body.style.cursor = 'none'; // Hide default cursor
        }
        return () => {
            document.body.style.cursor = 'auto'; // Restore default cursor
        };
    }, []);

    if (!isDesktop) return null;

    return (
        <>
            {/* Main Cursor Dot */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-none pointer-events-none z-[9999] mix-blend-difference bg-white"
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                }}
                transition={{
                    scale: { duration: 0.2 } // Fast scale transition
                }}
            />
        </>
    );
}
