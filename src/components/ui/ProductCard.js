import Image from "next/image";
import AddToCartButton from "@/components/ui/AddToCartButton";
import Badge from "@/components/ui/Badge";

export default function ProductCard({ product, cartKey = "shop-cart" }) {
  return <article className="product-card">
    <div className="product-image-wrap">
      <Image src={product.image} alt={product.alt || product.name} className="product-image" width={800} height={1000} sizes="(max-width: 650px) 50vw, 25vw" />
      {product.label && <Badge className="product-label">{product.label}</Badge>}
    </div>
    <div className="product-info">
      <div><h3>{product.name}</h3>{product.category && <p className="product-category">{product.category}</p>}</div>
      <div className="product-bottom"><strong>{product.price}</strong><AddToCartButton item={product} cartKey={cartKey} label="Add" /></div>
    </div>
  </article>;
}