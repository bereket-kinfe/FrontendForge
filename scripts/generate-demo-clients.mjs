import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeForgePayload } from "../src/lib/forge/project.mjs";
import { createClientProjectCopy } from "../src/lib/forge/copy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharedSections = ["header", "hero", "collections", "catalog", "about", "gallery", "location", "contact", "footer"];
const palettes = {
  machi: { primary: "#087FB8", secondary: "#DDF4FC", background: "#F7F5EF", surface: "#FFFFFF", text: "#14212A", muted: "#63717A", accent: "#DDF0C9" },
  foodie: { primary: "#C83A26", secondary: "#FBE5D7", background: "#FFF8F0", surface: "#FFFFFF", text: "#241814", muted: "#78645C", accent: "#F2B33D" },
  beetle: { primary: "#58624F", secondary: "#E8E5DC", background: "#F5F3EE", surface: "#FFFEFA", text: "#202321", muted: "#77796F", accent: "#D9D5C8" },
  nova: { primary: "#5B45C6", secondary: "#ECE8FF", background: "#F8F7FC", surface: "#FFFFFF", text: "#201D2C", muted: "#777184", accent: "#E8B9C8" },
  market: { primary: "#28734D", secondary: "#E0F0E5", background: "#F7FAF5", surface: "#FFFFFF", text: "#1C2B22", muted: "#68796D", accent: "#F0D98A" },
  urban: { primary: "#E35B2F", secondary: "#FBE4D7", background: "#FFF9F4", surface: "#FFFFFF", text: "#25201D", muted: "#766D67", accent: "#F5C94E" }
};
const img = (id, w=1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const product = (id, name, category, description, price, image, extra={}) => ({ id, name, category, description, price, image, alt: name, ...extra });
const clients = [
  { template:"cafe", key:"machi", slug:"machi-coffee-demo", name:"MACHI Coffee", tagline:"A little more sunshine in every sip.", description:"Slow-steeped cold brew, creamy iced lattes and feel-good matcha. Made for the long way round, the catch-up and the everyday.", hero:img("photo-1461023058943-07fcbe16d735",1500), address:"Bole, Addis Ababa", hours:"Daily · 7:00 AM–9:00 PM", phone:"+251911000101", currency:"ETB", deliveryFee:80, products:[product("iced-latte","Iced Vanilla Latte","Coffee","Espresso, milk and house vanilla over ice.",220,img("photo-1461023058943-07fcbe16d735")),product("cold-brew","Classic Cold Brew","Coffee","Slow-steeped coffee served over ice.",190,img("photo-1517701604599-bb29b565090c")),product("matcha","Iced Matcha","Tea","Ceremonial matcha with chilled milk.",240,img("photo-1515823064-d6e0c04616a7"))] },
  { template:"restaurant", key:"foodie", slug:"foodie-kitchen-demo", name:"Foodie Kitchen", tagline:"Big flavor. Good mood. Every day.", description:"Freshly prepared comfort food, generous portions and a warm welcome. Find your new favorite from our kitchen.", hero:img("photo-1550547660-d9450f859349",1500), address:"Kazanchis, Addis Ababa", hours:"Daily · 10:00 AM–11:00 PM", phone:"+251911000102", currency:"ETB", deliveryFee:100, products:[product("classic-burger","Classic Smash Burger","Burgers","Double patty, cheddar, lettuce and house sauce.",650,img("photo-1568901346375-23c9450c58cd")),product("crispy-fries","Crispy Fries","Sides","Golden fries with signature seasoning.",180,img("photo-1573080496219-bb080dd4f877")),product("chicken-wrap","Grilled Chicken Wrap","Mains","Grilled chicken, greens and garlic dressing.",420,img("photo-1626700051175-6818013e1d4f"))] },
  { template:"furniture", key:"beetle", slug:"beetle-home-demo", name:"Beetle Home", tagline:"Quietly considered pieces for everyday living.", description:"Thoughtful furniture, honest materials and timeless forms. Make room for pieces that feel like home.", hero:img("photo-1494438639946-1ebd1d20bf85",1500), address:"Bole Atlas, Addis Ababa", hours:"Mon–Sat · 9:00 AM–6:00 PM", phone:"+251911000103", currency:"ETB", products:[product("mira-lounge-chair","Mira Lounge Chair","Seating","A sculptural oak frame with a soft linen seat.",24900,img("photo-1567538096630-e0c55bd6374c"),{dimensions:"78 × 72 × 80 cm",materials:"Oak and linen",sizes:[{id:"natural",label:"Natural oak",price:0},{id:"walnut",label:"Walnut finish",price:2500}]}),product("arlo-sofa","Arlo Two-seat Sofa","Living room","Deep comfort with a clean, tailored silhouette.",68500,img("photo-1555041469-a586c61ea9bc"),{dimensions:"180 × 90 × 82 cm",materials:"Solid wood and performance fabric"}),product("tove-table","Tove Dining Table","Dining","A warm gathering place in solid timber.",42500,img("photo-1533090481720-856c6e3c1fdc"),{dimensions:"160 × 90 × 75 cm",materials:"Solid oak"})] },
  { template:"ecommerce", key:"nova", slug:"nova-collective-demo", name:"NOVA Collective", tagline:"Everyday essentials, thoughtfully selected.", description:"A considered edit of clothing, accessories and objects made to bring a little more joy to the everyday.", hero:img("photo-1483985988355-763728e1935b",1500), address:"Online store · Addis Ababa", hours:"Online · 24/7", phone:"+251911000104", currency:"ETB", products:[product("nova-shirt","Everyday Cotton Shirt","Clothing","A breathable cotton staple with an easy fit.",1450,img("photo-1596755094514-f87e34085b2c")),product("nova-bag","City Weekend Bag","Accessories","A versatile carry-all for work and weekends.",2900,img("photo-1548036328-c9fa89d128fa")),product("nova-watch","Classic Everyday Watch","Accessories","Minimal styling with a timeless dial.",3600,img("photo-1523275335684-37898b6baf30"))] },
  { template:"grocery", key:"market", slug:"greenbasket-market-demo", name:"GreenBasket Market", tagline:"Fresh picks for a better everyday.", description:"Seasonal produce, pantry staples and everyday essentials selected with care for your home.", hero:img("photo-1542838132-92c53300491e",1500), address:"CMC, Addis Ababa", hours:"Daily · 7:00 AM–8:00 PM", phone:"+251911000105", currency:"ETB", deliveryFee:60, products:[product("tomatoes","Fresh Tomatoes","Vegetables","Ripe local tomatoes sold by the kilo.",95,img("photo-1546094096-0df4bcaaa337")),product("avocado","Fresh Avocado","Fruit","Creamy seasonal avocados.",70,img("photo-1523049673857-eb18f1d7b578")),product("coffee-beans","Ethiopian Coffee Beans","Pantry","Freshly roasted whole coffee beans.",480,img("photo-1559525839-b184a4d698c7"))] },
  { template:"foodDelivery", key:"urban", slug:"urban-bites-demo", name:"Urban Bites", tagline:"Your favorites, delivered fresh.", description:"Quick, delicious meals made fresh to order. Pick your favorites and let us bring them to your door.", hero:img("photo-1568901346375-23c9450c58cd",1500), address:"Mexico Square, Addis Ababa", hours:"Daily · 11:00 AM–10:00 PM", phone:"+251911000106", currency:"ETB", deliveryFee:90, products:[product("urban-burger","Urban Double Burger","Burgers","Double beef, melted cheese and house sauce.",690,img("photo-1550547660-d9450f859349")),product("urban-chicken","Crispy Chicken Box","Meals","Crunchy chicken with fries and dip.",520,img("photo-1626082927389-6cd097cdc6ec")),product("urban-soda","Citrus Cooler","Drinks","Fresh citrus, mint and sparkling water.",140,img("photo-1513558161293-cdacff3b7b7e"))] }
];

await fs.mkdir(path.join(root,"client-projects"),{recursive:true});
const clientIndex = `# Generated client website demonstrations\n\nSix independent websites generated from the FrontendForge master project. Each folder has its own client configuration, brand logo, theme, business details and sample catalog.\n\n| Folder | Business | Starter |\n|---|---|---|\n| \`machi-coffee-demo/\` | MACHI Coffee | Cafe & bakery |\n| \`foodie-kitchen-demo/\` | Foodie Kitchen | Restaurant |\n| \`beetle-home-demo/\` | Beetle Home | Furniture & home |\n| \`nova-collective-demo/\` | NOVA Collective | Ecommerce |\n| \`greenbasket-market-demo/\` | GreenBasket Market | Grocery |\n| \`urban-bites-demo/\` | Urban Bites | Food delivery |\n\nThese are sample projects, not real businesses. Replace all sample copy, images, contact details, hours and product information before client launch.\n`;
const indexPath = path.join(root,"client-projects","README.md");
try { await fs.access(indexPath); } catch { await fs.writeFile(indexPath, clientIndex); }
const results=[];
for (const client of clients) {
  const theme=palettes[client.key];
  const isFood=["cafe","restaurant","foodDelivery"].includes(client.template);
  const integrations={ordering:{provider:isFood?"FrontendForge WhatsApp ordering":"Not selected"},delivery:{provider:client.deliveryFee?"Client-managed delivery":"Pickup only"},booking:{provider:"Not selected"},payment:{provider:"Not selected"},inventory:{provider:"Not selected"},contact:{provider:"WhatsApp and email enquiry"}};
  const config=normalizeForgePayload({
    template:client.template,
    brand:{name:client.name,slug:client.slug,tagline:client.tagline,description:client.description,heroImageUrl:client.hero,galleryImages:[client.hero]},
    business:{address:client.address,hours:client.hours,currency:client.currency,locale:"en-ET",deliveryFee:client.deliveryFee||0},
    contact:{phone:client.phone,whatsapp:client.phone,email:`hello@${client.slug.replaceAll("-"," ").replaceAll(" ","")}.example`},
    theme, font:"Manrope + DM Sans", sections:sharedSections,
    orderedSections:client.template==="furniture"?["header","hero","collections","catalog","roomInspiration","about","gallery","location","contact","footer"]:sharedSections,
    componentStyles:{header:"standard",hero:"split",catalog:"cards",buttons:"rounded"},
    products:client.products,
    integrations
  });
  const target=await createClientProjectCopy(root,config);
  const logo=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64"><rect x="2" y="2" width="60" height="60" rx="18" fill="${theme.primary}"/><text x="32" y="43" font-family="Arial,sans-serif" font-size="36" font-weight="700" text-anchor="middle" fill="#fff">${client.name.slice(0,1).toUpperCase()}</text><text x="76" y="42" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="${theme.text}">${client.name.replaceAll("&","&amp;")}</text></svg>`;
  await fs.mkdir(path.join(target,"public"),{recursive:true});
  await fs.writeFile(path.join(target,"public","brand-logo.svg"),logo);
  const savedConfig=JSON.parse(await fs.readFile(path.join(target,"src/config/client-project.json"),"utf8"));
  savedConfig.brand.logoUrl="/brand-logo.svg";
  await fs.writeFile(path.join(target,"src/config/client-project.json"),JSON.stringify(savedConfig,null,2)+"\n");
  await fs.writeFile(path.join(target,"CLIENT-PROFILE.md"),`# ${client.name}\n\n- Starter: ${config.templateLabel}\n- Project slug: ${config.slug}\n- Brand palette: ${Object.entries(theme).map(([k,v])=>`${k} ${v}`).join(", ")}\n- Catalog: ${config.products.length} demo products\n- Currency: ${config.business.currency}\n- Contact: ${client.phone}\n\nThis is a generated demonstration website. Replace all sample copy, photography, contact details, product information and prices with client-approved content before publishing.\n`);
  results.push({name:client.name,template:client.template,slug:client.slug,path:target,products:config.products.length,orderEnabled:config.orderEnabled});
}
console.log(JSON.stringify(results,null,2));
