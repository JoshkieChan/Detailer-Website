import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const defaultTitle = 'SignalSource - Professional Car Detailing in Oak Harbor, WA';
const defaultDescription = 'Premium car detailing services in Oak Harbor, WA. Interior, exterior, paint correction, and maintenance packages. Serving NAS Whidbey and surrounding areas.';
const defaultKeywords = 'car detailing, auto detailing, Oak Harbor, Whidbey Island, NAS Whidbey, paint correction, interior detailing, exterior detailing';

export const SEO = ({
  title = defaultTitle,
  description = defaultDescription,
  keywords = defaultKeywords,
  ogImage,
  ogType = 'website',
  noindex = false,
}: SEOProps) => {
  const fullTitle = title === defaultTitle ? title : `${title} | SignalSource`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* No index for dev or specific pages */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {typeof window !== 'undefined' && <link rel="canonical" href={window.location.href} />}
    </Helmet>
  );
};
