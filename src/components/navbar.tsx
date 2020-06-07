import { Link } from "gatsby"
import React, { FC, useState, ReactNode } from "react"
import { BsArrowsCollapse } from "react-icons/bs"
import { GiHamburger } from "react-icons/gi"
import {
  Collapse,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavLinkProps,
} from "reactstrap"

type NavLinkProps = {
  to: string
  children: ReactNode
}

const NavLink: FC<NavLinkProps> = ({ to, children }) => {
  return (
    <Link
      className="nav-link"
      to={to}
      style={{
        textDecorationLine: "none",
        textDecoration: "none",
        color: "#FFFFFF",
      }}
    >
      {children}
    </Link>
  )
}

const MainNavbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleIsOpen = () => setIsOpen(!isOpen)

  return (
    <Navbar fixed="top" expand="md">
      <NavbarBrand tag={Link} to="/" activeClassName="active">
        Astrid
      </NavbarBrand>
      <NavbarToggler onClick={toggleIsOpen}>
        {isOpen ? <BsArrowsCollapse /> : <GiHamburger />}
      </NavbarToggler>
      <Collapse isOpen={isOpen} navbar>
        <NavLink to="/portfolio">Portfolio</NavLink>
        <NavLink to="/blog">Blog</NavLink>
      </Collapse>
    </Navbar>
  )
}

export default MainNavbar