import Link from 'next/link'
import Head from 'next/head'

const linkStyle = {
  marginRight: 15
}

const Header = () => (
  <div>
    <Head>
    </Head>
    <style jsx global>{`
html, body {height: 100% }
    `}</style>
    <Link href="/">
      <a style={linkStyle}>Accueil</a>
    </Link>
    <Link href="/liste">
      <a style={linkStyle}>Liste</a>
    </Link>
    <Link href="/ajout">
      <a style={linkStyle}>Ajout</a>
    </Link>
  </div>
)

export default Header
