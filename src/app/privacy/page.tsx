import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | 3HO Event App",
  description: "How the 3HO Event App handles your information: offline-first by design, optional accounts, and no ads or tracking.",
};

/**
 * Public privacy policy — required by the App Store and Google Play. Written
 * to match what the app actually does; review with the organization before
 * store submission and update the date on any change.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-black text-[#2f62b6]">{title}</h2>
      <div className="space-y-2 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f39200]">3HO Event App</p>
        <h1 className="text-4xl font-black tracking-[-0.05em] text-[#2f62b6]">Privacy Policy</h1>
        <p className="mt-1 text-sm font-semibold text-stone-500">Last updated: August 28, 2026</p>
      </div>

      <Section title="The short version">
        <p>
          The 3HO Event App is an offline-first event guide. Almost everything you do in it — browsing the
          program, saving favorites, building your agenda, reading event info — stays on your device. There
          are no ads, no third-party analytics, no location tracking, and we never sell your information.
        </p>
      </Section>

      <Section title="Information stored on your device">
        <p>
          Event content, your favorites and personal agenda, downloaded announcements, and your notification
          preferences are stored locally on your device so the app works without connectivity. This
          information is not transmitted anywhere unless a feature below says otherwise, and it is removed
          when you uninstall the app or clear its data.
        </p>
      </Section>

      <Section title="Optional account">
        <p>
          You can use the entire app without an account, and the app does not create accounts — those are
          made on 3HO&apos;s website. If you choose to sign in with a 3HO account,
          your email address, display name, and password are processed by 3HO&apos;s website (3ho.org) to
          authenticate you, and your favorited sessions are synced to your account so they follow you across
          devices. Passwords are handled by WordPress&apos;s standard authentication; the app stores only an
          access token on your device, which is invalidated when you sign out.
        </p>
      </Section>

      <Section title="Notifications">
        <p>
          If you allow notifications, the app registers your device&apos;s push token with 3HO&apos;s server together
          with your notification preferences, the event you are viewing, and the app version — with or
          without an account. This is used only to deliver event alerts and, if you opt in, occasional news
          about future 3HO events. You can change both preferences in the app at any time, or disable
          notifications entirely in your device settings. Reminders for your favorited sessions are scheduled
          locally on your device and involve no server at all.
        </p>
      </Section>

      <Section title="Contact form">
        <p>
          When you send a message through the Contact section, the name, email address, optional phone
          number, and message you provide are transmitted to 3HO and delivered to the event team by email so
          they can respond to you. Messages you compose offline are stored on your device until they can be
          sent.
        </p>
      </Section>

      <Section title="Third parties">
        <p>
          Push notifications are delivered through Apple (APNs) and Google (Firebase Cloud Messaging), which
          process the device token as part of delivery. The app contains links to 3HO websites (for example,
          event registration), which have their own privacy policies. No advertising or analytics SDKs are
          included.
        </p>
      </Section>

      <Section title="Your choices & deletion">
        <p>
          Signing out stops favorites sync and invalidates the app&apos;s access token. Disabling notifications
          unregisters your device from push delivery. Uninstalling the app removes all locally stored data.
          To delete your 3HO account and its synced data, ask us through the app&apos;s Contact section or on
          3ho.org, where the account was created.
        </p>
      </Section>

      <Section title="Children">
        <p>
          The app is intended for event attendees and is not directed at children under 13. We do not
          knowingly collect personal information from children.
        </p>
      </Section>

      <Section title="Changes & contact">
        <p>
          If this policy changes, the date above is updated and the new version ships with the app. For any
          privacy question or request, reach us through the app&apos;s Contact section or via 3ho.org.
        </p>
      </Section>
    </div>
  );
}
