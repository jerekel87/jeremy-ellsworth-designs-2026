"use client";
import NextLink from "next/link";

/* Drop-in replacement for react-router's <Link to="...">, so ported view
   components can keep their existing markup while routing through Next. */
export function Link({ to, children, ...rest }) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  );
}

export default Link;
