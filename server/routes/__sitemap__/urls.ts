import { getSitemapDynamicUrls } from '../../utils/sitemap-urls'

export default defineSitemapEventHandler(async () => {
  return await getSitemapDynamicUrls()
})
