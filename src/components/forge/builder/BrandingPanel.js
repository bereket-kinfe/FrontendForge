export default function BrandingPanel({
  form,
  updateForm,
  palettes,
  paletteId,
  choosePalette,
  colors,
  updateColor,
  componentStyles,
  setComponentStyles
}) {
  return (
    
                  <div className="forge-v3-stage">
                    <span className="forge-v3-eyebrow">02 · BRAND & BUSINESS DETAILS</span>
                    <h3>Make it belong to the client.</h3>
                    <p>Use client-approved details. You can refine every value in the generated project configuration later.</p>
                    <div className="forge-v3-form-grid">
                      <label>Business / brand name *<input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="e.g. MACHI Coffee"/></label>
                      <label>Project folder slug *<input value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} placeholder="machi-coffee"/><small>Letters, numbers and hyphens only. Must be unique.</small></label>
                      <label className="wide">Tagline / hero headline<input value={form.tagline} onChange={(e) => updateForm("tagline", e.target.value)} placeholder="A short, memorable headline"/></label>
                      <label className="wide">Business description<textarea rows={3} value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="What does the business offer?"/></label>
                      <label>Logo URL or public path<input value={form.logoUrl} onChange={(e) => updateForm("logoUrl", e.target.value)} placeholder="/images/client-logo.svg"/></label>
                      <label>Hero photo URL or public path<input value={form.heroImageUrl} onChange={(e) => updateForm("heroImageUrl", e.target.value)} placeholder="/images/client-hero.webp"/></label>
                      <label className="wide">Gallery photo paths / URLs<textarea rows={2} value={form.galleryImages} onChange={(e) => updateForm("galleryImages", e.target.value)} placeholder="One local path or approved HTTPS URL per line"/></label>
                      <label>Phone<input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+251 ..."/></label>
                      <label>WhatsApp number<input value={form.whatsapp} onChange={(e) => updateForm("whatsapp", e.target.value)} placeholder="International format"/></label>
                      <label>Email<input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="hello@business.com"/></label>
                      <label>Website URL<input value={form.website} onChange={(e) => updateForm("website", e.target.value)} placeholder="https://example.com"/></label>
                      <label className="wide">Business address<input value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Verified street, neighborhood, city"/></label>
                      <label className="wide">Opening hours<input value={form.hours} onChange={(e) => updateForm("hours", e.target.value)} placeholder="Mon–Sat · 8:00 AM–8:00 PM"/></label>
                      <label>Currency<select value={form.currency} onChange={(e) => updateForm("currency", e.target.value)}><option>ETB</option><option>USD</option><option>EUR</option><option>GBP</option><option>KES</option></select></label>
                      <label>Delivery fee<input type="number" min="0" value={form.deliveryFee} onChange={(e) => updateForm("deliveryFee", e.target.value)}/></label>
                      <label>Locale<input value={form.locale} onChange={(e) => updateForm("locale", e.target.value)}/></label>
                      <label>Typography<select value={form.font} onChange={(e) => updateForm("font", e.target.value)}><option>Manrope + DM Sans</option><option>DM Sans</option><option>Georgia + DM Sans</option><option>System sans-serif</option></select></label>
                    </div>

                    <div className="forge-v3-subhead">
                      <div><h4>Brand color system</h4><p>Choose a ready-made palette or adjust any color token.</p></div>
                    </div>
                    <div className="forge-v3-palette-grid">
                      {palettes.map((palette) => (
                        <button type="button" onClick={() => choosePalette(palette)} className={paletteId === palette.id ? "active" : ""} key={palette.id}>
                          <span>{Object.values(palette.colors).slice(0, 5).map((color, index) => <i key={index} style={{ background: color }}/>)}</span>
                          <b>{palette.name}</b>
                        </button>
                      ))}
                    </div>
                    <div className="forge-v3-color-grid">
                      {Object.entries(colors).map(([key, value]) => (
                        <label key={key}>{key}<span><input type="color" value={value} onChange={(e) => updateColor(key, e.target.value)}/><code>{value}</code></span></label>
                      ))}
                    </div>

                    <div className="forge-v3-subhead">
                      <div><h4>Reusable component styles</h4><p>Choose layout shape variations for header, hero, catalog and buttons.</p></div>
                    </div>
                    <div className="forge-v3-style-selects">
                      <label>Header style<select value={componentStyles.header} onChange={(e) => setComponentStyles((c) => ({ ...c, header: e.target.value }))}><option value="standard">Standard navigation</option><option value="centered">Centered navigation</option><option value="bold">Bold brand bar</option></select></label>
                      <label>Hero layout<select value={componentStyles.hero} onChange={(e) => setComponentStyles((c) => ({ ...c, hero: e.target.value }))}><option value="split">Split content + image</option><option value="centered">Centered statement</option><option value="photo-led">Photo-led hero</option></select></label>
                      <label>Catalog layout<select value={componentStyles.catalog} onChange={(e) => setComponentStyles((c) => ({ ...c, catalog: e.target.value }))}><option value="cards">Product card grid</option><option value="list">Compact product list</option><option value="editorial">Editorial large cards</option></select></label>
                      <label>Button shape<select value={componentStyles.buttons} onChange={(e) => setComponentStyles((c) => ({ ...c, buttons: e.target.value }))}><option value="pill">Pill</option><option value="rounded">Rounded</option><option value="square">Square</option></select></label>
                    </div>
                  </div>
  );
}
