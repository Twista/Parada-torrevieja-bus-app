export async function onRequestGet() {
  const res = await fetch('https://torrevieja.avanzagrupo.com/index.php?option=com_avanzainfo&task=display.apiTrayectos&lineId=081&sentido=I', {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    },
  })
  const text = await res.text()
  return Response.json({ status: res.status, json: text.trimStart().startsWith('{'), sample: text.slice(0, 200) })
}
