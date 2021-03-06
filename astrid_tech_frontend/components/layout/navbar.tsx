import classNames from "classnames";
import Link from "next/link";
import React, { FC, ReactNode, useState } from "react";
import { BsArrowsCollapse } from "react-icons/bs";
import { GiHamburger } from "react-icons/gi";
import { Collapse, Navbar, NavbarBrand, NavbarToggler } from "reactstrap";

export type NavBarLinks = "brand" | "projects" | "blog" | "about";

type NavLinkProps = {
  to: string;
  children: ReactNode;
  active: boolean;
};

const GNavLink: FC<NavLinkProps> = ({ to, children, active }) => {
  return (
    <Link href={to}>
      <a className={classNames("nav-link", active ? "active" : null)}>
        {children}
      </a>
    </Link>
  );
};

const NavbarSeparator = () => <div className="navbar-separator" />;

type MainNavbarProps = {
  currentLocation?: NavBarLinks;
  fixed?: boolean;
};

const MainNavbar: FC<MainNavbarProps> = ({ currentLocation, fixed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <Navbar
      className="main-navbar"
      fixed={fixed ? "top" : undefined}
      expand="md"
    >
      <Link href="/">
        <NavbarBrand
          tag="a"
          href="/"
          className={classNames(
            "nav-link",
            currentLocation == "brand" ? "active" : null
          )}
        >
          astrid.tech
        </NavbarBrand>
      </Link>
      <NavbarToggler onClick={toggleIsOpen}>
        {isOpen ? <BsArrowsCollapse /> : <GiHamburger />}
      </NavbarToggler>
      <Collapse isOpen={isOpen} navbar>
        <GNavLink to="/projects" active={currentLocation == "projects"}>
          Projects
        </GNavLink>
        <GNavLink to="/latest" active={currentLocation == "blog"}>
          Blog
        </GNavLink>
        <NavbarSeparator />
        <GNavLink to="/about" active={currentLocation == "about"}>
          About
        </GNavLink>
      </Collapse>
    </Navbar>
  );
};

export default MainNavbar;
