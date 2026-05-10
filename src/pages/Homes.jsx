import React from 'react';
import { Link } from 'react-router-dom';

// ── Stat card component (used in the trust bar) ──
function StatCard({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-white 
                      bg-clip-text text-transparent tracking-tight">
        {number}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// ── Feature card component ──
function FeatureCard({ icon, title, desc, tag, tagColor }) {
  return (
    <div className="group p-8 bg-[#0d1528] border border-white/5 rounded-2xl
                    hover:border-cyan-400/20 hover:-translate-y-1 
                    transition-all duration-300 cursor-default">
      <div className="text-3xl mb-5">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
      <span className={`inline-block mt-4 px-2.5 py-1 rounded-md 
                        text-xs font-semibold ${tagColor}`}>
        {tag}
      </span>
    </div>
  );
}

// ── Alert row component ──
function AlertRow({ color, text, time }) {
  const colors = {
    red:   'bg-red-400',
    amber: 'bg-amber-400',
    cyan:  'bg-cyan-400',
  };
  return (
    <div className="flex items-start gap-3 py-3 
                    border-b border-white/5 last:border-0">
      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 
                        ${colors[color]}`}></span>
      <div>
        <p className="text-xs text-gray-200">{text}</p>
        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{time}</p>
      </div>
    </div>
  );
}

// ── MAIN HOME PAGE ──
function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ════════ HERO SECTION ════════ */}
      <section className="min-h-screen flex flex-col items-center 
                          justify-center text-center px-6 pt-24 pb-20
                          relative">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center 
                        pointer-events-none">
          <div className="w-[600px] h-[400px] rounded-full 
                          bg-blue-600/10 blur-[120px]"></div>
        </div>

        {/* Eyebrow tag */}
        <div className="relative z-10 inline-flex items-center gap-2 
                        px-4 py-1.5 mb-7 rounded-full 
                        border border-cyan-400/25 bg-cyan-400/5 
                        text-cyan-400 text-xs font-bold tracking-widest uppercase">
          ⚡ AI-Powered Fintech Security
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-5xl md:text-7xl font-bold 
                       leading-[1.05] tracking-tight mb-6 max-w-4xl">
          Never Get Fooled by
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-600
                           bg-clip-text text-transparent">
            Fake Payments Again
          </span>
        </h1>

        {/* Subheadline */}
        <p className="relative z-10 text-lg text-gray-400 
                      max-w-xl mb-11 leading-relaxed">
          PaySentinel uses advanced AI to detect fake payment screenshots, 
          fraudulent UTR transactions, and malicious QR codes — in real time, 
          before you get scammed.
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-wrap gap-4 
                        justify-center mb-16">
          <Link to="/scanner">
            <button className="flex items-center gap-2 px-8 py-4 
                               bg-gradient-to-r from-cyan-400 to-blue-600
                               text-black font-bold text-base rounded-xl
                               hover:shadow-2xl hover:shadow-cyan-400/25 
                               hover:-translate-y-0.5 transition-all">
              🚀 Start Scanning Free
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="flex items-center gap-2 px-8 py-4 
                               border border-white/10 text-gray-300 
                               font-semibold text-base rounded-xl
                               hover:border-cyan-400/30 hover:text-white 
                               transition-all">
              📊 View Dashboard
            </button>
          </Link>
        </div>

        {/* Trust Metrics Bar */}
        <div className="relative z-10 flex flex-wrap items-center 
                        justify-center gap-8 md:gap-12">
          <StatCard number="2.4M+"  label="Scans Performed" />
          <div className="hidden md:block w-px h-10 bg-white/10"></div>
          <StatCard number="₹840Cr" label="Fraud Prevented" />
          <div className="hidden md:block w-px h-10 bg-white/10"></div>
          <StatCard number="99.3%"  label="Detection Rate" />
          <div className="hidden md:block w-px h-10 bg-white/10"></div>
          <StatCard number="<1.2s"  label="Avg Scan Time" />
        </div>
      </section>

      {/* ════════ DASHBOARD PREVIEW ════════ */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-white/5
                        shadow-2xl shadow-black/50">
          {/* Fake browser topbar */}
          <div className="flex items-center gap-2 px-5 py-3.5 
                          bg-[#080d1a] border-b border-white/5">
            <span className="w-3 h-3 rounded-full bg-red-500/70"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400/70"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/70"></span>
            <span className="ml-3 font-mono text-xs text-gray-500">
              paysentinel.io/dashboard
            </span>
          </div>

          {/* Dashboard body */}
          <div className="bg-[#0d1528] p-7">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Scans Today', value: '1,247', 
                  change: '↑ +18%', color: 'text-cyan-400', chColor: 'text-green-400' },
                { label: 'Frauds Blocked',    value: '38',    
                  change: '⚠ 3 high-risk', color: 'text-red-400', chColor: 'text-amber-400' },
                { label: 'Safe Payments',     value: '1,209', 
                  change: '↑ 97.0% safe', color: 'text-green-400', chColor: 'text-green-400' },
                { label: 'QR Codes Checked',  value: '512',   
                  change: '4 malicious', color: 'text-white', chColor: 'text-red-400' },
              ].map((m) => (
                <div key={m.label} 
                     className="p-5 bg-[#080d1a] rounded-xl border border-white/5">
                  <p className="text-[11px] text-gray-500 font-semibold 
                                uppercase tracking-wider mb-2">{m.label}</p>
                  <p className={`text-2xl font-bold tracking-tight ${m.color}`}>
                    {m.value}
                  </p>
                  <p className={`text-[11px] mt-1 font-mono ${m.chColor}`}>
                    {m.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom row: chart placeholder + alerts */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Chart placeholder */}
              <div className="bg-[#080d1a] rounded-xl border border-white/5 p-5">
                <p className="text-[11px] text-gray-500 font-semibold 
                              uppercase tracking-wider mb-4">
                  Scan Activity — Last 7 Days
                </p>
                {/* Simple bar chart using divs */}
                <div className="flex items-end gap-2 h-28">
                  {[65, 80, 55, 100, 70, 95, 75].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full rounded-t-sm bg-blue-600/60"
                        style={{ height: `${h}%` }}
                      ></div>
                      <span className="text-[9px] text-gray-600 font-mono">
                        {['M','T','W','T','F','S','S'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Alerts */}
              <div className="bg-[#080d1a] rounded-xl border border-white/5 p-5">
                <p className="text-[11px] text-gray-500 font-semibold 
                              uppercase tracking-wider mb-3">
                  AI Fraud Alerts
                </p>
                <AlertRow color="red"   
                  text="Fake PhonePe screenshot detected"
                  time="2 minutes ago · Confidence: 98.4%" />
                <AlertRow color="amber" 
                  text="Suspicious QR → phishing URL redirect"
                  time="14 minutes ago · Risk: HIGH" />
                <AlertRow color="red"   
                  text="UTR 412938764502 — not in bank records"
                  time="31 minutes ago · Action: Blocked" />
                <AlertRow color="cyan"  
                  text="Edited screenshot flagged via metadata"
                  time="1 hour ago · Adobe forensics match" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FEATURES GRID ════════ */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <p className="text-cyan-400 text-xs font-bold tracking-widest 
                      uppercase mb-3">⚙ Core Features</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Everything You Need to<br />Stay Safe Online
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mb-14 leading-relaxed">
          From screenshot forgery detection to real-time QR threat analysis.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard icon="🖼️" title="Screenshot Fraud Detection"
            desc="Upload any payment screenshot. Our AI analyzes metadata, fonts, and pixel patterns to tell you if it's real or faked."
            tag="AI Powered" tagColor="bg-purple-500/10 text-purple-400" />
          <FeatureCard icon="📱" title="QR Code Scanner"
            desc="Scan any QR code before paying. Detects malicious redirects, phishing URLs, and compromised merchant IDs instantly."
            tag="Real-time" tagColor="bg-cyan-400/10 text-cyan-400" />
          <FeatureCard icon="🔢" title="UTR Verification"
            desc="Enter any UTR number and verify if the payment was actually processed by the bank or is completely fabricated."
            tag="New" tagColor="bg-green-500/10 text-green-400" />
          <FeatureCard icon="🚨" title="Real-time Fraud Alerts"
            desc="Get instant notifications when a suspicious transaction is detected. Stay informed before money leaves your account."
            tag="Live" tagColor="bg-cyan-400/10 text-cyan-400" />
          <FeatureCard icon="📊" title="Security Analytics"
            desc="Full dashboard with fraud trends, detection history, risk scores, and exportable reports for your business."
            tag="AI Powered" tagColor="bg-purple-500/10 text-purple-400" />
          <FeatureCard icon="🔐" title="Secure Authentication"
            desc="Firebase-backed login with email, Google sign-in, and 2FA. Your verification history is encrypted and private."
            tag="Secure" tagColor="bg-green-500/10 text-green-400" />
        </div>
      </section>

      {/* ════════ FRAUD ALERT STRIP ════════ */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 p-6 rounded-2xl
                        bg-red-500/5 border border-red-500/20">
          <span className="text-3xl flex-shrink-0">🚨</span>
          <div className="flex-1">
            <h4 className="text-red-400 font-semibold text-sm mb-1">
              AI Alert: New Scam Pattern Detected
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fraudsters are now using AI-generated payment screenshots mimicking 
              Paytm and PhonePe UIs. Our models have been updated to detect this.
            </p>
          </div>
          <span className="flex-shrink-0 px-3 py-1.5 rounded-full 
                           bg-red-500/10 text-red-400 text-xs font-bold 
                           uppercase tracking-wider whitespace-nowrap">
            Live Threat
          </span>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-white/5 px-6 py-10
                         flex flex-wrap gap-6 items-center 
                         justify-between max-w-6xl mx-auto">
        <div className="font-bold text-lg tracking-tight">
          Pay<span className="text-cyan-400">Sentinel</span>
          <span className="text-gray-600 text-xs font-normal ml-2">
            AI Guardian
          </span>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          {['Privacy Policy','Terms','API Docs','GitHub'].map(l => (
            <a key={l} href="#" 
               className="hover:text-gray-300 transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-xs text-gray-600 font-mono">
          React + Node.js + Firebase · v1.0.0
        </p>
      </footer>

    </div>
  );
}

export default Home;