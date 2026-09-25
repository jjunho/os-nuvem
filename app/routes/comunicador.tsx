import { useIdioma } from "~/modules/idiomas/idioma";
import { textos } from "~/modules/comunicador/textos";
export default function Comunicador() {
  const { idioma } = useIdioma();
  return <h1>{textos(idioma)("Comunicador")}</h1>;
}
