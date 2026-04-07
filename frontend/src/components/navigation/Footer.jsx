import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-10 border-t border-red-100 bg-white/90">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <section>
          <h3 className="font-display text-lg font-bold text-brand-700">JP Blood Donation</h3>
          <p className="mt-2 text-sm text-slate-600">
            Connecting donors, hospitals, and requesters to save lives through faster blood coordination.
          </p>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Quick Links</h4>
          <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
            <Link to="/" className="hover:text-brand-700">Home</Link>
            <Link to="/about" className="hover:text-brand-700">About</Link>
            <Link to="/contact" className="hover:text-brand-700">Contact</Link>
          </div>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Support</h4>
          <p className="mt-2 text-sm text-slate-600">Emergency Helpline: +91 90000 00000</p>
          <p className="text-sm text-slate-600">Email: support@jpblood.org</p>
        </section>
      </div>

      <div className="border-t border-red-100 px-4 py-3 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
        Copyright {new Date().getFullYear()} JP Blood Donation. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
