import Link from 'next/link';

export const metadata = {
  title: 'Aviso de Privacidad | Mundo A Crochet',
  description: 'Aviso de Privacidad conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).',
};

const LAST_UPDATE = '3 de mayo de 2026';

export default function AvisoPrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <header className="mb-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-blush-400 mb-3">Documento legal</span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-cocoa-700 mb-3">Aviso de Privacidad</h1>
        <p className="text-sm text-cocoa-400">Última actualización: {LAST_UPDATE}</p>
      </header>

      <article className="space-y-7 text-cocoa-600 text-sm leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">1. Identidad y domicilio del responsable</h2>
          <p>
            <strong>Mundo A Crochet</strong> (en adelante "el Responsable"), con domicilio en Monterrey, Nuevo León, México, es responsable
            del uso, tratamiento y protección de los datos personales que nos proporciones, conforme a la Ley Federal de Protección
            de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
          </p>
          <p className="mt-2">
            Contacto para asuntos de privacidad: <a href="mailto:veroguadalupita@gmail.com" className="text-blush-500 hover:underline">veroguadalupita@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">2. Datos personales que recabamos</h2>
          <p>Para los fines descritos en este aviso recabamos los siguientes datos:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Identificación:</strong> nombre, correo electrónico, número de teléfono.</li>
            <li><strong>Cuenta:</strong> contraseña cifrada (si te registras con email) o foto de perfil (si te registras con Google).</li>
            <li><strong>Dirección de envío:</strong> calle, número, colonia, código postal, ciudad y estado.</li>
            <li><strong>Datos de tu pedido:</strong> productos comprados, fechas, monto, método de pago elegido, comprobante de pago.</li>
            <li><strong>Reseñas y contenido:</strong> texto, calificación y fotos que decidas subir voluntariamente.</li>
          </ul>
          <p className="mt-2">
            <strong>No recabamos datos sensibles</strong> en términos de la LFPDPPP (origen racial, salud, vida sexual, opiniones políticas, religión, etc.).
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">3. Finalidades del tratamiento</h2>
          <p className="font-semibold text-cocoa-700">Finalidades primarias (necesarias para la relación):</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Procesar y enviar tu pedido.</li>
            <li>Confirmar el pago y emitir comprobantes.</li>
            <li>Brindarte atención al cliente y soporte post-venta.</li>
            <li>Cumplir obligaciones legales y fiscales.</li>
          </ul>
          <p className="font-semibold text-cocoa-700 mt-3">Finalidades secundarias (puedes negarte sin afectar tu relación con nosotros):</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Enviarte promociones, novedades y comunicaciones de marketing.</li>
            <li>Solicitarte reseñas de productos comprados.</li>
            <li>Realizar análisis estadísticos sobre el uso de la tienda.</li>
          </ul>
          <p className="mt-2">
            Si no deseas que tus datos se traten para las finalidades secundarias, escríbenos al correo de contacto y procesaremos tu solicitud.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">4. Transferencia de datos</h2>
          <p>Para cumplir con tu pedido podemos compartir datos con terceros estrictamente necesarios:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Empresas de paquetería</strong> (nombre, dirección, teléfono) para entregarte tu pedido.</li>
            <li><strong>Procesadores de pago</strong> si usas pago electrónico, conforme a sus propias políticas de privacidad.</li>
            <li><strong>Proveedores de infraestructura</strong> (hosting, almacenamiento de imágenes, envío de correos transaccionales).</li>
            <li><strong>Autoridades competentes</strong> cuando sea legalmente requerido.</li>
          </ul>
          <p className="mt-2">No vendemos tus datos a terceros bajo ninguna circunstancia.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">5. Derechos ARCO</h2>
          <p>Tienes derecho a:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Acceder</strong> a tus datos personales que tenemos.</li>
            <li><strong>Rectificar</strong> los datos cuando sean inexactos o incompletos.</li>
            <li><strong>Cancelar</strong> tus datos cuando consideres que no los necesitamos para los fines aquí descritos.</li>
            <li><strong>Oponerte</strong> al uso de tus datos para fines específicos.</li>
            <li><strong>Revocar</strong> el consentimiento que nos hayas otorgado.</li>
          </ul>
          <p className="mt-2">
            Para ejercer cualquiera de estos derechos, envíanos un correo a <a href="mailto:veroguadalupita@gmail.com" className="text-blush-500 hover:underline">veroguadalupita@gmail.com</a> indicando:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Tu nombre y correo registrado.</li>
            <li>Identificación oficial (escaneada).</li>
            <li>Descripción clara y precisa del derecho que ejerces.</li>
          </ul>
          <p className="mt-2">Tienes 20 días hábiles de respuesta a partir de que recibamos tu solicitud completa.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">6. Uso de cookies</h2>
          <p>
            Usamos cookies estrictamente necesarias para mantener tu sesión iniciada (NextAuth) y recordar tu carrito. No usamos
            cookies de seguimiento de terceros para publicidad. Puedes desactivar las cookies en tu navegador, aunque algunas
            funcionalidades dejarán de operar correctamente.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">7. Conservación de datos</h2>
          <p>
            Conservamos tus datos durante el tiempo que tu cuenta esté activa y hasta 5 años posteriores a tu última compra
            por obligaciones fiscales y mercantiles, después de lo cual son cancelados de manera segura.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-cocoa-700 mb-2">8. Modificaciones al aviso</h2>
          <p>
            Cualquier cambio relevante a este aviso se publicará en esta misma página con la fecha de la última actualización.
            Te recomendamos revisarla periódicamente.
          </p>
        </section>

        <section className="border-t border-cream-200 pt-6 mt-8">
          <p className="text-xs text-cocoa-400">
            Si tienes dudas sobre tus datos, escríbenos a <a href="mailto:veroguadalupita@gmail.com" className="text-blush-500 hover:underline">veroguadalupita@gmail.com</a>.
            También puedes acudir al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI) en <a href="https://home.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-blush-500 hover:underline">home.inai.org.mx</a>.
          </p>
        </section>
      </article>

      <footer className="mt-12 pt-6 border-t border-cream-200 flex flex-wrap gap-3 justify-between items-center">
        <Link href="/" className="text-sm text-cocoa-400 hover:text-blush-400">← Volver al inicio</Link>
        <div className="flex flex-wrap gap-3 text-xs text-cocoa-400">
          <Link href="/terminos" className="hover:text-blush-400">Términos</Link>
          <span>·</span>
          <Link href="/envios" className="hover:text-blush-400">Envíos</Link>
          <span>·</span>
          <Link href="/devoluciones" className="hover:text-blush-400">Devoluciones</Link>
        </div>
      </footer>
    </div>
  );
}
