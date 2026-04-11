import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// ═══ Pinterest catalog — 12 real crochet products ═══
// Images from Roman's Pinterest: https://mx.pinterest.com/romanherrera548/_pins/
// Using originals resolution for best quality

const PRODUCTS = [
  {
    title: 'Osito Amigurumi Clasico',
    description: 'Adorable osito tejido a crochet con hilos de algodon premium. Perfecto para regalar a un bebe o decorar una habitacion infantil. Ojos de seguridad y relleno hipoalergenico. Mide aproximadamente 25cm.',
    price: 350,
    images: ['https://i.pinimg.com/originals/80/ca/fc/80cafc134299705564ee9da8a9f6323a.jpg'],
    stock: 5,
    category: 'amigurumis',
    isActive: true,
    featured: true,
  },
  {
    title: 'Set de Flores Decorativas',
    description: 'Hermoso set de flores tejidas a crochet en tonos pastel. Ideales para decorar repisas, mesas o como centro de mesa. Incluye 3-5 flores surtidas con hojas. Hechas con hilo 100% algodon.',
    price: 280,
    images: ['https://i.pinimg.com/originals/3a/a9/38/3aa9386e72082ffcf093934946e1d801.jpg'],
    stock: 8,
    category: 'decoracion',
    isActive: true,
    featured: true,
  },
  {
    title: 'Conejita con Vestido Rosa',
    description: 'Conejita amigurumi con vestido rosa tejido. Un detalle super tierno para regalar en baby shower, cumpleanos o simplemente para coleccionar. Mide 30cm aproximadamente. Lavable a mano.',
    price: 420,
    images: ['https://i.pinimg.com/originals/f3/bf/85/f3bf85a376d7b2b02a02fe3f5c70887e.jpg'],
    stock: 3,
    category: 'amigurumis',
    isActive: true,
    featured: true,
  },
  {
    title: 'Bolsa Tejida Estilo Boho',
    description: 'Bolsa artesanal tejida a crochet con diseno boho chic. Perfecta para el dia a dia o para la playa. Resistente y con buen espacio interior. Disponible en varios colores.',
    price: 450,
    images: ['https://i.pinimg.com/originals/70/f6/ca/70f6ca3a4fb9aa31dbaa9c19f2e88d1b.jpg'],
    stock: 6,
    category: 'accesorios',
    isActive: true,
    featured: false,
  },
  {
    title: 'Llaveros Amigurumi Mini',
    description: 'Set de llaveros mini amigurumi tejidos a mano. Perfectos para regalar o llevar tus llaves con estilo. Cada llavero mide 6-8cm. Se venden individualmente o en set de 3.',
    price: 120,
    images: ['https://i.pinimg.com/originals/92/c7/b7/92c7b79b469f05079f326c8f25c123fb.jpg'],
    stock: 15,
    category: 'accesorios',
    isActive: true,
    featured: false,
  },
  {
    title: 'Dinosaurio Amigurumi',
    description: 'Divertido dinosaurio tejido a crochet en colores vibrantes. Ideal para ninos y coleccionistas. Materiales seguros e hipoalergenicos. Mide aproximadamente 20cm de largo.',
    price: 380,
    images: ['https://i.pinimg.com/originals/2d/e3/52/2de352c54509968c6cde4dddc7d13020.jpg'],
    stock: 4,
    category: 'amigurumis',
    isActive: true,
    featured: true,
  },
  {
    title: 'Diadema Tejida con Flores',
    description: 'Linda diadema tejida a crochet decorada con flores y hojas. Comoda y ajustable, perfecta para ninas y bebes. Hecha con hilo suave que no irrita la piel.',
    price: 150,
    images: ['https://i.pinimg.com/originals/b5/8c/fe/b58cfef65d08ce5450deaf1c6c65b24b.jpg'],
    stock: 10,
    category: 'accesorios',
    isActive: true,
    featured: false,
  },
  {
    title: 'Gatito Amigurumi Kawaii',
    description: 'Gatito estilo kawaii tejido con todo el carino. Expresion tierna con ojitos bordados. Perfecto para decorar o regalar. Incluye un monito en la cabeza. Mide 22cm.',
    price: 320,
    images: ['https://i.pinimg.com/originals/45/c3/cd/45c3cd9f1f60cdf836c654400bc00ff5.jpg'],
    stock: 5,
    category: 'amigurumis',
    isActive: true,
    featured: true,
  },
  {
    title: 'Cactus Decorativo Tejido',
    description: 'Cactus decorativo tejido a crochet en macetita de barro. Nunca se marchita y siempre se ve bonito! Perfecto para escritorios, repisas o como regalo original. Mide 15cm.',
    price: 200,
    images: ['https://i.pinimg.com/originals/a0/5e/a2/a05ea29c1f9e250f343fc98cb73d676c.jpg'],
    stock: 7,
    category: 'decoracion',
    isActive: true,
    featured: false,
  },
  {
    title: 'Pulpito Reversible de Emociones',
    description: 'Pulpito reversible tejido a crochet — un lado feliz y otro enojado! Juguete sensorial para bebes y ninos. Ayuda a expresar emociones. Colores personalizables. Mide 12cm.',
    price: 180,
    images: ['https://i.pinimg.com/originals/dd/4e/13/dd4e139b715483715633e0c70320910f.jpg'],
    stock: 12,
    category: 'amigurumis',
    isActive: true,
    featured: true,
  },
  {
    title: 'Corona Tejida para Bebe',
    description: 'Corona tejida a crochet para sesiones de fotos o celebraciones de bebes. Suave, ligera y comoda. Ajustable con cintas. Disponible para recien nacidos y hasta 12 meses.',
    price: 130,
    images: ['https://i.pinimg.com/originals/01/68/c2/0168c240b884b616d6cddd7402dcd795.jpg'],
    stock: 8,
    category: 'ropa-bebe',
    isActive: true,
    featured: false,
  },
  {
    title: 'Unicornio Amigurumi Grande',
    description: 'Majestuoso unicornio tejido a crochet con melena de colores arcoiris. Pieza premium de coleccion. Ojos de seguridad, relleno firme. Mide 35cm. El regalo perfecto para cualquier edad.',
    price: 550,
    images: ['https://i.pinimg.com/originals/d2/27/45/d2274567714726207525aaecaae71002.jpg'],
    stock: 2,
    category: 'amigurumis',
    isActive: true,
    featured: true,
  },
];

// GET: seed products (only if DB is empty or force=true)
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    const existing = await Product.countDocuments();

    if (existing > 0 && !force) {
      return NextResponse.json({
        message: `Ya hay ${existing} productos en la base de datos. Usa ?force=true para agregar los 12 productos de Pinterest de todas formas.`,
        count: existing,
      });
    }

    // Insert all products
    const created = await Product.insertMany(PRODUCTS);

    return NextResponse.json({
      message: `${created.length} productos de Pinterest agregados exitosamente al catalogo!`,
      count: created.length,
      products: created.map(p => ({ id: p._id, title: p.title, price: p.price, category: p.category })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
