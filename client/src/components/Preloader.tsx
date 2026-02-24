import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        // Hide overflow on body during preload
        document.body.style.overflow = "hidden";

        // Cleanup after animation
        const timer = setTimeout(() => {
            setComplete(true);
            document.body.style.overflow = "auto";
        }, 2400); // 2.4s total duration

        return () => {
            document.body.style.overflow = "auto";
            clearTimeout(timer);
        };
    }, []);

    if (complete) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-theme-bg"
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1], // Custom bezier for "curtain lift"
                delay: 1.6
            }}
        >
            <div className="overflow-hidden">
                <motion.h1
                    className="font-display text-4xl md:text-6xl text-theme-text text-center"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.2
                    }}
                >
                    THE MR <span className="italic font-light">Studio</span>
                </motion.h1>

                {/* Loading Line */}
                <motion.div
                    className="h-[1px] bg-theme-accent/30 mt-4 mx-auto"
                    initial={{ width: 0 }}
                    animate={{ width: "100px" }}
                    transition={{ duration: 1, delay: 0.4 }}
                />
            </div>
        </motion.div>
    );
}
