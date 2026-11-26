import FurnitureCheckout from "@/components/furniture/FurnitureCheckout";
import { furnitureStore } from "@/config/furniture-store";
export const metadata = { title: `Furniture enquiry | ${furnitureStore.brandName}`, robots: { index: false, follow: true } };
export default function Page() {
  return <div className="furniture-site"><header className="furniture-header"><a className="furniture-wordmark" href="/templates/furniture">{furnitureStore.brandName}</a><nav><a href="/templates/furniture#shop">Shop</a><a href="/templates/furniture#contact">Contact</a></nav></header><FurnitureCheckout store={furnitureStore}/></div>;
}
