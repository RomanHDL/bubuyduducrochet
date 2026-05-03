import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones | Mundo A Crochet',
  description: 'Términos y Condiciones de uso de la tienda en línea de Mundo A Crochet.',
};

const LAST_UPDATE = '3 de mayo de 2026';

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <header className="mb-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Documento legal</span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Términos y Condiciones</h1>
        <p className="text-sm text-cocoa-400">Última actualización: {LAST_UPDATE}</p>
      </header>

      <article className="space-y-7 text-cocoa-600 text-sm leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">1. Aceptación</h2>
          <p>
            Al usar este sitio web (mundoacrochet.store) y/o realizar una compra, aceptas íntegramente estos términos y
            condiciones. Si no estás de acuerdo, te pedimos abstenerte de utilizar el sitio.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">2. Capacidad legal</h2>
          <p>
            Para realizar compras debes ser mayor de edad o contar con el consentimiento de un tutor legal. Al registrarte
            confirmas que la información que proporcionas es verdadera y actualizada.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">3. Productos y precios</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Todos los productos son <strong>hechos a mano</strong>. Pueden existir pequeñas variaciones en color, tamaño o textura entre piezas, lo cual es normal y forma parte de su carácter artesanal.</li>
            <li>Las fotografías son ilustrativas; los colores pueden variar ligeramente según el monitor.</li>
            <li>Los precios están expresados en <strong>pesos mexicanos (MXN)</strong> e incluyen los impuestos aplicables.</li>
            <li>Nos reservamos el derecho de modificar precios y disponibilidad sin previo aviso. El precio aplicable será el vigente al momento de confirmar tu pedido.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">4. Forma de compra</h2>
          <p>El proceso de compra se realiza así:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Seleccionas los productos y los agregas al carrito.</li>
            <li>Confirmas datos y método de pago.</li>
            <li>Realizas el pago por el método elegido (transferencia bancaria o depósito).</li>
            <li>Confirmamos tu pago y comenzamos a preparar tu pedido.</li>
            <li>Recibes la guía de seguimiento por correo o WhatsApp.</li>
          </ol>
          <p className="mt-2">
            Un pedido se considera <strong>confirmado</strong> únicamente cuando hayamos recibido y validado tu pago.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">5. Métodos de pago</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Transferencia electrónica (CLABE Banorte).</li>
            <li>Depósito bancario (referencia en OXXO).</li>
            <li>Otros métodos pueden estar disponibles eventualmente y se mostrarán en el checkout.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">6. Envíos</h2>
          <p>
            Los términos completos están en nuestra <Link href="/envios" className="text-blush-500 hover:underline">Política de Envíos</Link>.
            En resumen: enviamos a toda la República Mexicana, con tiempos de 3-5 días hábiles para producto en stock y de 1 a 3 semanas para
            piezas personalizadas.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">7. Devoluciones y reembolsos</h2>
          <p>
            Consulta nuestra <Link href="/devoluciones" className="text-blush-500 hover:underline">Política de Devoluciones</Link>.
            Los productos personalizados o sobre pedido <strong>no son sujetos de devolución</strong> salvo defecto de fabricación o error de nuestra parte.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">8. Propiedad intelectual</h2>
          <p>
            Todos los diseños, fotografías, textos, logotipos y patrones publicados en mundoacrochet.store son propiedad de
            Mundo A Crochet o se utilizan bajo licencia. Está prohibida su reproducción, copia o distribución sin autorización
            expresa por escrito.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">9. Cuenta de usuario</h2>
          <p>
            Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad realizada bajo tu cuenta.
            Notifícanos de inmediato si sospechas un uso no autorizado.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">10. Conducta del usuario</h2>
          <p>No está permitido:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Publicar reseñas con lenguaje ofensivo, falso o difamatorio.</li>
            <li>Suplantar identidad de otra persona.</li>
            <li>Usar el sitio con fines ilegales o no autorizados.</li>
            <li>Intentar vulnerar la seguridad del sitio.</li>
          </ul>
          <p className="mt-2">Nos reservamos el derecho de cancelar cuentas que incumplan estos términos.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">11. Limitación de responsabilidad</h2>
          <p>
            Mundo A Crochet no será responsable por daños indirectos derivados del uso del sitio o sus productos más allá del
            valor pagado por el cliente. La calidad artesanal implica variaciones que no constituyen defecto.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">12. Modificaciones a los términos</h2>
          <p>
            Podemos modificar estos términos en cualquier momento. Las modificaciones se publicarán en esta página con la
            fecha de actualización correspondiente. El uso continuado del sitio implica aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">13. Jurisdicción y ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes vigentes en los Estados Unidos Mexicanos. Cualquier controversia será
            sometida a los tribunales competentes de Monterrey, Nuevo León, renunciando a cualquier otro fuero que pudiera
            corresponder por domicilio presente o futuro.
          </p>
        </section>
      </article>

      <footer className="mt-12 pt-6 border-t border-cream-200 flex flex-wrap gap-3 justify-between items-center">
        <Link href="/" className="text-sm text-cocoa-400 hover:text-blush-400">← Volver al inicio</Link>
        <div className="flex flex-wrap gap-3 text-xs text-cocoa-400">
          <Link href="/aviso-privacidad" className="hover:text-blush-400">Privacidad</Link>
          <span>·</span>
          <Link href="/envios" className="hover:text-blush-400">Envíos</Link>
          <span>·</span>
          <Link href="/devoluciones" className="hover:text-blush-400">Devoluciones</Link>
        </div>
      </footer>
    </div>
  );
}
