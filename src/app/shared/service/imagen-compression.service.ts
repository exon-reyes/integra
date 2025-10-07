import {Injectable} from '@angular/core';

/**
 * Servicio para comprimir imágenes en formato base64 y dentro de contenido HTML
 */
@Injectable({
  providedIn: 'root'
})
export class ImagenCompressionService {
  /**
   * Comprime una imagen en formato base64
   * @param base64 - Cadena base64 de la imagen
   * @param calidad - Calidad de compresión (0-1)
   * @returns Promise con la imagen comprimida en base64
   */
  async comprimirImagenBase64(base64: string, calidad: number): Promise<string> {
    const imagen = await this.cargarImagen(base64);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const maxWidth = 800;
    const scale = Math.min(maxWidth / imagen.width, 1);
    canvas.width = imagen.width * scale;
    canvas.height = imagen.height * scale;

    ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', calidad);
  }

  /**
   * Comprime todas las imágenes base64 encontradas en contenido HTML.
   * Procesa únicamente imágenes con src que inicie con 'data:image' y que no hayan sido previamente comprimidas.
   * Redimensiona automáticamente a un máximo de 800px de ancho manteniendo la proporción.
   *
   * @param html - Contenido HTML con imágenes embebidas
   * @param calidad - Calidad de compresión JPEG (0-1):
   *   - 0.1-0.3: Más compresión, menor calidad, archivos más pequeños
   *   - 0.7-0.9: Menos compresión, mayor calidad, archivos más grandes
   *
   * @example
   * // Compresión alta (archivos pequeños)
   * const htmlComprimido = await service.comprimirImagenesEnHtml(html, 0.2);
   *
   * // Compresión baja (mejor calidad)
   * const htmlComprimido = await service.comprimirImagenesEnHtml(html, 0.8);
   *
   * @returns Promise con el HTML con imágenes comprimidas y marcadas con atributo 'data-comprimida'
   */
  async comprimirImagenesEnHtml(html: string, calidad = 0.5): Promise<string> {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');

    for (const img of images) {
      const src = img.getAttribute('src');
      if (src?.startsWith('data:image') && !img.hasAttribute('data-comprimida')) {
        const comprimida = await this.comprimirImagenBase64(src, calidad);
        img.setAttribute('src', comprimida);
        img.setAttribute('data-comprimida', 'true');
      }
    }

    return doc.body.innerHTML;
  }

  /**
   * Carga una imagen desde base64 en un elemento HTMLImageElement
   * @param base64 - Cadena base64 de la imagen
   * @returns Promise con el elemento de imagen cargado
   */
  private cargarImagen(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base64;
    });
  }
}
