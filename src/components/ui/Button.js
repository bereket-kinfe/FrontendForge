import Link from "next/link";

export default function Button({ children, href, variant = "primary", type = "button", disabled = false, className = "", target, rel }) {
  const classes = `button button-${variant} ${className}`.trim();
  if (href) return <Link className={classes} href={href} target={target} rel={rel}>{children}</Link>;
  return <button className={classes} type={type} disabled={disabled}>{children}</button>;
}