import Link from 'next/link'
import Head from 'next/head'

const linkStyle = {
  marginRight: 15
}

const Header = () => (
  <div>
    <Head>
      <link rel="stylesheet" href="static/main.css"/>
      <script
            dangerouslySetInnerHTML={{
              __html: `
            var _paq = _paq || [];
            /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              var u="//stats.data.gouv.fr/";
              _paq.push(['setTrackerUrl', u+'piwik.php']);
              _paq.push(['setSiteId', '84']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
            })();
          `}}
      />
    </Head>
    <header className="navbar">
      <div className="navbar__container">
        <Link href="/"><a className="navbar__home">Tracer</a></Link>
        <nav>
          <ul className="nav__links">
            <li className="nav__item">
              <Link href="/"><a>Home</a></Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  </div>
)

export default Header
