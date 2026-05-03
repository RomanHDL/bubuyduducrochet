import Link from 'next/link';

export const metadata = {
  title: 'Política de Devoluciones | Mundo A Crochet',
  description: 'Plazos, condiciones y proceso para devolver o cambiar productos comprados en Mundo A Crochet.',
};

const LAST_UPDATE = '3 de mayo de 2026';

export default function DevolucionesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <header className="mb-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Documento legal</span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Política de Devoluciones</h1>
        <p className="text-sm text-cocoa-400">Última actualización: {LAST_UPDATE}</p>
      </header>

      <article className="space-y-7 text-cocoa-600 text-sm leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">1. Resumen rápido</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tienes <strong>7 días naturales</strong> desde que recibes el pedido para reportar un problema.</li>
            <li>Aceptamos devoluciones por <strong>defecto de fabricación</strong>, <strong>daño en envío</strong> o <strong>error nuestro</strong>.</li>
            <li>Productos <strong>personalizados o sobre pedido</strong> no son sujetos a devolución salvo defecto.</li>
            <li>El reembolso se realiza por la misma forma de pago en 5-10 días hábiles tras aprobar la devolución.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">2. Cuándo aplica una devolución</h2>
          <p className="font-semibold text-green-600 mt-3">✅ SÍ aplica devolución/cambio en:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>El producto llegó con defecto de fabricación.</li>
            <li>El producto llegó dañado por la paquetería (con reporte en 48h).</li>
            <li>Recibiste un producto distinto al que ordenaste.</li>
            <li>El producto difiere significativamente de lo mostrado en la página (más allá de variaciones artesanales normales).</li>
          </ul>

          <p className="font-semibold text-red-500 mt-4">❌ NO aplica devolución en:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Productos personalizados o sobre pedido (salvo defecto de fabricación o error nuestro).</li>
            <li>Daño causado por mal uso, lavado incorrecto o manipulación del cliente.</li>
            <li>Diferencias mínimas de color, tamaño o textura propias del trabajo artesanal.</li>
            <li>Reportes hechos después de los 7 días naturales.</li>
            <li>Productos sin etiqueta o señales evidentes de uso.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">3. Proceso de devolución</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Contáctanos</strong> dentro de los 7 días naturales por:
              <ul className="list-disc pl-5 mt-1 text-cocoa-500">
                <li>WhatsApp: 818 708 7288</li>
                <li>Correo: <a href="mailto:veroguadalupita@gmail.com" className="text-blush-500 hover:underline">veroguadalupita@gmail.com</a></li>
              </ul>
            </li>
            <li>
              <strong>Envíanos:</strong>
              <ul className="list-disc pl-5 mt-1 text-cocoa-500">
                <li>Número de pedido.</li>
                <li>Fotografías del problema (producto y empaque).</li>
                <li>Descripción del motivo de la devolución.</li>
              </ul>
            </li>
            <li><strong>Revisamos tu solicitud</strong> en un plazo máximo de 48 horas hábiles y te respondemos.</li>
            <li>
              <strong>Si se aprueba</strong>, te indicaremos cómo regresar el producto:
              <ul className="list-disc pl-5 mt-1 text-cocoa-500">
                <li>Si el problema fue nuestro: cubrimos los costos de envío de regreso.</li>
                <li>Si decides cambiar el producto por otra razón aceptada: el cliente cubre el envío.</li>
              </ul>
            </li>
            <li>
              <strong>Una vez recibido</strong> el producto en buen estado, procesamos tu reembolso o el envío del producto de cambio.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">4. Tiempos y forma del reembolso</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>El reembolso se procesa en un plazo máximo de <strong>5 a 10 días hábiles</strong> después de aprobada la devolución y recibido el producto.</li>
            <li>Te reembolsamos por la misma forma de pago que utilizaste:
              <ul className="list-disc pl-5 mt-1 text-cocoa-500">
                <li>Transferencia: depósito a la misma cuenta o a otra que indiques.</li>
                <li>Depósito: depósito a la cuenta que indiques.</li>
              </ul>
            </li>
            <li>El reembolso incluye el costo del producto. El costo de envío original solo se reembolsa cuando el problema fue de nuestro lado.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">5. Cancelaciones</h2>
          <p>
            Puedes cancelar un pedido <strong>antes de que comencemos a tejerlo o despacharlo</strong> con reembolso completo.
            Una vez iniciada la elaboración de un producto sobre pedido, ya no es posible cancelarlo. Para cancelar contáctanos
            por WhatsApp lo antes posible.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">6. Cuidado del producto</h2>
          <p>
            Para evitar daños, te recomendamos:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Lavado <strong>a mano con agua fría</strong> y jabón neutro.</li>
            <li>Secar a la sombra y en posición horizontal.</li>
            <li>Evitar exposición prolongada al sol directo (puede decolorar el hilo).</li>
            <li>No planchar directamente sobre piezas tejidas.</li>
          </ul>
        </section>
      </article>

      <footer className="mt-12 pt-6 border-t border-cream-200 flex flex-wrap gap-3 justify-between items-center">
        <Link href="/" className="text-sm text-cocoa-400 hover:text-blush-400">← Volver al inicio</Link>
        <div className="flex flex-wrap gap-3 text-xs text-cocoa-400">
          <Link href="/aviso-privacidad" className="hover:text-blush-400">Privacidad</Link>
          <span>·</span>
          <Link href="/terminos" className="hover:text-blush-400">Términos</Link>
          <span>·</span>
          <Link href="/envios" className="hover:text-blush-400">Envíos</Link>
        </div>
      </footer>
    </div>
  );
}
