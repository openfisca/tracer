import Link from 'next/link'
import Head from 'next/head'

const linkStyle = {
  marginRight: 15
}

const Header = () => (
  <div>
    <Head>
      <link rel="stylesheet" href="static/main.css"/>
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
