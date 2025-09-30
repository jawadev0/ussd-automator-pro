# USSD Automation - Android Setup Guide

## ⚠️ Important Limitations

**Android Security Restrictions:**
- Android 10+ blocks automatic USSD execution for security reasons
- Apps cannot silently execute USSD codes without user interaction
- You'll need to use `Intent.ACTION_CALL` which requires user confirmation

## 📱 Required Permissions

The following permissions are needed in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.PROCESS_OUTGOING_CALLS" />
<uses-permission android:name="android.permission.READ_PHONE_NUMBERS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

## 🔧 Implementation Steps

### 1. Create Capacitor Plugin

You need to create a native Android plugin for USSD execution:

**File: `android/app/src/main/java/com/yourapp/USSDPlugin.java`**

```java
package app.lovable.ussdautomation;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;
import android.telephony.TelephonyManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "USSD",
    permissions = {
        @Permission(strings = { Manifest.permission.CALL_PHONE }),
        @Permission(strings = { Manifest.permission.READ_PHONE_STATE })
    }
)
public class USSDPlugin extends Plugin {

    @PluginMethod
    public void executeUSSD(PluginCall call) {
        String ussdCode = call.getString("code");
        Integer simSlot = call.getInt("simSlot", 0);

        if (ussdCode == null) {
            call.reject("USSD code is required");
            return;
        }

        try {
            // Check for CALL_PHONE permission
            if (!hasRequiredPermissions()) {
                requestAllPermissions(call, "permissionCallback");
                return;
            }

            // Encode the USSD code
            String encodedCode = Uri.encode(ussdCode);
            
            // Create intent to dial USSD
            Intent intent = new Intent(Intent.ACTION_CALL);
            intent.setData(Uri.parse("tel:" + encodedCode));
            
            // For dual SIM support (Android 5.1+)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP_MR1) {
                intent.putExtra("com.android.phone.extra.slot", simSlot);
                intent.putExtra("slot", simSlot);
                intent.putExtra("simSlot", simSlot);
            }
            
            getContext().startActivity(intent);
            call.resolve();
            
        } catch (Exception e) {
            call.reject("Failed to execute USSD: " + e.getMessage());
        }
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        if (hasRequiredPermissions()) {
            call.resolve();
        } else {
            call.reject("Missing required permissions");
        }
    }
}
```

### 2. Register the Plugin

**File: `android/app/src/main/java/com/yourapp/MainActivity.java`**

```java
package app.lovable.ussdautomation;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register the USSD plugin
        registerPlugin(USSDPlugin.class);
    }
}
```

### 3. Update TypeScript Interface

**File: `src/plugins/ussd.ts`**

```typescript
import { registerPlugin } from '@capacitor/core';

export interface USSDPlugin {
  executeUSSD(options: { code: string; simSlot: number }): Promise<void>;
  checkPermissions(): Promise<void>;
}

const USSD = registerPlugin<USSDPlugin>('USSD');

export default USSD;
```

### 4. Runtime Permission Request

In your app, request permissions at runtime:

```typescript
import { Capacitor } from '@capacitor/core';
import USSD from './plugins/ussd';

async function requestUSSDPermissions() {
  if (Capacitor.isNativePlatform()) {
    try {
      await USSD.checkPermissions();
      console.log('Permissions granted');
    } catch (error) {
      console.error('Permission denied:', error);
      // Show user dialog explaining why permissions are needed
    }
  }
}
```

## 🎯 Alternative Approaches

Since full automation is restricted, consider these alternatives:

### Option 1: Semi-Automatic (Recommended)
- App fetches pending USSD from database
- Shows notification to user
- User clicks notification → USSD executes with one tap
- Result captured and saved to database

### Option 2: Accessibility Service (Advanced)
- Create an Accessibility Service that monitors USSD dialogs
- Captures USSD responses automatically
- ⚠️ Requires special permissions and user setup
- ⚠️ Google Play may restrict this approach

### Option 3: Root Access (Not Recommended)
- Requires rooted device
- Can execute USSD silently
- ⚠️ Security risk, breaks warranty
- ⚠️ Not viable for production apps

## 📋 Testing Steps

1. Build and install the app on a physical Android device
2. Grant CALL_PHONE permission when prompted
3. Try executing a USSD code (e.g., *#06# for IMEI)
4. System dialer will open with USSD code pre-filled
5. User must tap "Call" to execute

## 🔗 Resources

- [Android USSD Documentation](https://developer.android.com/reference/android/telephony/TelephonyManager)
- [Capacitor Plugin Guide](https://capacitorjs.com/docs/plugins/creating-plugins)
- [Android Permissions](https://developer.android.com/guide/topics/permissions/overview)

## ⚡ Current Implementation

The current app uses **simulated execution** in the web preview. Once you implement the native plugin above, update `src/components/USSDExecutor.tsx` to use the real USSD plugin instead of the simulation.
