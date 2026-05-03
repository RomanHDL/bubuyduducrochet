import Link from 'next/link';

export const metadata = {
  title: 'Política de Envíos | Mundo A Crochet',
  description: 'Tiempos, costos, cobertura y proceso de envío de pedidos en Mundo A Crochet.',
};

const LAST_UPDATE = '3 de mayo de 2026';

export default function EnviosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <header className="mb-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Documento legal</span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Política de Envíos</h1>
        <p className="text-sm text-cocoa-400">Última actualización: {LAST_UPDATE}</p>
      </header>

      <article className="space-y-7 text-cocoa-600 text-sm leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">1. Cobertura</h2>
          <p>
            Enviamos a toda la <strong>República Mexicana</strong>. Si vives fuera de México y deseas recibir un pedido,
            escríbenos por WhatsApp o correo para evaluarlo caso por caso.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">2. Paqueterías</h2>
          <p>
            Trabajamos con paqueterías reconocidas como <strong>Estafeta, DHL, Fedex y Paquetexpress</strong>. La paquetería
            asignada depende del destino, el tamaño del pedido y la rapidez disponible.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">3. Tiempos de entrega</h2>
          <div className="bg-cream-50 border border-cream-200 rounded-cute p-4 my-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-cream-200">
                  <th className="pb-2 font-bold text-cocoa-700">Tipo</th>
                  <th className="pb-2 font-bold text-cocoa-700">Preparación</th>
                  <th className="pb-2 font-bold text-cocoa-700">Tránsito</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-cream-200/60">
                  <td className="py-2">Producto en stock</td>
                  <td className="py-2">1-2 días</td>
                  <td className="py-2">2-5 días hábiles</td>
                </tr>
                <tr className="border-b border-cream-200/60">
                  <td className="py-2">Producto sobre pedido</td>
                  <td className="py-2">1-3 semanas</td>
                  <td className="py-2">2-5 días hábiles</td>
                </tr>
                <tr>
                  <td className="py-2">Personalización compleja</td>
                  <td className="py-2">3-4 semanas</td>
                  <td className="py-2">2-5 días hábiles</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-cocoa-400">
            Los tiempos de tránsito pueden variar en temporadas altas (Diciembre, Día de las Madres) o por causas ajenas a la paquetería.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">4. Costos de envío</h2>
          <p>
            El costo de envío se calcula al momento del checkout en función del peso del pedido y tu código postal.
            Frecuentemente ofrecemos <strong>envío gratis</strong> en compras superiores a un monto mínimo, anunciado
            en la barra superior del sitio o en nuestras redes.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">5. Confirmación y seguimiento</h2>
          <p>Una vez que tu pedido sale del taller te enviaremos:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Correo electrónico de confirmación con el número de guía.</li>
            <li>Mensaje por WhatsApp (si nos dejaste tu número) con el link de seguimiento.</li>
          </ul>
          <p className="mt-2">
            También puedes consultar el estado de tu pedido en cualquier momento desde <Link href="/pedidos" className="text-blush-500 hover:underline">Mis Pedidos</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">6. Dirección de envío</h2>
          <p>
            Es tu responsabilidad proporcionar una dirección <strong>correcta y completa</strong>: calle, número exterior e
            interior si aplica, colonia, código postal, ciudad y estado. Una dirección errónea puede generar costos extra
            de re-envío que serán cubiertos por el cliente.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">7. Entregas fallidas</h2>
          <p>
            La paquetería intentará entregar tu paquete hasta <strong>2 veces</strong>. Si en el segundo intento no hay
            quien reciba, el paquete regresará al taller. Te avisaremos para programar un re-envío (con costo adicional)
            o cancelar el pedido reembolsando el costo del producto, descontando el envío original.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">8. Daños o pérdida en envío</h2>
          <p>
            Si tu pedido llega <strong>visiblemente dañado</strong>, no firmes el acuse de recibo y reporta el incidente
            de inmediato. Si abriste el paquete y notas daño:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Repórtalo en las primeras <strong>48 horas</strong> después de recibirlo.</li>
            <li>Envíanos fotografías del paquete y del producto dañado por WhatsApp o correo.</li>
            <li>Iniciaremos el reclamo con la paquetería y te enviaremos un reemplazo o reembolso.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">9. Recolección en taller</h2>
          <p>
            Si vives en el área metropolitana de Monterrey y prefieres recoger tu pedido para evitar el envío,
            indícanoslo al hacer el pedido. Coordinaremos un punto y horario.
          </p>
        </section>
      </article>

      <footer className="mt-12 pt-6 border-t border-cream-200 flex flex-wrap gap-3 justify-between items-center">
        <Link href="/" className="text-sm text-cocoa-400 hover:text-blush-400">← Volver al inicio</Link>
        <div className="flex flex-wrap gap-3 text-xs text-cocoa-400">
          <Link href="/aviso-privacidad" className="hover:text-blush-400">Privacidad</Link>
          <span>·</span>
          <Link href="/terminos" className="hover:text-blush-400">Términos</Link>
          <span>·</span>
          <Link href="/devoluciones" className="hover:text-blush-400">Devoluciones</Link>
        </div>
      </footer>
    </div>
  );
}
