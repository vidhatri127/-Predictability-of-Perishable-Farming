'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid #E8E8E8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌾</span>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#0A0A0A', letterSpacing: '-0.02em' }}>HarvestHub</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => router.push('/auth?role=farmer')}
            style={{
              background: 'transparent', border: '1.5px solid #1B1B1B',
              borderRadius: '9999px', padding: '8px 16px',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#1B1B1B'
            }}
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push('/auth?role=farmer')}
            style={{
              background: '#2E7D32', border: 'none', borderRadius: '9999px',
              padding: '8px 16px', fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', color: 'white'
            }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 24px 40px', textAlign: 'center'
      }}>
        <span style={{
          fontWeight: 700, fontSize: '11px', textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#2E7D32', marginBottom: '12px', display: 'block'
        }}>
          HARVEST INTELLIGENCE
        </span>
        <h1 style={{
          fontWeight: 900, fontSize: '40px', letterSpacing: '-0.03em',
          lineHeight: 1.1, color: '#0A0A0A', marginBottom: '16px',
          maxWidth: '320px'
        }}>
          Harvest Smart.<br />Harvest Together.
        </h1>
        <p style={{
          color: '#616161', fontSize: '15px', lineHeight: 1.6,
          maxWidth: '300px', marginBottom: '32px'
        }}>
          Empowering Telangana farmers with real-time coordination to maximize income every season.
        </p>

        {/* CTA Row */}
        <div
          onClick={() => router.push('/auth?role=farmer')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            cursor: 'pointer', marginBottom: '48px'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1B1B1B' }}>Get Started</span>
          <div style={{
            width: '44px', height: '44px', background: '#2E7D32',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: '18px'
          }}>
            →
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div style={{ padding: '0 16px', maxWidth: '480px', margin: '0 auto' }}>
        {/* Farmer Card */}
        <div
          onClick={() => router.push('/auth?role=farmer')}
          style={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
            borderRadius: '16px', padding: '28px 24px', marginBottom: '12px',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            transition: 'transform 150ms ease-out'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.01)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: '9999px',
            padding: '4px 12px', display: 'inline-block', marginBottom: '16px'
          }}>
            <span style={{ color: '#C8FF00', fontWeight: 600, fontSize: '12px' }}>🌱 FARMER</span>
          </div>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: '22px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            I&apos;m a Farmer
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.5 }}>
            Register your crop and harvest window. Get AI recommendations.
          </p>
          <div style={{
            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '20px' }}>→</span>
          </div>
        </div>

        {/* Buyer Card */}
        <div
          onClick={() => router.push('/auth?role=buyer')}
          style={{
            background: 'white', borderRadius: '16px', padding: '28px 24px',
            border: '1px solid #E8E8E8', cursor: 'pointer', marginBottom: '32px',
            transition: 'transform 150ms ease-out', position: 'relative'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.01)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{
            background: '#F7F7F7', borderRadius: '9999px',
            padding: '4px 12px', display: 'inline-block', marginBottom: '16px'
          }}>
            <span style={{ color: '#616161', fontWeight: 600, fontSize: '12px' }}>🏪 BUYER</span>
          </div>
          <h2 style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '22px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            I&apos;m a Buyer
          </h2>
          <p style={{ color: '#616161', fontSize: '14px', lineHeight: 1.5 }}>
            Post demand and find crop supply from verified Telangana farmers.
          </p>
          <div style={{
            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '44px', height: '44px', background: '#F7F7F7',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#1B1B1B', fontSize: '20px' }}>→</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ padding: '0 16px 48px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {[
            { num: '11K+', label: 'Farmers', lime: true },
            { num: '5', label: 'Districts', lime: false },
            { num: '₹2183', label: 'Paddy MSP', lime: false },
            { num: '3x', label: 'AI Insights', lime: false },
          ].map((stat, i) => (
            <div key={i} style={{
              background: stat.lime ? '#C8FF00' : 'white',
              borderRadius: '16px', padding: '16px',
              border: stat.lime ? 'none' : '1px solid #E8E8E8',
              minWidth: '90px', flexShrink: 0
            }}>
              <div style={{
                fontWeight: 900, fontSize: '22px',
                color: stat.lime ? '#0A0A0A' : '#2E7D32',
                letterSpacing: '-0.02em'
              }}>{stat.num}</div>
              <div style={{ fontWeight: 600, fontSize: '11px', color: stat.lime ? '#0A0A0A' : '#1B1B1B' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
