import React, { useState, useEffect } from 'react';
import { Container, Image } from 'react-bootstrap';

import VisitorStats from './VisitorStats';
import {
  getVisitorCount,
  getStats,
  recordNewVisitor,
  recordReturningVisitor,
} from './analytics';

import './App.css';

const COOKIE_NAME = 'lastVisited';
const COOKIE_MINUTES = 3;

function App() {
  const [total, setTotal] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [live, setLive] = useState(null);
  const [sources, setSources] = useState([]);
  const [offline, setOffline] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      const hasCookie = document.cookie.includes(COOKIE_NAME);
      const urlParams = new URLSearchParams(window.location.search);
      const sourceParam = urlParams.get('source');

      let countResult;
      if (hasCookie) {
        countResult = await recordReturningVisitor();
      } else {
        countResult = await recordNewVisitor(sourceParam);
        const expiration = new Date();
        expiration.setTime(expiration.getTime() + COOKIE_MINUTES * 60 * 1000);
        document.cookie = `${COOKIE_NAME}=true; expires=${expiration.toUTCString()}; path=/`;
      }

      const [statsResult, visitorResult] = await Promise.all([
        getStats(),
        getVisitorCount(),
      ]);

      if (cancelled) return;

      const resolved = visitorResult.total ?? countResult.total ?? '—';
      setTotal(resolved);
      setBaseline(visitorResult.baseline ?? statsResult.baseline);
      setLive(visitorResult.live ?? statsResult.live);
      setSources(statsResult.sources || []);
      setOffline(visitorResult.offline || statsResult.offline || countResult.offline);
    }

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartSrc = `https://pythonbtcscript.s3.us-west-1.amazonaws.com/indicator.png?timestamp=${Date.now()}`;

  return (
    <div className='App'>
      <div className='bg-success text-white p-1'>
        <VisitorStats
          total={total ?? '…'}
          baseline={baseline}
          live={live}
          sources={sources}
          offline={offline}
          showBreakdown={!offline && sources.length > 0}
        />
        <div className='text-center'>
          <span
            className='info-icon'
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            role='button'
            tabIndex={0}
            aria-label='Privacy info'
          >
            {' '}
            ⓘ
          </span>
        </div>
        {showInfo && (
          <div className='info-bar text-center small'>
            Visit counts use a short-lived cookie to avoid double-counting repeat
            views in one session. Counts are stored on a self-hosted Raspberry Pi
            backend (Redis). No personal data is collected.
          </div>
        )}
      </div>

      <div className='bg-light p-5 rounded '>
        <Container className='text-center'>
          <h1>Is It A Good Time To Buy Bitcoin?</h1>
          <h6>The 21 million Bitcoin question</h6>
        </Container>
      </div>

      <Container>
        <Container className='mt-5 ml-55 mr-55'>
          <p className='paragraph-padding'>
            <h6 className='mb-3'>What's this chart?</h6>
            This chart is based on the Power Law Oscillator model for Bitcoin,
            to which I made some tweaks in order to make it more accurate based
            on recent price action. I have written an in-depth explanation about
            the model and how it works, and how you could code it yourself. If
            you're interested in diving deeper,{' '}
            <a
              href='https://medium.com/datadriveninvestor/bitcoins-power-law-oscillator-the-code-a-summary-and-a-suggested-improvement-b78b59a2bc9c'
              target='_blank'
              rel='noopener noreferrer'
            >
              give it a read!
            </a>
          </p>
          <p className='update-text paragraph-padding'>
            The following image is updated daily at midnight
          </p>
          <Image
            className='paragraph-padding image-container'
            src={chartSrc}
            alt='Bitcoin Indicator'
            fluid
          />
        </Container>
        <Container className='mt-5'>
          <div className='tldr-section'>
            <p className='paragraph-padding'>
              <h6 className='mb-3'>How do I interpret this?</h6>
              The oscillator (a value that lies between -1 and 1) can be used as
              a tool that helps us understand if Bitcoin's price is too high or
              too low compared to its historical patterns. Think of it like a
              gauge. It looks at Bitcoin's current price and compares it to
              where it's expected to be "on average" based on past data. When
              the gauge is in the red zone, it might mean Bitcoin is getting
              overvalued, and selling could be a good idea. But when it's in the
              blue zone, it might be a good time to buy because Bitcoin could be
              undervalued.
            </p>
            <p className='paragraph-padding'>
              The plot above is a scatterplot of Bitcoin's price color-coded on
              which percentile the oscillator value belongs to at any given
              point in time (read the article). Blue regions are closer to the
              10th percentile, while red regions are closer to the 90th
              percentile.
            </p>
            <p className='paragraph-padding'>
              <h6 className='mb-3'>Too long, didn't read?</h6>
              <Image
                src='/monkey1.jpg'
                fluid
                className='mb-3'
                alt='Monkey'
                style={{ maxWidth: '60%', height: 'auto' }}
              />
            </p>
            <p className='paragraph-padding'>Buy when dark blue, sell when dark red.</p>
            <p className='paragraph-padding'>
              It's important to note that the oscillator is not flawless and
              should not be the sole basis for investment decisions (don't sue
              me!)
            </p>
          </div>
        </Container>
      </Container>

      <footer className='text-center'>
        <p className='paragraph-padding'>
          &copy; {new Date().getFullYear()} Bitcoin Indicator App
        </p>
      </footer>
    </div>
  );
}

export default App;
