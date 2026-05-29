import { Link } from "wouter";
import { APP_STORE_URL, SUPPORT_EMAIL } from "@/lib/site";

/**
 * Support page. The URL of this page is what you provide to App Store
 * Connect as the "Support URL" for the app listing.
 */
export default function Support() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/assets/alien.png"
              alt="Jump Alien"
              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
            />
            <span className="font-game text-xl text-alien-green">Jump Alien</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <div className="container max-w-3xl mx-auto">
          <h1 className="font-game text-4xl md:text-5xl text-alien-green glow-green mb-2">
            Support
          </h1>
          <p className="text-muted-foreground mb-8">
            Stuck? Bug? Idea? We'd love to hear from you.
          </p>

          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Contact us
              </h2>
              <p className="mb-4">
                The fastest way to reach us is email. We read every message.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Jump%20Alien%20Support`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-alien-green/10 border border-alien-green/30 text-alien-green font-medium hover:bg-alien-green/20 transition-colors"
              >
                {SUPPORT_EMAIL}
              </a>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Frequently asked questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    How do I control the game?
                  </h3>
                  <p className="text-muted-foreground">
                    Tap anywhere on the screen to jump. Tap again mid-air for a
                    double-jump. When you grab a flying rocket, tap and hold to
                    thrust upward; release to fall.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    How do I unlock the other alien skins?
                  </h3>
                  <p className="text-muted-foreground">
                    Collect stars during your runs. Each new skin costs a fixed
                    number of stars: Classic is free, Astro is 50, Cyber is
                    120, and Nebula is 250.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Does Jump Alien work offline?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes. Jump Alien does not connect to the internet. You can
                    play on a plane, in a basement, or anywhere with no signal.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Does Jump Alien collect any of my data?
                  </h3>
                  <p className="text-muted-foreground">
                    No. We collect nothing. See the{" "}
                    <Link
                      href="/privacy"
                      className="text-alien-green hover:underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    for full details.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    How do I reset my progress?
                  </h3>
                  <p className="text-muted-foreground">
                    Open the app, tap{" "}
                    <span className="text-foreground">Settings</span> on the
                    main menu, and tap{" "}
                    <span className="text-foreground">Reset Game Data</span>.
                    This is permanent and cannot be undone.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    The game won't open or crashes. What do I do?
                  </h3>
                  <p className="text-muted-foreground">
                    Try a clean restart: fully close Jump Alien from the iOS
                    app switcher, then reopen it. If the problem continues,
                    restart your device. If it still happens, email us with
                    your device model and iOS version and we'll dig in.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Which devices does Jump Alien support?
                  </h3>
                  <p className="text-muted-foreground">
                    iPhone and iPad running iOS 17 or later. The game is
                    landscape-only.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Will there be new features?
                  </h3>
                  <p className="text-muted-foreground">
                    Maybe. We're keeping the game intentionally simple. If you
                    have an idea you'd love to see, email us and tell us why.
                  </p>
                </div>
              </div>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                When reporting a bug
              </h2>
              <p className="mb-4">
                A great bug report includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Device model (for example: iPhone 16 Pro)</li>
                <li>iOS version (Settings &rarr; General &rarr; About)</li>
                <li>App version (visible on the in-app Settings screen)</li>
                <li>What you were doing when the bug happened</li>
                <li>What you expected to happen vs. what actually happened</li>
                <li>A screenshot or screen recording if you can</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Jump Alien. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                App Store
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
