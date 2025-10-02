import { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "ivory-noir" | "nude-minimal" | "cool-spa";

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("ivory-noir");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setIsOpen(false);
  };

  const themes = [
    { id: "ivory-noir" as Theme, name: "Ivory Noir", color: "#F8F7F5" },
    { id: "nude-minimal" as Theme, name: "Nude Minimal", color: "#FAF8F6" },
    { id: "cool-spa" as Theme, name: "Cool Spa", color: "#F6F9F8" },
  ];

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-theme-toggle"
      >
        <Palette className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md border border-gray-200 p-2 min-w-[160px] z-50">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className="w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2"
              data-testid={`theme-${t.id}`}
            >
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: t.color }}
              />
              <span>{t.name}</span>
              {theme === t.id && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
