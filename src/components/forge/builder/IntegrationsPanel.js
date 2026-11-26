export default function IntegrationsPanel({ integrationOptions, integrations, updateIntegration }) {
  return (
    
                  <div className="forge-v3-stage">
                    <span className="forge-v3-eyebrow">04 · BUSINESS TOOLS & INTEGRATIONS</span>
                    <h3>Select the services the client has approved.</h3>
                    <p>Forge records the chosen tools and creates an integration plan and environment-variable checklist in the client copy. Real API credentials are added privately during implementation.</p>
                    <div className="forge-v3-integration-list">
                      {integrationOptions.map((item) => (
                        <div className="forge-v3-integration" key={item.id}>
                          <div className="forge-v3-integration-heading">
                            <div><strong>{item.title}</strong><small>{item.description}</small></div>
                            <span className={integrations[item.id].provider !== "Not selected" ? "planned" : "not-planned"}>
                              {integrations[item.id].provider !== "Not selected" ? "PLANNED" : "NOT SELECTED"}
                            </span>
                          </div>
                          <div className="forge-v3-integration-controls">
                            <label>Approved tool / provider<select value={integrations[item.id].provider} onChange={(e) => updateIntegration(item.id, "provider", e.target.value)}>{item.choices.map((choice) => <option key={choice}>{choice}</option>)}</select></label>
                            <label>Approved public link (not API URL)<input type="url" value={integrations[item.id].publicUrl} onChange={(e) => updateIntegration(item.id, "publicUrl", e.target.value)} placeholder="https://approved-hosted-page…"/><small>Customer-facing booking, ordering, payment or support page.</small></label>
                            <label>Client notes / requirements<input value={integrations[item.id].notes} onChange={(e) => updateIntegration(item.id, "notes", e.target.value)} placeholder="Account owner, sandbox, requirements…"/></label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="forge-v3-security-note">
                      <strong>Credential safety & provider adapters</strong>
                      <p>Do not paste secret API keys here. The generated project includes standard provider adapters, a private <code>.env.client.example</code> template, and <code>docs/INTEGRATION-PLAN.md</code>.</p>
                    </div>
                  </div>
  );
}
