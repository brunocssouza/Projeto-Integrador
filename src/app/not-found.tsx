import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-headline-lg text-foreground">404</h1>
      <p className="mt-2 text-body-lg text-muted-foreground">Página não encontrada</p>
      <p className="mt-1 text-body-md text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <Link href="/" className="mt-6">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  );
}
