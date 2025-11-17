
// pages/index.js
import Head from "next/head";
import Script from "next/script";
import fs from "fs";
import path from "path";
import Link from "next/link"

export default function Home() {
  return (
    <div>
      <h1> Page principale </h1>
      <Link href ="/business">
      <button style ={{ padding: "10px",  background: "blue",color: "white"}}>
      Aller a la page business
      </button>
      </Link>
    </div>
  )
}
  

export default function Home({ rawHtml }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>AstroFood Premium Gold</title>

        {/* CSS du loader */}
        <style>{`
          #chefai-loader {
            position: fixed; inset: 0; display: none; place-items: center; 
            background: rgba(2,6,23,0.55); backdrop-filter: blur(3px);
            z-index: 9999;
          }
          .chefai-spinner {
            width: 56px; height: 56px; border: 4px solid rgba(255,255,255,0.25);
            border-top-color: #FBBF24; border-radius: 50%;
            animation: spin 0.9s linear infinite;
            box-shadow: 0 0 24px rgba(251,191,36,.35);
          }
          .chefai-loading-text {
            color: #fff; margin-top: 12px; font-weight: 700; text-align: center;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </Head>

      {/* Contenu HTML (raw.html) */}
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />

      {/* Overlay loader */}
      <div id="chefai-loader" aria-hidden="true" role="status">
        <div style={{display:"grid", placeItems:"center"}}>
          <div className="chefai-spinner"></div>
          <div className="chefai-loading-text">Génération en cours…</div>
        </div>
      </div>

      {/* Script UI (une seule fois) */}
      <Script src="/scripts/chefai-ui.js" strategy="afterInteractive" />
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "public", "raw.html");
  let raw = "";
  try { raw = fs.readFileSync(filePath, "utf8"); }
  catch { raw = "<h1>Erreur: raw.html introuvable</h1>"; }

  // Corrige chemins relatifs -> /assets/...
  raw = raw.replace(/src=(["'])(?!\/)(assets\/[^"']+)\1/gi, 'src="/$2"');
  raw = raw.replace(/href=(["'])(?!\/)(assets\/[^"']+)\1/gi, 'href="/$2"');

  // Enlève les anciens <script src="..."></script> du raw
  raw = raw.replace(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>\s*<\/script>/gi, "");

  return { props: { rawHtml: raw } };
}
