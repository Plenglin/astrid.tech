import { CreateNodeArgs, GatsbyNode, Node, SourceNodesArgs } from "gatsby"
import path from "path"
import { v4 } from "uuid"
import { buildNode } from "../util"
import { BlogPostContent, BLOG_POST_MIME_TYPE } from "./index"

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
  schema,
}: SourceNodesArgs) => {
  const { createTypes } = actions

  const ContentLocation = schema.buildObjectType({
    name: "ContentLocation",
    fields: {
      id: "String!",
      path: "[String!]",
    },
  })
  const BlogPost = schema.buildObjectType({
    name: "BlogPost",
    fields: {
      id: "String!",
      title: "String!",
      date: "Date!",
      slug: "String!",
      tagSlugs: "[String!]",
      tags: { type: "[Tag!]", extensions: { tagify: {} } },
      source: "MarkdownRemark!",
    },
    interfaces: ["Tagged", "Node"],
  })

  createTypes([BlogPost, ContentLocation])
}

export const onCreateNode: GatsbyNode["onCreateNode"] = async ({
  node,
  actions,
  getNode,
}: CreateNodeArgs) => {
  if (node.internal.mediaType != BLOG_POST_MIME_TYPE) return

  const { createNode, createParentChildLink } = actions
  const content = JSON.parse(node.internal.content!!) as BlogPostContent

  const slug = "/blog" + content.slug

  const blogPostNode = buildNode({
    internal: {
      type: "BlogPost",
    },
    title: content.title,
    slug,
    date: content.date,
    tagSlugs: content.tagSlugs,
    source___NODE: content.markdownNode,
  })
  createNode(blogPostNode)
  createParentChildLink({
    parent: node,
    child: (blogPostNode as unknown) as Node,
  })
}

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions

  type Data = {
    allBlogPost: {
      edges: {
        node: {
          title: string
          slug: string
        }
      }[]
    }
  }

  const result = await graphql(`
    {
      allBlogPost(sort: { fields: date, order: DESC }) {
        edges {
          node {
            title
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const posts = (result.data as Data).allBlogPost.edges

  const BlogPostTemplate = path.resolve(`src/templates/blog-post.tsx`)
  posts.forEach(({ node }, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: node.slug,
      component: BlogPostTemplate,
      context: {
        slug: node.slug,
        previous,
        next,
      },
    })
  })
}