import React from "react"
import Layout from "../components/layout"
import MainNavbar from "../components/navbar"
import { Container, Button } from "reactstrap"
import HeadingSection from "../components/homepage/Heading"

const Homepage = () => {
  return (
    <Layout title="Astrid Yu">
      <HeadingSection />
    </Layout>
  )
}

export default Homepage