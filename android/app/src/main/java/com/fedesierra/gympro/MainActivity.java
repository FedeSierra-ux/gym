package com.fedesierra.gympro;

import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

/**
 * Envoltorio mínimo de la PWA en un WebView. No es un TWA (twa-manifest.json
 * queda para regenerar el proyecto con Bubblewrap cuando se decida); mientras
 * tanto acá se cubre lo que un WebView pelado no hace solo:
 *
 *  - abrir el selector de archivos para <input type="file"> (importar backup,
 *    foto de perfil),
 *  - guardar en Descargas lo que la app ofrece con <a download> (exportar
 *    backup, compartir imagen), que llega como URL blob: o data:,
 *  - mostrar una pantalla "Sin conexión" si la primera carga falla (después
 *    de la primera, el service worker de la PWA ya sirve la app offline),
 *  - abrir en el navegador los links externos (créditos, consola de la API).
 */
public class MainActivity extends ComponentActivity {
    private static final String APP_URL = "https://fedesierra-ux.github.io/gym/";
    private static final String APP_HOST = "fedesierra-ux.github.io";
    private static final int REQ_FILE_CHOOSER = 1;

    private WebView webView;
    private ValueCallback<Uri[]> fileChooserCallback;
    /** true desde que la app cargó bien al menos una vez en esta Activity. */
    private boolean cargoAlgunaVez = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        // Para que target="_blank" llegue a onCreateWindow y se abra afuera.
        settings.setSupportMultipleWindows(true);

        webView.addJavascriptInterface(new PuenteNativo(), "GymProAndroid");
        webView.setWebViewClient(new Cliente());
        webView.setWebChromeClient(new ClienteChrome());
        webView.setDownloadListener(this::alDescargar);

        // Atrás: primero el historial del WebView, después el sistema. Con
        // ComponentActivity esto también cubre el gesto predictivo de Android
        // 13+ (enableOnBackInvokedCallback en el manifest).
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                    return;
                }
                setEnabled(false);
                getOnBackPressedDispatcher().onBackPressed();
            }
        });

        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(APP_URL);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        if (fileChooserCallback != null) {
            fileChooserCallback.onReceiveValue(null);
            fileChooserCallback = null;
        }
        webView.destroy();
        super.onDestroy();
    }

    // ─── Navegación ─────────────────────────────────────────────────────────

    private boolean esDeLaApp(Uri uri) {
        return uri != null && APP_HOST.equalsIgnoreCase(uri.getHost());
    }

    private void abrirAfuera(Uri uri) {
        if (uri == null) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException e) {
            aviso("No hay una app para abrir " + uri);
        }
    }

    private class Cliente extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return manejarNavegacion(request.getUrl());
        }

        @SuppressWarnings("deprecation")
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return manejarNavegacion(Uri.parse(url));
        }

        /** Sólo la app vive adentro del WebView; cualquier otro host va al navegador. */
        private boolean manejarNavegacion(Uri uri) {
            if (uri == null) return false;
            String scheme = uri.getScheme();
            if (("https".equals(scheme) || "http".equals(scheme)) && esDeLaApp(uri)) return false;
            abrirAfuera(uri);
            return true;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            if (url != null && url.startsWith(APP_URL)) cargoAlgunaVez = true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) mostrarSinConexion(request.getUrl());
        }

        @SuppressWarnings("deprecation")
        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            // Android < 6: no distingue frames, pero acá no hay iframes.
            mostrarSinConexion(failingUrl == null ? null : Uri.parse(failingUrl));
        }

        private void mostrarSinConexion(Uri url) {
            // Una vez que la app cargó, el service worker se encarga de servirla
            // offline; sólo la primera carga de la vida de la app puede fallar
            // sin red y dejar el WebView en blanco.
            if (cargoAlgunaVez || !esDeLaApp(url)) return;
            String html = "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
                + "<title>GymPro</title><style>"
                + "body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;"
                + "background:#0C0E14;color:#F2F3F7;font-family:system-ui,sans-serif;text-align:center;padding:24px}"
                + "h1{font-size:22px;margin:0 0 8px}p{color:#9A9FB0;margin:0 0 24px;line-height:1.4}"
                + "button{background:#F26A4B;color:#1A0C08;border:0;border-radius:12px;padding:14px 28px;"
                + "font-size:17px;font-weight:600}"
                + "</style></head><body><div><h1>Sin conexión</h1>"
                + "<p>GymPro necesita internet la primera vez que se abre.<br>Después anda sin conexión.</p>"
                + "<button onclick=\"GymProAndroid.reintentar()\">Reintentar</button></div></body></html>";
            webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
        }
    }

    // ─── Selector de archivos y ventanas nuevas ─────────────────────────────

    private class ClienteChrome extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
            fileChooserCallback = callback;

            Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("*/*");
            String[] acepta = params.getAcceptTypes();
            if (acepta != null && acepta.length > 0) {
                // El accept del <input> mezcla MIME types con extensiones
                // (".heic"): a EXTRA_MIME_TYPES sólo van los MIME.
                List<String> mimes = new ArrayList<>();
                for (String a : acepta) if (a != null && a.contains("/")) mimes.add(a.trim());
                if (!mimes.isEmpty()) intent.putExtra(Intent.EXTRA_MIME_TYPES, mimes.toArray(new String[0]));
            }
            try {
                startActivityForResult(Intent.createChooser(intent, "Elegir archivo"), REQ_FILE_CHOOSER);
            } catch (ActivityNotFoundException e) {
                fileChooserCallback = null;
                callback.onReceiveValue(null);
                aviso("No hay una app para elegir archivos");
                return false;
            }
            return true;
        }

        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            // target="_blank": el WebView nuevo sólo sirve para enterarse de la
            // URL y mandarla al navegador.
            WebView tmp = new WebView(view.getContext());
            tmp.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                    abrirAfuera(request.getUrl());
                    return true;
                }

                @SuppressWarnings("deprecation")
                @Override
                public boolean shouldOverrideUrlLoading(WebView v, String url) {
                    abrirAfuera(Uri.parse(url));
                    return true;
                }
            });
            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
            transport.setWebView(tmp);
            resultMsg.sendToTarget();
            return true;
        }
    }

    @SuppressWarnings("deprecation")
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQ_FILE_CHOOSER || fileChooserCallback == null) return;
        Uri[] resultado = null;
        if (resultCode == RESULT_OK && data != null) {
            resultado = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
        }
        fileChooserCallback.onReceiveValue(resultado);
        fileChooserCallback = null;
    }

    // ─── Descargas ──────────────────────────────────────────────────────────

    private void alDescargar(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        String nombre = URLUtil.guessFileName(url, contentDisposition, mimeType);
        if (url.startsWith("blob:")) {
            // El blob vive en el WebView: lo leemos desde JS y lo pasamos en
            // base64 por el puente nativo.
            String js = "(function(){"
                + "fetch(" + comillas(url) + ").then(function(r){return r.blob()}).then(function(b){"
                + "var fr=new FileReader();"
                + "fr.onload=function(){GymProAndroid.guardarDataUrl(fr.result," + comillas(nombre) + ")};"
                + "fr.onerror=function(){GymProAndroid.error('No se pudo leer el archivo')};"
                + "fr.readAsDataURL(b)})"
                + ".catch(function(e){GymProAndroid.error(String(e))})"
                + "})()";
            webView.evaluateJavascript(js, null);
        } else if (url.startsWith("data:")) {
            guardarDataUrl(url, nombre);
        } else {
            descargarConDownloadManager(url, userAgent, contentDisposition, mimeType, nombre);
        }
    }

    private void descargarConDownloadManager(String url, String userAgent, String contentDisposition, String mimeType, String nombre) {
        try {
            DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
            req.setMimeType(mimeType);
            req.addRequestHeader("User-Agent", userAgent);
            req.setTitle(nombre);
            req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, nombre);
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            dm.enqueue(req);
            aviso("Descargando " + nombre);
        } catch (Exception e) {
            aviso("No se pudo descargar: " + e.getMessage());
        }
    }

    /** Decodifica una URL data: (base64 o percent-encoded) y la guarda en Descargas. */
    private void guardarDataUrl(String dataUrl, String nombre) {
        try {
            int coma = dataUrl.indexOf(',');
            if (!dataUrl.startsWith("data:") || coma < 0) throw new IOException("URL data: inválida");
            String cabecera = dataUrl.substring(5, coma);
            String cuerpo = dataUrl.substring(coma + 1);
            String mime = cabecera.isEmpty() ? "application/octet-stream" : cabecera.split(";")[0];
            if (mime.isEmpty()) mime = "application/octet-stream";
            byte[] bytes = cabecera.endsWith(";base64")
                ? Base64.decode(cuerpo, Base64.DEFAULT)
                : URLDecoder.decode(cuerpo, "UTF-8").getBytes("UTF-8");
            guardarEnDescargas(bytes, mime, nombre);
            aviso("Guardado en Descargas: " + nombre);
        } catch (Exception e) {
            aviso("No se pudo guardar: " + e.getMessage());
        }
    }

    @SuppressWarnings("deprecation")
    private void guardarEnDescargas(byte[] bytes, String mime, String nombre) throws IOException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues valores = new ContentValues();
            valores.put(MediaStore.Downloads.DISPLAY_NAME, nombre);
            valores.put(MediaStore.Downloads.MIME_TYPE, mime);
            valores.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            valores.put(MediaStore.Downloads.IS_PENDING, 1);
            Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, valores);
            if (uri == null) throw new IOException("MediaStore no devolvió URI");
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out == null) throw new IOException("No se pudo abrir el destino");
                out.write(bytes);
            }
            valores.clear();
            valores.put(MediaStore.Downloads.IS_PENDING, 0);
            getContentResolver().update(uri, valores, null, null);
        } else {
            // Android < 10: escribir en la carpeta pública pediría el permiso
            // WRITE_EXTERNAL_STORAGE en tiempo de ejecución. Se usa la carpeta
            // de descargas propia de la app y se registra en el DownloadManager
            // para que aparezca en "Descargas" con su notificación.
            File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            if (dir == null) throw new IOException("Sin almacenamiento externo");
            File destino = new File(dir, nombre);
            try (FileOutputStream out = new FileOutputStream(destino)) {
                out.write(bytes);
            }
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            dm.addCompletedDownload(nombre, "GymPro", true, mime, destino.getAbsolutePath(), bytes.length, true);
        }
    }

    // ─── Puente JS → nativo ─────────────────────────────────────────────────

    private class PuenteNativo {
        @JavascriptInterface
        public void guardarDataUrl(String dataUrl, String nombre) {
            runOnUiThread(() -> MainActivity.this.guardarDataUrl(dataUrl, nombre));
        }

        @JavascriptInterface
        public void error(String mensaje) {
            runOnUiThread(() -> aviso("No se pudo exportar: " + mensaje));
        }

        @JavascriptInterface
        public void reintentar() {
            runOnUiThread(() -> webView.loadUrl(APP_URL));
        }
    }

    // ─── Utilidades ─────────────────────────────────────────────────────────

    private void aviso(String texto) {
        Toast.makeText(this, texto, Toast.LENGTH_SHORT).show();
    }

    /** Literal JS entre comillas, escapando lo que haga falta. */
    private static String comillas(String s) {
        StringBuilder sb = new StringBuilder("'");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '\\': sb.append("\\\\"); break;
                case '\'': sb.append("\\'"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '<': sb.append("\\x3c"); break;
                default: sb.append(c);
            }
        }
        return sb.append('\'').toString();
    }
}
