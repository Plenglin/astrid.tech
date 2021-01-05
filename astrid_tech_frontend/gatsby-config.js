require("source-map-support").install()
require("ts-node").register()
const assert = require('assert')
const fs = require("fs")

const packageJson = JSON.parse(fs.readFileSync(`${__dirname}/package.json`))

function getAPIRoot() {
  if (process.env.ASTRID_TECH_API_ROOT) {
    return process.env.ASTRID_TECH_API_ROOT
  } else if (process.env.NODE_ENV == 'production') {
    throw new Error("We are in production, but ASTRID_TECH_API_ROOT was not specified!")
  } else {
    apiRoot = 'http://localhost:8001/'
    console.warn("No API root specified, defaulting to", apiRoot)
    return apiRoot
  }
}

module.exports = {
  siteMetadata: {
    title: "astrid.tech",
    package: packageJson,
    version: packageJson.version,
    cookiePolicyVersion: "1",
    author: {
      name: `Astrid Yu`,
      pronouns: {
        subj: `she`,
        obj: `her`,
        pos: `hers`,
        posAdj: `her`,
        reflex: `herself`,
      },
    },
    description: packageJson.description,
    siteUrl: packageJson.homepage,
    apiRoot: getAPIRoot(),
    social: {
      twitter: `astralbijection`,
      github: `Plenglin`,
    },
  },
  plugins: [
    {
      resolve: "gatsby-plugin-exclude",
      options: { paths: ["/_index/**"] },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/projects`,
        name: `projects`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/work`,
        name: `work`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/tags`,
        name: `tags`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/misc`,
        name: `misc-data`,
      },
    },
    `gatsby-transformer-ipynb`,
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              isIconAfterHeader: true,
              className: "header-link",
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          "gatsby-remark-katex",
          "gatsby-remark-graphviz",
          `gatsby-remark-prismjs`,
          `gatsby-remark-smartypants`,
          `@pauliescanlon/gatsby-remark-sticky-table`,
          `gatsby-remark-copy-linked-files`,
          "gatsby-remark-embedder",
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-171109022-1`,
      },
    },
    {
      resolve: `gatsby-plugin-build-date`,
      options: {
        formatAsDateString: true,
        formatting: {
          format: "HH:MM:SS dddd D MMMM YYYY",
          utc: true,
        },
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                author {
                  name
                }
                description 
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allBlogPost } }) => {
              return allBlogPost.edges.map(({ node }) => {
                return {
                  author: "Astrid Yu",
                  title: node.title,
                  description: node.internal.description,
                  date: node.date,
                  categories: node.tags.map(t => t.name),
                  url: site.siteMetadata.siteUrl + node.slug,
                  guid: site.siteMetadata.siteUrl + node.slug,
                }
              })
            },
            query: `
              {
                allBlogPost(
                  sort: { order: DESC, fields: [date] },
                ) {
                  edges {
                    node {
                      tags {
                        name
                      }
                      slug
                      internal {
                        description
                      }
                      source {
                        html
                      }
                      title
                      date
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Astrid's Blog",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsby Starter Blog`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `assets/astrid-tech-icon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-disqus`,
      options: {
        shortname: `astridtech`,
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        query: `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }

          allSitePage {
            nodes {
              path
            }
          }
        }`,
        resolveSiteUrl: ({ site }) => {
          return site.siteMetadata.siteUrl
        },
        serialize: ({ site, allSitePage }) =>
          allSitePage.nodes.map(node => {
            const url = `${site.siteMetadata.siteUrl}${node.path}`
            if (node.path == "/")
              return {
                url,
                changefreq: "monthly",
                priority: 1.0,
              }
            if (node.path == "/projects/")
              return {
                url,
                changefreq: "weekly",
                priority: 0.9,
              }
            if (node.path == "/about/")
              return {
                url,
                changefreq: "monthly",
                priority: 0.7,
              }
            if (node.path == "/privacy/")
              return {
                url,
                changefreq: "weekly",
                priority: 0.1,
              }
            if (/\/projects\/.+/.test(node.path))
              return {
                url,
                changefreq: "weekly",
                priority: 0.6,
              }
            if (node.path == "/blog/")
              return {
                url,
                changefreq: "daily",
                priority: 0.8,
              }
            if (/\/blog\/.+/.test(node.path))
              return {
                url,
                changefreq: "weekly",
                priority: 0.6,
              }
            return {
              url,
              changefreq: "monthly",
              priority: 0.6,
            }
          }),
      },
    },
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        host: "https://astrid.tech",
        sitemap: "https://astrid.tech/sitemap.xml",
        policy: [{ userAgent: "*", allow: "/" }],
      },
    },
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        includePaths: [__dirname],
      },
    },
    "gatsby-source-license",
    "gatsby-plugin-root-import",

    "gatsby-astrid-source-lang-tags",
    "gatsby-astrid-transformer-user-tags",
    "gatsby-astrid-transformer-skills",
    "gatsby-astrid-transformer-work",
    "gatsby-astrid-transformer-education",
    "gatsby-astrid-transformer-notebook-markdown",
    "gatsby-astrid-transformer-project",
    "gatsby-astrid-plugin-blog",
    "gatsby-astrid-plugin-tagging",
  ],
}