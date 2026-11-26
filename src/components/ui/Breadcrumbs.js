export default function Breadcrumbs({ items = [] }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href && index < items.length - 1 ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}{index < items.length - 1 && <i aria-hidden="true">/</i>}</li>)}</ol></nav>;
}