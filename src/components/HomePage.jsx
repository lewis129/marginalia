import {
  CalendarBlank,
  Eye,
  MagnifyingGlass,
  PushPinSimple,
  ShieldCheck,
  Tag,
} from '@phosphor-icons/react'
import BrandMark from './BrandMark'

const FEATURES = [
  {
    icon: PushPinSimple,
    kicker: 'Pin',
    title: 'Pin what matters',
    body: 'Keep the notes you can’t lose at the top of the page — one tap to unpin.',
  },
  {
    icon: Tag,
    kicker: 'Tag',
    title: 'Tags on everything',
    body: 'Drop a tag as you write, then filter the whole notebook by a single tap.',
  },
  {
    icon: CalendarBlank,
    kicker: 'Due',
    title: 'Dates that nudge',
    body: 'Attach a due date and the Upcoming view keeps overdue thoughts honest.',
  },
  {
    icon: Eye,
    kicker: 'Markdown',
    title: 'Plain text, neat preview',
    body: 'Write in plain text or markdown; the editor saves as you go and previews clean.',
  },
  {
    icon: MagnifyingGlass,
    kicker: 'Find',
    title: 'Search that highlights',
    body: 'Type a word and the match lights up in every title and every line.',
  },
  {
    icon: ShieldCheck,
    kicker: 'Private',
    title: 'Private by default',
    body: 'Every note is tied to your account on your own PocketBase. No ads, no noise.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Create an account',
    body: 'An email and a password, nothing more. Takes about a minute.',
  },
  {
    n: '02',
    title: 'Write a thought',
    body: 'Spill it into the editor — it autosaves while you’re still typing.',
  },
  {
    n: '03',
    title: 'Pin what matters',
    body: 'Keep the can’t-loses on top; let the rest rest in the archive.',
  },
]

function Shoulder({ children, light = false }) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
        light ? 'text-ink-soft' : 'text-ink-faint'
      }`}
    >
      {children}
    </p>
  )
}

function MarginNote() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 -rotate-2 rounded-2xl border border-border bg-paper-soft" />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(35,32,26,0.08)] sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ember-deep">
            <PushPinSimple size={11} weight="fill" />
            Pinned
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-paper-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            <CalendarBlank size={11} weight="regular" />
            Due Fri
          </span>
        </div>

        <h3 className="text-lg font-semibold tracking-tight">The idea that survived</h3>

        <div className="relative mt-3 pl-5">
          <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-ember/60" />
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Ship the crate first, then obsess over the label. A good enough plan carried all the
            way beats a perfect one left in the margin
            <span className="ml-0.5 inline-block w-2.5 animate-pulse text-ember">|</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-paper-soft px-2 py-0.5 font-mono text-[11px] text-ink-soft">#idea</span>
          <span className="rounded-full bg-paper-soft px-2 py-0.5 font-mono text-[11px] text-ink-soft">#todo</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage({ onOpen }) {
  return (
    <div className="min-h-[100dvh]">
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-7 w-7" />
            <span className="font-semibold tracking-tight">Marginalia</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpen('signin')}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-card hover:text-ink active:scale-[0.98]"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onOpen('register')}
              className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-card transition hover:brightness-95 active:scale-[0.98]"
            >
              Start writing
            </button>
          </div>
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Shoulder>A private notebook, online</Shoulder>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl md:text-6xl">
              Keep the thoughts worth keeping.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Marginalia is a quiet place to write before you forget — tagged, pinned, dated, and
              searchable later. Every note stays yours, safe on your own PocketBase.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpen('register')}
                className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-[15px] font-medium text-card transition hover:brightness-95 active:scale-[0.98]"
              >
                Create your account
              </button>
              <a
                href="#how-it-works"
                className="rounded-full border border-border px-6 py-3 text-[15px] font-medium text-ink-soft transition hover:bg-card hover:text-ink"
              >
                How it works
              </a>
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              No subscription · No ads · Runs on your own PocketBase
            </p>
          </div>

          <MarginNote />
        </div>
      </header>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-8 px-4 pb-8 pt-24 sm:px-6 md:pt-32">
        <div className="mb-10 grid items-end gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <Shoulder>What it does</Shoulder>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Small habits, well kept.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            Everything you can do with a paper notebook — plus the parts paper can’t do on its own.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.kicker}
              className="group rounded-2xl border border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ember-soft text-ember-deep">
                <f.icon size={18} weight="regular" />
              </span>
              <Shoulder light>{f.kicker}</Shoulder>
              <h3 className="mt-2 font-medium tracking-tight">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-paper-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Shoulder>Getting started</Shoulder>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Three lines, then it’s yours.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative border-l border-border pl-5">
                <span className="font-mono text-xs tracking-[0.2em] text-ember">{s.n}</span>
                <h3 className="mt-2 font-medium tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-28">
        <div className="mx-auto max-w-xl">
          <Shoulder>The margin is waiting</Shoulder>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Open your notebook.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            It takes about a minute to make an account. The first thought you save is the one you
            almost lost.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpen('register')}
              className="rounded-full bg-ember px-7 py-3.5 text-[15px] font-medium text-card transition hover:brightness-95 active:scale-[0.98]"
            >
              Create your account
            </button>
            <button
              type="button"
              onClick={() => onOpen('signin')}
              className="rounded-full border border-border px-7 py-3.5 text-[15px] font-medium text-ink-soft transition hover:bg-card hover:text-ink"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-6 w-6" />
            <span className="font-semibold tracking-tight">Marginalia</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Notes in the margins of your day · Self-hosted on PocketBase
          </p>
          <div className="ml-auto flex items-center gap-4">
            <button
              type="button"
              onClick={() => onOpen('signin')}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft transition hover:text-ember"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onOpen('register')}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft transition hover:text-ember"
            >
              Create account
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}