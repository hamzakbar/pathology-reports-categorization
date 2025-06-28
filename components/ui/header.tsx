import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg tracking-tight">Pathology Report Generator</span>
      </div>
      <nav className="flex items-center gap-2">
        <Button variant="ghost">Dashboard</Button>
        <Button variant="ghost">Reports</Button>
        <Button variant="ghost">Settings</Button>
      </nav>
    </header>
  );
} 