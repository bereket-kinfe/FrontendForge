import Image from "next/image";
import AddToCartButton from "@/components/ui/AddToCartButton";

export default function MenuItem({ item, cartKey = "food-cart" }) {
  return <article className="menu-item">
    {item.image && <Image src={item.image} alt={item.alt || item.name} width={500} height={500} sizes="(max-width: 650px) 105px, 125px" />}
    <div className="menu-item-copy"><div className="menu-item-title"><h3>{item.name}</h3><strong>{item.price}</strong></div>
      <p>{item.description}</p>
      <AddToCartButton item={item} cartKey={cartKey} label="Add to order" />
    </div>
  </article>;
}