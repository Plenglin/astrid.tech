import { InferGetStaticPropsType } from "next";
import React, { FC } from "react";
import { FaRssSquare } from "react-icons/fa";
import { Container } from "reactstrap";
import { PostBrief } from "../components/blog/feed";
import { PageHeading } from "../components/layout";
import Layout from "../components/layout/layout";
import SEO from "../components/seo";
import { getBlogPostMetas } from "../lib/cache";
import styles from "../styles/blog.module.scss";
import { convertBlogPostToObjectDate } from "../types/types";

export const getStaticProps = async () => {
  const posts = await getBlogPostMetas(150);
  console.log(posts);
  return {
    props: { posts },
  };
};

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
}) => {
  const title = "Blog";
  const description = "Astrid Yu's designated mind dump location";
  return (
    <Layout currentLocation="blog">
      <SEO title={title} description={description} />
      <PageHeading title={title} description={description} bgColor="#eecc8d" />
      <Container className={styles.blogContentContainer}>
        <section>
          <p className="text-right">
            <a href="https://astrid.tech/rss.xml">
              <FaRssSquare title="Subscribe to the Blog!" />
            </a>
          </p>
        </section>
        <section>
          {posts.map((post) => (
            <PostBrief
              key={post.slug}
              post={convertBlogPostToObjectDate(post)}
            />
          ))}
          <p className="text-center text-muted">(End of posts)</p>
        </section>
      </Container>
    </Layout>
  );
};

export default Page;
