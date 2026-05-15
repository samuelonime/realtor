import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
  HiUserGroup, HiOfficeBuilding, HiCash, HiDocumentText,
  HiChartBar, HiShieldCheck, HiArrowRight, HiCheck,
  HiLightningBolt, HiClock, HiTrendingUp,
} from 'react-icons/hi';

const features = [
  {
    icon: HiUserGroup,
    title: 'Lead Management',
    desc: 'Capture enquiries from Facebook, Instagram, WhatsApp and referrals. Assign to agents, set follow-up reminders, and never lose a hot lead again.',
  },
  {
    icon: HiOfficeBuilding,
    title: 'Property Management',
    desc: 'Maintain a clean inventory of all your listings with images, availability status, and instant linking to deals and clients.',
  },
  {
    icon: HiTrendingUp,
    title: 'Sales Pipeline',
    desc: 'Move deals from inspection to closing with full stage visibility. Know exactly where every deal stands and who owns it.',
  },
  {
    icon: HiCash,
    title: 'Payments & Installments',
    desc: 'Record every payment, track outstanding balances, and give clients a clean payment history. No more disputes over what has been paid.',
  },
  {
    icon: HiDocumentText,
    title: 'Document Tracking',
    desc: 'Upload and verify C of O, Survey Plans, Deeds, and every property document. Searchable and always accessible from anywhere.',
  },
  {
    icon: HiShieldCheck,
    title: 'Role-Based Access',
    desc: 'Admin, Manager, and Agent access levels. Everyone sees exactly what they need — and nothing they should not.',
  },
];

const pipeline = [
  { stage: 'New Lead', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { stage: 'Contacted', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  { stage: 'Interested', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  { stage: 'Inspection', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { stage: 'Negotiation', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  { stage: 'Closed ✓', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
];

const stats = [
  { value: '3×', label: 'More deals tracked per agent' },
  { value: '80%', label: 'Fewer missed follow-ups' },
  { value: '50+', label: 'Property firms onboarded' },
];

const roles = [
  {
    role: 'Admin',
    title: 'Company Owner / Director',
    perks: [
      'Full dashboard visibility across all agents',
      'Create and manage all user accounts',
      'Access every lead, deal, payment and document',
      'Complete audit log of every action',
    ],
  },
  {
    role: 'Manager',
    title: 'Sales Manager / Team Lead',
    highlight: true,
    perks: [
      'View and manage all leads and deals',
      'Assign and reassign leads to agents',
      'Monitor team performance metrics',
      'View (not manage) user accounts',
    ],
  },
  {
    role: 'Agent',
    title: 'Sales Agent / Officer',
    perks: [
      'View and update assigned leads only',
      'Track own deals through pipeline stages',
      'Upload documents for assigned deals',
      'View (not manage) payment records',
    ],
  },
];

const testimonials = [
  {
    quote: 'Before this CRM, we were losing 2–3 hot leads every week to poor follow-up. Our conversion rate has doubled in 6 months.',
    name: 'Adaeze Okonkwo',
    role: 'MD, Greenview Properties, Lagos',
    initials: 'AO',
  },
  {
    quote: 'Payment tracking used to cause disputes with clients constantly. Now we have a clean record of every kobo paid and outstanding.',
    name: 'Babatunde Makinde',
    role: 'Director, Apex Real Estate, Abuja',
    initials: 'BM',
  },
  {
    quote: 'My agents work across three states. I finally have real oversight of my business without calling everyone every hour.',
    name: 'Chioma Ibe',
    role: 'CEO, Skyline Homes, Port Harcourt',
    initials: 'CI',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <span className="font-semibold text-gray-900">RealEstate CRM</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pipeline" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pipeline</a>
            <a href="#roles" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Roles</a>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign In <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <Link href="/login" className="md:hidden px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg">
            Sign In
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary-600 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-primary-100 text-xs font-medium px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Built for Nigerian Real Estate
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            Replace WhatsApp &amp; Excel<br />with one proper CRM
          </h1>
          <p className="text-primary-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Capture leads, manage properties, track deals, record payments, and store documents — all in one clean system built for Nigerian property companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              Get Started <HiArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
            >
              See Features
            </a>
          </div>
          <p className="mt-6 text-primary-300 text-sm">
            Demo: admin@crm.com / password123
          </p>
        </div>

        {/* MINI DASHBOARD PREVIEW */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4 bg-white border border-gray-200 rounded px-3 py-1 text-xs text-gray-400">
                localhost:3000/dashboard
              </div>
            </div>
            <div className="flex">
              {/* Sidebar */}
              <div className="w-52 border-r border-gray-200 p-3 bg-white hidden sm:block">
                <div className="flex items-center gap-2 px-3 py-2 mb-3">
                  <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">RC</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">RealEstate CRM</span>
                </div>
                {['Dashboard', 'Leads', 'Properties', 'Deals', 'Payments', 'Documents'].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-0.5 ${i === 0 ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-500'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-gray-300'}`} />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-4 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700 mb-3">Dashboard Overview</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Active Leads', val: '142', color: 'text-primary-600' },
                    { label: 'Open Deals', val: '38', color: 'text-gray-900' },
                    { label: 'Revenue (₦)', val: '84M', color: 'text-green-600' },
                    { label: 'Properties', val: '27', color: 'text-gray-900' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-2.5">
                      <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Lead Pipeline</p>
                  {[
                    { label: 'New', w: '65%', color: 'bg-primary-500', count: 42 },
                    { label: 'Contacted', w: '48%', color: 'bg-indigo-400', count: 31 },
                    { label: 'Interested', w: '35%', color: 'bg-yellow-400', count: 22 },
                    { label: 'Negotiation', w: '18%', color: 'bg-red-400', count: 12 },
                  ].map((bar) => (
                    <div key={bar.label} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-gray-400 w-16 text-right">{bar.label}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bar.color}`} style={{ width: bar.w }} />
                      </div>
                      <span className="text-xs text-gray-400 w-5">{bar.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM STRIP */}
      <section className="bg-gray-50 border-b border-gray-200 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
            Replacing the old way Nigerian property teams work
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: HiLightningBolt, title: 'WhatsApp groups', desc: 'Leads buried in chat history, no follow-up, no ownership.' },
              { icon: HiChartBar, title: 'Excel spreadsheets', desc: 'Broken formulas, version conflicts, no real-time visibility.' },
              { icon: HiClock, title: 'Missed follow-ups', desc: 'Hot leads gone cold because nobody remembered to call back.' },
            ].map((p) => (
              <div key={p.title} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <p.icon className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-0.5 line-through decoration-red-300">{p.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-primary-600 text-sm font-medium uppercase tracking-wider mb-2">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Everything your team needs.</h2>
          <p className="text-gray-500 text-lg mb-12 max-w-xl">Five integrated modules covering the full property sales lifecycle — from first enquiry to final handover.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section id="pipeline" className="py-20 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <p className="text-primary-600 text-sm font-medium uppercase tracking-wider mb-2">Sales Pipeline</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Every deal, every step tracked.</h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl">PropFlow maps leads through a clear pipeline so nothing slips and every deal always has an owner.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {pipeline.map((p, i) => (
              <div key={p.stage} className="bg-white border border-gray-200 rounded-xl p-4 relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                  <span className="text-xs text-gray-400">Step {i + 1}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{p.stage}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${p.color}`}>Active</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-200 text-sm font-medium uppercase tracking-wider mb-2">Results</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Numbers that speak for themselves.</h2>
          <p className="text-primary-200 text-lg mb-12">Property companies using this CRM close more deals and waste less time.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl p-8">
                <p className="text-5xl font-bold text-white mb-2">{s.value}</p>
                <p className="text-primary-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-primary-600 text-sm font-medium uppercase tracking-wider mb-2">Access Control</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Built for every member of your team.</h2>
          <p className="text-gray-500 text-lg mb-12 max-w-xl">Whether you run the company or handle assigned leads, you see exactly what you need.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div
                key={r.role}
                className={`rounded-xl p-6 border ${r.highlight ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200'}`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${r.highlight ? 'text-primary-200' : 'text-primary-600'}`}>{r.role}</span>
                <h3 className={`text-lg font-semibold mt-1 mb-4 ${r.highlight ? 'text-white' : 'text-gray-900'}`}>{r.title}</h3>
                <ul className="space-y-2.5">
                  {r.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <HiCheck className={`w-4 h-4 mt-0.5 flex-shrink-0 ${r.highlight ? 'text-primary-200' : 'text-primary-500'}`} />
                      <span className={`text-sm ${r.highlight ? 'text-primary-100' : 'text-gray-600'}`}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <p className="text-primary-600 text-sm font-medium uppercase tracking-wider mb-2 text-center">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">What Nigerian property teams say.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary-600 to-primary-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to replace WhatsApp and Excel?
          </h2>
          <p className="text-primary-200 text-lg mb-8">
            Set up your account in minutes. Your whole team can be onboarded the same day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors text-base"
            >
              Open the App <HiArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-4 text-primary-300 text-sm">
            Demo: admin@crm.com / password123 &nbsp;·&nbsp; agent@crm.com / password123
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">RC</span>
            </div>
            <span className="font-semibold text-white">RealEstate CRM</span>
          </div>
          <span>Built for Nigerian real estate companies 🇳🇬</span>
          <span>© 2025 RealEstate CRM. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}