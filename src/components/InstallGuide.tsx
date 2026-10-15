const standalone =
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

export function InstallGuide() {
  if (standalone) return null
  return (
    <details class="card install">
      <summary>Přidat Paradu na plochu</summary>
      <p>Pak se otevírá jako aplikace a funguje i bez signálu.</p>
      <h3>iPhone (Safari)</h3>
      <ol>
        <li>Dole ťukni na ikonu Sdílet (čtvereček se šipkou nahoru).</li>
        <li>Sjeď dolů a vyber „Přidat na plochu“.</li>
        <li>Potvrď „Přidat“.</li>
      </ol>
      <h3>Android (Chrome)</h3>
      <ol>
        <li>Vpravo nahoře ťukni na ⋮.</li>
        <li>Vyber „Přidat na plochu“ nebo „Instalovat aplikaci“.</li>
        <li>Potvrď „Instalovat“.</li>
      </ol>
    </details>
  )
}
