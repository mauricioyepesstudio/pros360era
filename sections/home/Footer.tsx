import Container from "@/components/ui/Container";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#081329] text-white">
      <Container className="py-20">
        <div className="grid gap-14 lg:grid-cols-4">
          <div>
            <h2 className="text-3xl font-bold">
              PROS<span className="text-[#D4A23A]">360</span>ERA
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              Ayudamos a inmigrantes y emprendedores a construir, proteger y
              hacer crecer sus negocios en Estados Unidos.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Servicios</h3>

            <ul className="mt-6 space-y-4 text-slate-400">
              <li>Creación de Empresas</li>
              <li>Taxes &amp; Bookkeeping</li>
              <li>Notary</li>
              <li>Seguros</li>
              <li>Marketing Digital</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Empresa</h3>

            <ul className="mt-6 space-y-4 text-slate-400">
              <li>Nosotros</li>
              <li>Preguntas Frecuentes</li>
              <li>Contacto</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Contacto</h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#D4A23A]" />
                <span>(786) 604-1733</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#D4A23A]" />
                <span>hola@pros360era.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} PROS360ERA MULTISERVICES. Todos los
          derechos reservados.
        </div>
      </Container>
    </footer>
  );
}