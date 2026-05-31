import { Link } from "wouter";
import { APP_STORE_URL, SUPPORT_EMAIL } from "@/lib/site";

/**
 * Privacy Policy page for Jump Alien.
 *
 * IMPORTANT: This content must stay consistent with the iOS app's
 * PrivacyInfo.xcprivacy manifest and the App Store Connect privacy
 * questionnaire. Both currently declare zero data collection.
 *
 * If you ever add analytics, ads, or Game Center, update three places:
 *   1. iOS: PrivacyInfo.xcprivacy
 *   2. App Store Connect: App Privacy questionnaire
 *   3. This page
 */
export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
            className="flex items-center gap-3 group"
            aria-label="Jump Alien — back to home"
          >
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
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: May 29, 2026
          </p>

          <div className="space-y-8 text-foreground/90 leading-relaxed">
            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                The short version
              </h2>
              <p>
                Jump Alien does not collect any personal information about you.
                Your high score and game settings are stored only on your
                device. The app never talks to a server we operate. There are
                no ads, no analytics, no tracking, and no third-party SDKs.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Information we collect
              </h2>
              <p className="mb-4">
                Jump Alien is offline-first. It does not connect to any server
                we operate. The app stores the following information locally on
                your device using Apple's standard{" "}
                <code className="text-alien-green">UserDefaults</code>{" "}
                mechanism:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Your personal best high score</li>
                <li>Total stars collected across all runs</li>
                <li>Which alien skins you have unlocked</li>
                <li>Your currently selected skin</li>
                <li>Sound effects preference (on / off)</li>
                <li>Haptics preference (on / off)</li>
              </ul>
              <p className="mt-4">This data:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 mt-2">
                <li>Never leaves your device</li>
                <li>Is not transmitted to us or to any third party</li>
                <li>Is deleted automatically when you uninstall the app</li>
                <li>
                  Can be cleared at any time from the in-app{" "}
                  <span className="text-foreground">
                    Settings &rarr; Reset Game Data
                  </span>{" "}
                  button
                </li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                What we do not collect
              </h2>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Your name, email address, or any other identifier</li>
                <li>Your location</li>
                <li>Your device advertising identifier (IDFA)</li>
                <li>Usage analytics or telemetry</li>
                <li>Crash logs (beyond what you opt into via iOS Settings)</li>
                <li>
                  Contact list, photos, microphone, camera, or any other
                  content on your device
                </li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Third-party services
              </h2>
              <p>
                Jump Alien uses no third-party SDKs for advertising, analytics,
                tracking, or social features. The only third party involved in
                your use of the app is Apple, which distributes it via the App
                Store. Apple's privacy policy applies to your interaction with
                the App Store and can be read at{" "}
                <a
                  href="https://www.apple.com/legal/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-alien-green hover:underline"
                >
                  apple.com/legal/privacy
                </a>
                .
              </p>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Children's privacy
              </h2>
              <p>
                Jump Alien is rated 4+ on the App Store and is designed to be
                safe for all ages. Because the app collects no personal
                information from anyone, including children under 13, it
                complies with the United States Children's Online Privacy
                Protection Act (COPPA) and comparable regulations in other
                jurisdictions.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Your rights
              </h2>
              <p>
                Because we collect no personal data, there is no personal data
                for you to access, correct, port, or delete on our servers. You
                have complete control over the local data the app stores on
                your device:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 mt-4">
                <li>
                  Reset all local data via{" "}
                  <span className="text-foreground">
                    Settings &rarr; Reset Game Data
                  </span>
                </li>
                <li>Permanently delete all data by uninstalling the app</li>
              </ul>
              <p className="mt-4">
                Users in the European Union (GDPR), the United Kingdom
                (UK&nbsp;GDPR), California (CCPA/CPRA), and similar
                jurisdictions have additional rights regarding personal data.
                Since Jump Alien does not collect any personal data, there is
                no personal data subject to those rights.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Security
              </h2>
              <p>
                All app data is stored using Apple's standard, sandboxed iOS
                data protection system, which encrypts your data at rest while
                your device is locked.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Changes to this policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. The "Last
                updated" date at the top of the page will always reflect the
                most recent revision. Any material change will be summarized in
                the app's release notes on the App Store.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Contact
              </h2>
              <p>
                Questions about this policy? Email{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-alien-green hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
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
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
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
