package com.spendpulse.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.CookieManager;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.AppTheme_NoActionBar);
        supportRequestWindowFeature(Window.FEATURE_NO_TITLE);
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);

        // Clear all WebView data
        clearAppData();

        // Hide action bar
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }

        // Allow drawing into the notch area
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        // Prevent app preview in Recents and screenshots
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);

        // Configure WebView for mobile use
        setupMobileWebView();
    }

    private void setupMobileWebView() {
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Disable overscroll bounce (feels more native)
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            
            WebSettings settings = webView.getSettings();
            // Force mobile viewport
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            
            // Disable zoom (mobile apps usually don't zoom the whole UI)
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            
            // Improve rendering
            settings.setDomStorageEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            
            // Ensure a mobile User-Agent
            String ua = settings.getUserAgentString();
            if (!ua.contains("Mobile") && !ua.contains("Android")) {
                settings.setUserAgentString(ua + " Mobile Android SpendPulseApp");
            }
        }
    }

    private void clearAppData() {
        try {
            // Clear WebView Cache
            WebView webView = new WebView(this);
            webView.clearCache(true);

            // Clear WebStorage (LocalStorage, SessionStorage)
            WebStorage.getInstance().deleteAllData();

            // Clear Cookies
            CookieManager.getInstance().removeAllCookies(null);
            CookieManager.getInstance().flush();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
