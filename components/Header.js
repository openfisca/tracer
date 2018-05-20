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
html, body {
  height: 100%;
  background-color: grey;
}

    `}</style>
    <Link href="/">
      <a style={linkStyle}>Accueil</a>
    </Link>
  </div>
)

export default Header
