import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
      >
        Go Home
      </Link>
    </section>
  );
}

export default NotFoundPage;
