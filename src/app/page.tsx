import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main>
      <Button asChild>
        <Link href="/demo">Animation Demo</Link>
      </Button>
    </main>
  );
}
