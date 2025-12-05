import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/seed', '/invite'],
            },
        ],
        sitemap: 'https://fuelshield.netlify.app/sitemap.xml', // Update with your Netlify URL
    }
}
