import Image from "next/image";
export default function ImageWithCaption({ src, alt, caption }) {
  return <figure className="image-with-caption"><Image src={src} alt={alt} width={1000} height={650} sizes="(max-width: 650px) 100vw, 540px"/><figcaption>{caption}</figcaption></figure>;
}
