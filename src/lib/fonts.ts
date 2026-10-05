import { Noto_Sans } from "next/font/google";
import localFont from "next/font/local";

/** ChangAnunitype, the brand face from changanmotors.co.za, subset to Latin. */
export const changan = localFont({
  variable: "--font-changan",
  display: "swap",
  src: [
    { path: "../fonts/changan-unitype-light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/changan-unitype-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/changan-unitype-bold.woff2", weight: "700", style: "normal" },
  ],
});

/** Noto Sans for running text, as on the national site. */
export const noto = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});
