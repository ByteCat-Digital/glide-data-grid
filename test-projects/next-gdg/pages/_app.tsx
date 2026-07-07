import "../styles/globals.css";
import type { AppProps } from "next/app";

import "@bytecat/glide-data-grid/dist/index.css";

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;
