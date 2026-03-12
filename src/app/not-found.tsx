import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mb-6 text-8xl">🥚</div>
        <h1 className="mb-4 text-3xl font-bold text-zinc-800 dark:text-zinc-100">
          Looks like you&apos;re lost
        </h1>
        <p className="mb-8 max-w-md text-zinc-600 dark:text-zinc-400">
          The page you are looking for is not available. We apologize for any
          inconvenience and hope you&apos;ll find what you&apos;re looking for on our site.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
        >
          Go to Home
        </Link>
      </div>
    </section>
  );
}
