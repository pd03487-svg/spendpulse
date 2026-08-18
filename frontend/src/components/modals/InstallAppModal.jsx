import React, { useState, useEffect } from 'react'
import {
  X,
  Smartphone,
  Laptop,
  Apple,
  Download,
  Share2,
  PlusSquare,
  Globe,
  Copy,
  CheckCircle,
  QrCode,
  ShieldCheck,
} from 'lucide-react'

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('mobile') // 'mobile', 'ios', 'desktop', 'network'

  useEffect(() => {
    // Check if already running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true)
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!isOpen) return null

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install, open this page in Chrome, Edge, or Safari and tap "Add to Home Screen" or "Install App".')
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }
  }

  const currentHostUrl = window.location.origin
  const localNetworkUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : window.location.href

  const handleCopyLink = () => {
    navigator.clipboard.writeText(localNetworkUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Download size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>
                Download & Install SpendPulse
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Install as a native standalone app across Mobile, Tablet, & Desktop
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Quick 1-Click Install CTA if prompt available */}
          {deferredPrompt && !isInstalled && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                  ⚡ Instant Installation Ready!
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Add SpendPulse icon directly to your desktop or home screen.
                </div>
              </div>
              <button onClick={handleInstallClick} className="btn btn-primary btn-sm">
                <Download size={15} />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: 'var(--income-light)',
                border: '1px solid var(--income)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                color: 'var(--income)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <CheckCircle size={18} />
              <span>SpendPulse is already running as an installed standalone app!</span>
            </div>
          )}

          {/* Device Tabs */}
          <div className="tab-group" style={{ width: '100%', display: 'flex', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
            >
              🤖 Android
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`tab-btn ${activeTab === 'ios' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
            >
              🍎 iPhone / iPad
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`tab-btn ${activeTab === 'desktop' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
            >
              💻 PC & Mac
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
            >
              🌐 Wi-Fi Access
            </button>
          </div>

          {/* Tab 1: Android Guide */}
          {activeTab === 'mobile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                How to install on Android (Chrome / Brave / Edge):
              </div>
              <div
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                }}
              >
                <p><strong>Step 1:</strong> Open this URL in Google Chrome or your Android browser.</p>
                <p><strong>Step 2:</strong> Tap the <strong>three dots (⋮)</strong> menu icon in the top right corner.</p>
                <p><strong>Step 3:</strong> Tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</p>
                <p><strong>Step 4:</strong> SpendPulse will be added to your app drawer with offline support!</p>
              </div>
            </div>
          )}

          {/* Tab 2: iOS Guide */}
          {activeTab === 'ios' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                How to install on iPhone & iPad (Safari):
              </div>
              <div
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                }}
              >
                <p><strong>Step 1:</strong> Open this URL in <strong>Apple Safari</strong> on your iPhone or iPad.</p>
                <p><strong>Step 2:</strong> Tap the <strong>Share</strong> icon <Share2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> at the bottom toolbar.</p>
                <p><strong>Step 3:</strong> Scroll down and select <strong>"Add to Home Screen" <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /></strong>.</p>
                <p><strong>Step 4:</strong> Tap <strong>Add</strong> in the top right corner. The SpendPulse icon will appear on your Home Screen.</p>
              </div>
            </div>
          )}

          {/* Tab 3: Desktop Guide */}
          {activeTab === 'desktop' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                How to install on Windows, macOS, or Linux:
              </div>
              <div
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                }}
              >
                <p><strong>Chrome / Edge / Brave:</strong> Click the <strong>Install SpendPulse</strong> icon <Download size={13} style={{ display: 'inline' }} /> in the right side of the browser address bar.</p>
                <p><strong>macOS Safari:</strong> Click <strong>File &gt; Add to Dock</strong> to install SpendPulse as a native Mac app.</p>
                <p>Once installed, it runs in its own dedicated, clean window without browser tabs or address bars.</p>
              </div>
            </div>
          )}

          {/* Tab 4: Local Network Wi-Fi Guide */}
          {activeTab === 'network' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Open on Another Device via Wi-Fi:
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Make sure your phone/tablet is connected to the same Wi-Fi network, then open this address:
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {localNetworkUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.35rem 0.65rem' }}
                >
                  {copied ? <CheckCircle size={14} color="var(--income)" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
            <ShieldCheck size={14} color="var(--income)" />
            <span>Zero-Installation Offline Support</span>
          </div>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
