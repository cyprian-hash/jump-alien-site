import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-game text-7xl md:text-8xl text-alien-green glow-green mb-4">
          404
        </p>
        <h1 className="text-2xl font-semibold mb-3">Lost in space.</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you were looking for drifted into a wormhole. Let's get you
          back to the launch pad.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-alien-green/10 border border-alien-green/30 text-alien-green font-medium hover:bg-alien-green/20 transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
