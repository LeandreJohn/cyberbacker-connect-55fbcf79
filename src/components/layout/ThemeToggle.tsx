import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { updatePreferences } from "@/lib/api/settings";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  // The header toggle and Settings → Appearance write the same preference.
  const savePreference = useMutation({
    mutationFn: (appearance: "light" | "dark") => updatePreferences({ appearance }),
    onSuccess: (prefs) => queryClient.setQueryData(["preferences"], prefs),
  });
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        toggleTheme();
        savePreference.mutate(next);
      }}
      aria-label="Toggle theme"
      className="text-muted-foreground"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
