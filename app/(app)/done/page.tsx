import Link from 'next/link'

export default function DonePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-4xl">✓</div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Check-in logged</h1>
      <p className="mb-8 max-w-xs text-sm text-neutral-400">
        Nice work. Come back tomorrow and keep the streak going.
      </p>
      <Link
        href="/check-in"
        className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-300"
      >
        Edit today&apos;s check-in
      </Link>
    </div>
  )
}
