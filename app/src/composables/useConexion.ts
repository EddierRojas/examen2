import { onUnmounted, ref } from 'vue';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { Network, type ConnectionStatus } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * TODO [M7] Capacidades nativas (6 pts en total: este archivo, PerfilPage.vue y AndroidManifest.xml).
 *
 * useConexion() devuelve { conectado, tipo }:
 *   - Valor inicial con Network.getStatus()                       (@capacitor/network)
 *   - Se actualiza solo con Network.addListener('networkStatusChange', ...)
 *   - El oyente se libera (handle.remove()) cuando se destruye la página que lo usa (onUnmounted).
 *   Las páginas Equipos y Formulario ya muestran el aviso "Sin conexión" y deshabilitan Guardar con `conectado`.
 */
export function useConexion() {
  const conectado = ref(true);
  const tipo = ref('unknown');
  let activo = true;
  let cambio = false;
  let handle: PluginListenerHandle | undefined;
  function actualizar(estado: ConnectionStatus) {
    if (activo) {
      conectado.value = estado.connected;
      tipo.value = estado.connectionType;
    }
  }
  async function iniciar() {
    const listener = await Network.addListener('networkStatusChange', estado => {
      cambio = true;
      actualizar(estado);
    });
    if (!activo) { await listener.remove(); return; }
    handle = listener;
    const inicial = await Network.getStatus();
    if (!cambio) actualizar(inicial);
  }
  void iniciar().catch(console.warn);
  onUnmounted(() => {
    activo = false;
    void handle?.remove();
  });
  return { conectado, tipo };
}

/**
 * TODO [M7] vibrar(): vibración breve de confirmación con Haptics.impact({ style: ImpactStyle.Light })
 *   (@capacitor/haptics). En el navegador NO debe hacer nada: use Capacitor.isNativePlatform().
 *   Se llama después de guardar y de eliminar con éxito.
 */
export async function vibrar() {
  if (Capacitor.isNativePlatform()) {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* Vibración opcional. */ }
  }
}
