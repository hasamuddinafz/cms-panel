import { Helmet } from "react-helmet-async";

/**
 * Wraps every admin panel page.
 * - Forces noindex/nofollow on ALL panel pages (required per spec)
 * - Sets page title with "NEXUS CMS |" prefix
 */
export default function PanelHelmet({ title }) {
  return (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
      <title>{title ? `${title} | NEXUS CMS` : "NEXUS CMS"}</title>
    </Helmet>
  );
}
